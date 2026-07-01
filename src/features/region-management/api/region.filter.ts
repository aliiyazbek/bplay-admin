import { filterPaginate } from '@shared/lib/paginate';
import type { Region, RegionListParams, RegionListResult } from './region.types';

/** Shared search + type filter + pagination (used by both the real and mock sources). */
export function filterAndPaginateRegions(
  all: Region[],
  params: RegionListParams,
): RegionListResult {
  let items = all;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (region) =>
        region.name.toLowerCase().includes(q) ||
        (region.assignedAdminName?.toLowerCase().includes(q) ?? false),
    );
  }
  if (params.type && params.type !== 'all') {
    items = items.filter((region) => region.type === params.type);
  }
  return filterPaginate(items, params);
}
