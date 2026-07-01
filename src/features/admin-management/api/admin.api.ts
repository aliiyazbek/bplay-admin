import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateAdmins } from './admin.filter';
import {
  toAdmin,
  type Admin,
  type AdminDto,
  type AdminListParams,
  type AdminListResult,
  type CreateAdminInput,
  type UpdateAdminInput,
} from './admin.types';

const PATH = '/admin/admin-management';

export async function getAdmins(params: AdminListParams): Promise<AdminListResult> {
  const res = await apiClient.get(PATH, { params });
  const all = unwrapList<AdminDto>(res.data, ['admins']).map(toAdmin);
  return filterAndPaginateAdmins(all, params);
}

export async function createAdmin(input: CreateAdminInput): Promise<Admin> {
  const res = await apiClient.post(PATH, input);
  return toAdmin(unwrap<AdminDto>(res.data));
}

export async function updateAdmin(id: string, input: UpdateAdminInput): Promise<Admin> {
  const res = await apiClient.patch(`${PATH}/${id}`, input);
  return toAdmin(unwrap<AdminDto>(res.data));
}

export async function toggleAdminActive(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`${PATH}/is_active/${id}`, { is_active: isActive });
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiClient.delete(`${PATH}/${id}`);
}
