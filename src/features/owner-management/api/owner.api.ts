import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateOwners } from './owner.filter';
import {
  toOwner,
  type Owner,
  type OwnerAction,
  type OwnerDto,
  type OwnerListParams,
  type OwnerListResult,
} from './owner.types';

const BASE = '/admin/owners-management';
const OWNERS_PATH = `${BASE}/owners`;
const PENDING_PATH = `${BASE}/pending-verification`;

export async function getOwners(params: OwnerListParams): Promise<OwnerListResult> {
  const res = await apiClient.get(OWNERS_PATH, { params });
  const all = unwrapList<OwnerDto>(res.data, ['owners']).map(toOwner);
  return filterAndPaginateOwners(all, params);
}

export async function getOwnerById(id: string): Promise<Owner> {
  const res = await apiClient.get(`${PENDING_PATH}/${id}`);
  return toOwner(unwrap<OwnerDto>(res.data));
}

export async function updateOwnerStatus(id: string, action: OwnerAction): Promise<void> {
  await apiClient.patch(`${PENDING_PATH}/${id}`, { action });
}
