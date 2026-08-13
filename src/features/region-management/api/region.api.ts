import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateRegions } from './region.filter';
import {
  toRegion,
  type Region,
  type RegionDto,
  type RegionListParams,
  type RegionListResult,
  type RegionStats,
  type CreateRegionInput,
  type UpdateRegionInput,
} from './region.types';

const REGIONS_PATH = '/admin/regions';

/**
 * PAGINATION: client-side by design, and correct as written.
 *
 * Unlike the other list clients, this one never forwarded page/pageSize to the
 * server, so it was not affected by the double-pagination bug. It must stay that way: getScopeRegions() below reads the SAME endpoint and nine other slices depend on it returning the COMPLETE set to resolve their region scope. A paginated response there would silently narrow scoping across the whole dashboard.
 */
export async function getRegions(params: RegionListParams): Promise<RegionListResult> {
  const res = await apiClient.get(REGIONS_PATH);
  const regions = unwrapList<RegionDto>(res.data, ['regions']).map(toRegion);
  return filterAndPaginateRegions(regions, params);
}

/** Fetch a single region by id (may be soft-deleted — the detail page still shows it). */
export async function getRegionById(id: string): Promise<Region> {
  const res = await apiClient.get(`${REGIONS_PATH}/${id}`);
  return toRegion(unwrap<RegionDto>(res.data));
}

/** Platform-wide region counts — derived client-side until a stats endpoint exists. */
export async function getRegionStats(): Promise<RegionStats> {
  const res = await apiClient.get(REGIONS_PATH);
  const live = unwrapList<RegionDto>(res.data, ['regions'])
    .map(toRegion)
    .filter((region) => !region.isDeleted);
  return {
    total: live.length,
    active: live.filter((region) => region.isActive).length,
    unassigned: live.filter((region) => region.assignedAdminIds.length === 0).length,
  };
}

/** Live regions with a geo circle (deleted ones never scope); callers filter isActive. */
export async function getScopeRegions(): Promise<Region[]> {
  const res = await apiClient.get(REGIONS_PATH);
  return unwrapList<RegionDto>(res.data, ['regions'])
    .map(toRegion)
    .filter(
      (region) =>
        !region.isDeleted &&
        typeof region.centerLat === 'number' &&
        typeof region.centerLng === 'number' &&
        typeof region.radiusKm === 'number',
    );
}

export async function createRegion(input: CreateRegionInput): Promise<Region> {
  const res = await apiClient.post(REGIONS_PATH, {
    name: input.name,
    center_lat: input.centerLat,
    center_lng: input.centerLng,
    radius_km: input.radiusKm,
  });
  return toRegion(unwrap<RegionDto>(res.data));
}

export async function updateRegion(id: string, input: UpdateRegionInput): Promise<Region> {
  const res = await apiClient.patch(`${REGIONS_PATH}/${id}`, {
    name: input.name,
    center_lat: input.centerLat,
    center_lng: input.centerLng,
    radius_km: input.radiusKm,
  });
  return toRegion(unwrap<RegionDto>(res.data));
}

export async function toggleRegionActive(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`${REGIONS_PATH}/is_active/${id}`, { is_active: isActive });
}

/** Replace the whole admin assignment (many-to-many). Names are display-only here. */
export async function assignAdmins(
  id: string,
  adminIds: string[],
  _adminNames: string[],
): Promise<void> {
  await apiClient.post(`${REGIONS_PATH}/assign/${id}`, { admin_ids: adminIds });
}

export async function deleteRegion(id: string): Promise<void> {
  await apiClient.delete(`${REGIONS_PATH}/${id}`);
}

export async function restoreRegion(id: string): Promise<void> {
  await apiClient.post(`${REGIONS_PATH}/restore/${id}`);
}
