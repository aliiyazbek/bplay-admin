import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { getFacilities } from '@features/facility-management/api';
import {
  buildFacilityScopeIndex,
  buildMembershipListResult,
  computeMembershipStats,
  type FacilityScopeIndex,
} from './membership.filter';
import {
  toMembership,
  type Membership,
  type MembershipDto,
  type MembershipListParams,
  type MembershipListResult,
  type MembershipStats,
} from './membership.types';

const BASE = '/admin/subscriptions';

/** The clubs the signed-in admin may oversee, derived from the facility scope. */
async function scopeIndex(): Promise<FacilityScopeIndex> {
  const { items } = await getFacilities({ kind: 'club', page: 1, pageSize: 1000 });
  return buildFacilityScopeIndex(items);
}

export async function getMemberships(params: MembershipListParams): Promise<MembershipListResult> {
  const [res, idx] = await Promise.all([apiClient.get(BASE, { params }), scopeIndex()]);
  const all = unwrapList<MembershipDto>(res.data, ['subscriptions']).map(toMembership);
  return buildMembershipListResult(all, params, idx, Date.now());
}

export async function getMembershipById(id: string): Promise<Membership> {
  const [res, idx] = await Promise.all([apiClient.get(`${BASE}/${id}`), scopeIndex()]);
  const membership = toMembership(unwrap<MembershipDto>(res.data));
  if (!idx.visibleIds.has(membership.clubId)) throw new Error('Membership not found');
  return membership;
}

export async function getMembershipStats(): Promise<MembershipStats> {
  const [res, idx] = await Promise.all([
    apiClient.get(BASE, { params: { pageSize: 1000 } }),
    scopeIndex(),
  ]);
  const all = unwrapList<MembershipDto>(res.data, ['subscriptions']).map(toMembership);
  return computeMembershipStats(all, idx, Date.now());
}
