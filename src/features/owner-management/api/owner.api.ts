import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateOwners } from './owner.filter';
import {
  toOwner,
  type CreatedOwner,
  type CreateOwnerInput,
  type Owner,
  type OwnerAction,
  type OwnerDocAction,
  type OwnerDto,
  type OwnerListParams,
  type OwnerListResult,
  type OwnerStats,
} from './owner.types';

const BASE = '/admin/owners-management';
const OWNERS_PATH = `${BASE}/owners`;

export async function getOwners(params: OwnerListParams): Promise<OwnerListResult> {
  const res = await apiClient.get(OWNERS_PATH, { params });
  const all = unwrapList<OwnerDto>(res.data, ['owners']).map(toOwner);
  return filterAndPaginateOwners(all, params);
}

export async function getOwnerById(id: string): Promise<Owner> {
  const res = await apiClient.get(`${OWNERS_PATH}/${id}`);
  return toOwner(unwrap<OwnerDto>(res.data));
}

export async function getOwnerStats(): Promise<OwnerStats> {
  // Derived client-side from the full list until a dedicated stats endpoint exists.
  const res = await apiClient.get(OWNERS_PATH, { params: { pageSize: 1000 } });
  const all = unwrapList<OwnerDto>(res.data, ['owners']).map(toOwner);
  return {
    total: all.length,
    underReview: all.filter((o) => o.accountStatus === 'under_review' && !o.isBlocked).length,
    active: all.filter((o) => o.accountStatus === 'active' && !o.isBlocked).length,
    blocked: all.filter((o) => o.isBlocked).length,
  };
}

export async function updateOwnerStatus(
  id: string,
  action: OwnerAction,
  reason?: string,
): Promise<void> {
  await apiClient.patch(`${OWNERS_PATH}/${id}/status`, { action, reason });
}

export async function reviewOwnerDocument(
  id: string,
  documentId: string,
  action: OwnerDocAction,
  reason?: string,
): Promise<void> {
  await apiClient.patch(`${OWNERS_PATH}/${id}/documents/${documentId}`, { action, reason });
}

export async function createOwner(input: CreateOwnerInput): Promise<CreatedOwner> {
  const res = await apiClient.post(OWNERS_PATH, {
    name: input.name,
    email: input.email,
    phone: `963${input.phone}`,
    national_id: input.nationalId,
    intended_facility_type: input.intendedFacilityType,
    region: input.region,
  });
  const data = unwrap<OwnerDto & { temp_password?: string }>(res.data);
  return { owner: toOwner(data), tempPassword: data.temp_password ?? '' };
}
