import { filterPaginate } from '@shared/lib/paginate';
import { haversineKm } from '@shared/lib/geo';
import { resolveDateRange } from '@ui';
import type { UserRole } from '@shared/stores/authStore';
import type { Region } from '@features/region-management/api/region.types';
import {
  isAged,
  toFacilityListItem,
  type Facility,
  type FacilityListItem,
  type FacilityListParams,
  type FacilityListResult,
  type FacilityStats,
} from './facility.types';

/** The signed-in admin's visibility scope (read from the auth store by the api layer). */
export interface AdminScope {
  role: UserRole | null;
  assignedRegionIds?: string[];
}

/** A region that can scope facilities: active + a full geo circle. */
interface GeoRegion extends Region {
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

function isGeoRegion(region: Region): region is GeoRegion {
  return (
    typeof region.centerLat === 'number' &&
    typeof region.centerLng === 'number' &&
    typeof region.radiusKm === 'number'
  );
}

/** Only ACTIVE regions with geo ever scope — an inactive city (e.g. Hama) never counts. */
function activeGeoRegions(regions: Region[]): GeoRegion[] {
  return regions.filter((region): region is GeoRegion => region.isActive && isGeoRegion(region));
}

function contains(region: GeoRegion, facility: Facility): boolean {
  return (
    haversineKm(
      { lat: facility.location.lat, lng: facility.location.lng },
      { lat: region.centerLat, lng: region.centerLng },
    ) <= region.radiusKm
  );
}

/** Names of ALL active geo regions containing the facility (overlap allowed); orphan = none. */
export function computeMembership(
  facility: Facility,
  regions: Region[],
): { regionNames: string[]; isOrphan: boolean } {
  const containing = activeGeoRegions(regions).filter((region) => contains(region, facility));
  return { regionNames: containing.map((region) => region.name), isOrphan: containing.length === 0 };
}

interface ScopedEntry {
  item: FacilityListItem;
  containingIds: string[];
}

/** Project every facility to a scoped entry (region membership + orphan flag). */
function buildEntries(facilities: Facility[], regions: Region[]): ScopedEntry[] {
  const geoRegions = activeGeoRegions(regions);
  return facilities.map((facility) => {
    const containing = geoRegions.filter((region) => contains(region, facility));
    return {
      containingIds: containing.map((region) => region.id),
      item: toFacilityListItem(
        facility,
        containing.map((region) => region.name),
        containing.length === 0,
      ),
    };
  });
}

/**
 * Apply role visibility: super_admin sees everything (orphans included); an admin
 * with assigned regions sees only facilities inside ≥1 of their (active, geo)
 * regions — never orphans; an admin with no assigned regions (general oversight)
 * sees all non-orphan facilities.
 */
function applyScope(entries: ScopedEntry[], scope: AdminScope): ScopedEntry[] {
  const assignedRegionIds = scope.assignedRegionIds ?? [];
  if (scope.role === 'super_admin') return entries;
  if (scope.role === 'admin' && assignedRegionIds.length > 0) {
    const assigned = new Set(assignedRegionIds);
    return entries.filter((entry) => entry.containingIds.some((id) => assigned.has(id)));
  }
  return entries.filter((entry) => !entry.item.isOrphan);
}

function scopedEntries(facilities: Facility[], regions: Region[], scope: AdminScope): ScopedEntry[] {
  return applyScope(buildEntries(facilities, regions), scope);
}

function compareBy(a: FacilityListItem, b: FacilityListItem, sortBy: FacilityListParams['sortBy']): number {
  switch (sortBy) {
    case 'name':
      return a.name.localeCompare(b.name);
    case 'rating':
      return (a.rating ?? 0) - (b.rating ?? 0);
    case 'createdAt':
    default:
      return Date.parse(a.createdAt) - Date.parse(b.createdAt);
  }
}

/**
 * The single scope + filter + sort + paginate pipeline shared by the real and
 * mock sources.
 */
export function buildFacilityListResult(
  facilities: Facility[],
  params: FacilityListParams,
  regions: Region[],
  scope: AdminScope,
): FacilityListResult {
  let entries = scopedEntries(facilities, regions, scope);

  const q = params.q?.trim().toLowerCase();
  if (q) {
    entries = entries.filter(
      (entry) =>
        entry.item.name.toLowerCase().includes(q) ||
        entry.item.ownerName.toLowerCase().includes(q),
    );
  }
  const status = params.status;
  if (status && status !== 'all') {
    entries = entries.filter((entry) => entry.item.status === status);
  }
  const kind = params.kind;
  if (kind && kind !== 'all') {
    entries = entries.filter((entry) => entry.item.kind === kind);
  }
  const sport = params.sport;
  if (sport && sport !== 'all') {
    entries = entries.filter((entry) => entry.item.sports.includes(sport));
  }
  const regionId = params.regionId;
  if (regionId && regionId !== 'all') {
    entries =
      regionId === 'orphans'
        ? entries.filter((entry) => entry.item.isOrphan)
        : entries.filter((entry) => entry.containingIds.includes(regionId));
  }
  const ownerId = params.ownerId;
  if (ownerId && ownerId !== 'all') {
    entries = entries.filter((entry) => entry.item.ownerId === ownerId);
  }
  const source = params.source;
  if (source && source !== 'all') {
    entries = entries.filter((entry) => entry.item.source === source);
  }
  const minRating = params.minRating;
  if (typeof minRating === 'number') {
    entries = entries.filter(
      (entry) => typeof entry.item.rating === 'number' && entry.item.rating >= minRating,
    );
  }
  const governorate = params.governorate;
  if (governorate && governorate !== 'all') {
    entries = entries.filter((entry) => entry.item.governorate === governorate);
  }
  const city = params.city?.trim().toLowerCase();
  if (city) {
    entries = entries.filter((entry) => (entry.item.city ?? '').toLowerCase().includes(city));
  }
  const verification = params.verification;
  if (verification && verification !== 'all') {
    entries = entries.filter((entry) => entry.item.verification === verification);
  }
  const amenities = params.amenities;
  if (amenities && amenities.length > 0) {
    entries = entries.filter((entry) =>
      amenities.every((amenity) => entry.item.amenities.includes(amenity)),
    );
  }
  const dateRange = params.dateRange;
  if (dateRange && dateRange.preset !== 'all') {
    const { fromMs, toMs } = resolveDateRange(dateRange, Date.now());
    entries = entries.filter((entry) => {
      const created = Date.parse(entry.item.createdAt);
      if (fromMs !== null && created < fromMs) return false;
      if (toMs !== null && created > toMs) return false;
      return true;
    });
  }

  if (params.sortBy) {
    const dir = params.sortDir === 'asc' ? 1 : -1;
    entries = [...entries].sort((a, b) => compareBy(a.item, b.item, params.sortBy) * dir);
  }

  return filterPaginate(
    entries.map((entry) => entry.item),
    params,
  );
}

/** Scope-aware KPI aggregate over the visible facility set (ignores param filters). */
export function computeFacilityStats(
  facilities: Facility[],
  regions: Region[],
  scope: AdminScope,
): FacilityStats {
  const items = scopedEntries(facilities, regions, scope).map((entry) => entry.item);
  const rated = items.filter((item) => typeof item.rating === 'number');
  const avgRating = rated.length
    ? rated.reduce((sum, item) => sum + (item.rating ?? 0), 0) / rated.length
    : 0;
  return {
    total: items.length,
    active: items.filter((item) => item.status === 'active').length,
    pending: items.filter((item) => item.status === 'pending').length,
    suspended: items.filter(
      (item) => item.status === 'suspended' || item.status === 'owner_suspended',
    ).length,
    rejected: items.filter((item) => item.status === 'rejected').length,
    avgRating: Math.round(avgRating * 10) / 10,
    aged: items.filter((item) => item.status === 'pending' && isAged(item.createdAt)).length,
    orphan: items.filter((item) => item.isOrphan).length,
  };
}
