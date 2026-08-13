import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateAdmins } from './admin.filter';
import {
  toAdmin,
  type Admin,
  type AdminDto,
  type AdminListParams,
  type AdminListResult,
  type AdminScope,
  type AdminStats,
  type CreateAdminInput,
  type UpdateAdminInput,
} from './admin.types';

const PATH = '/admin/admin-management';

/** Bounded working set for client-side filtering — an explicit, visible cap. */
const WORKING_SET = 2000;
/**
 * PAGINATION: client-side, and applied exactly ONCE.
 *
 * The local pipeline still filters and sorts after the fetch, and either can drop rows —
 * so paginating on the server first would return "page 2 of N" and then filter
 * it down, leaving the count, the page boundaries and the rows disagreeing.
 *
 * The bug this replaces was paginating TWICE: page/pageSize were forwarded to
 * the server AND the returned page was sliced again locally, so page 2 asked
 * the server for rows 6-10 and then sliced that 5-element array from index 5 —
 * a blank table.
 *
 * Page params are therefore stripped from the request and a bounded working set
 * is fetched instead.
 */
export async function getAdmins(params: AdminListParams): Promise<AdminListResult> {
  const { page: _p, pageSize: _ps, ...serverParams } = params;
  const res = await apiClient.get(PATH, { params: { ...serverParams, pageSize: WORKING_SET } });
  const all = unwrapList<AdminDto>(res.data, ['admins']).map(toAdmin);
  return filterAndPaginateAdmins(all, params);
}

/** Platform-wide admin counts — derived client-side until a stats endpoint exists. */
export async function getAdminStats(): Promise<AdminStats> {
  const res = await apiClient.get(PATH, { params: { pageSize: 1000 } });
  const live = unwrapList<AdminDto>(res.data, ['admins'])
    .map(toAdmin)
    .filter((admin) => !admin.isDeleted);
  return {
    total: live.length,
    active: live.filter((admin) => admin.status === 'active').length,
    regional: live.filter((admin) => admin.scope === 'regional').length,
    unassigned: live.filter(
      (admin) => admin.scope === 'regional' && admin.assignedRegionIds.length === 0,
    ).length,
  };
}

/** Fetch a single admin by id (may be soft-deleted — the detail page still shows it). */
export async function getAdminById(id: string): Promise<Admin> {
  const res = await apiClient.get(`${PATH}/${id}`);
  return toAdmin(unwrap<AdminDto>(res.data));
}

export async function createAdmin(input: CreateAdminInput): Promise<Admin> {
  const res = await apiClient.post(PATH, {
    name: input.name,
    email: input.email,
    password: input.password,
    phone: `963${input.phone}`,
    national_id: input.nationalId,
    scope: input.scope,
    region_ids: input.scope === 'regional' ? input.regionIds : [],
  });
  return toAdmin(unwrap<AdminDto>(res.data));
}

export async function updateAdmin(id: string, input: UpdateAdminInput): Promise<Admin> {
  const res = await apiClient.patch(`${PATH}/${id}`, {
    name: input.name,
    email: input.email,
    phone: `963${input.phone}`,
    national_id: input.nationalId,
    scope: input.scope,
    region_ids: input.scope === 'regional' ? input.regionIds : [],
  });
  return toAdmin(unwrap<AdminDto>(res.data));
}

export async function toggleAdminActive(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`${PATH}/is_active/${id}`, { is_active: isActive });
}

/** Promote/demote the oversight tier. */
export async function setAdminScope(id: string, scope: AdminScope): Promise<void> {
  await apiClient.patch(`${PATH}/scope/${id}`, { scope });
}

/** Replace the whole region set for an admin (many-to-many). */
export async function assignRegions(id: string, regionIds: string[]): Promise<void> {
  await apiClient.post(`${PATH}/assign-regions/${id}`, { region_ids: regionIds });
}

/**
 * Reset an admin's credentials. A real backend issues a reset (e.g. emails a
 * link) and never returns a plaintext password — so this stub returns an empty
 * string; the "reveal the original value" flow is a mock-only capability.
 */
export async function resetAdminPassword(id: string): Promise<string> {
  await apiClient.post(`${PATH}/reset-password/${id}`);
  return '';
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiClient.delete(`${PATH}/${id}`);
}

export async function restoreAdmin(id: string): Promise<void> {
  await apiClient.post(`${PATH}/restore/${id}`);
}
