import { filterPaginate } from '@shared/lib/paginate';
import type { Owner, OwnerListParams, OwnerListResult } from './owner.types';

/** Shared search + status filter + pagination (used by both the real and mock sources). */
export function filterAndPaginateOwners(all: Owner[], params: OwnerListParams): OwnerListResult {
  let items = all;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (owner) =>
        owner.name.toLowerCase().includes(q) || owner.email.toLowerCase().includes(q),
    );
  }
  if (params.status && params.status !== 'all') {
    items = items.filter((owner) => owner.status === params.status);
  }
  return filterPaginate(items, params);
}
