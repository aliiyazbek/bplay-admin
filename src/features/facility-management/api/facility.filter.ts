import { filterPaginate } from '@shared/lib/paginate';
import { haversineKm } from '@shared/lib/geo';
import type { UserRole } from '@shared/stores/authStore';
import type { Region } from '@features/region-management/api/region.types';
import {
  toFacilityListItem,
  type Facility,
  type FacilityListItem,
  type FacilityListParams,
  type FacilityListResult,
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

/**
 * The single scope + filter + paginate pipeline shared by the real and mock sources.
 *
 * Visibility: super_admin sees everything (orphans included); an admin with assigned
 * regions sees only facilities inside ≥1 of their (active, geo) regions — never orphans;
 * an admin with no assigned regions (general oversight) sees all non-orphan facilities.
 */
export function buildFacilityListResult(
  facilities: Facility[],
  params: FacilityListParams,
  regions: Region[],
  scope: AdminScope,
): FacilityListResult {
  const geoRegions = activeGeoRegions(regions);

  let entries: ScopedEntry[] = facilities.map((facility) => {
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

  const assignedRegionIds = scope.assignedRegionIds ?? [];
  if (scope.role === 'super_admin') {
    // Everything, orphans included.
  } else if (scope.role === 'admin' && assignedRegionIds.length > 0) {
    const assigned = new Set(assignedRegionIds);
    entries = entries.filter((entry) => entry.containingIds.some((id) => assigned.has(id)));
  } else {
    // General oversight (and any non-super session): all non-orphan facilities.
    entries = entries.filter((entry) => !entry.item.isOrphan);
  }

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
  const minRating = params.minRating;
  if (typeof minRating === 'number') {
    entries = entries.filter(
      (entry) => typeof entry.item.rating === 'number' && entry.item.rating >= minRating,
    );
  }

  return filterPaginate(
    entries.map((entry) => entry.item),
    params,
  );
}
