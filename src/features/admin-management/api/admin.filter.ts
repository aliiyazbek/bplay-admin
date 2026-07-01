import { filterPaginate } from '@shared/lib/paginate';
import type { Admin, AdminListParams, AdminListResult } from './admin.types';

/** Shared search + status filter + pagination (used by both the real and mock sources). */
export function filterAndPaginateAdmins(all: Admin[], params: AdminListParams): AdminListResult {
  let items = all;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    items = items.filter(
      (admin) => admin.name.toLowerCase().includes(q) || admin.email.toLowerCase().includes(q),
    );
  }
  if (params.status && params.status !== 'all') {
    items = items.filter((admin) => admin.status === params.status);
  }
  return filterPaginate(items, params);
}
