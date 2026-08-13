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

/** Bounded working set for client-side filtering — an explicit, visible cap. */
const WORKING_SET = 2000;
/**
 * PAGINATION: client-side, and applied exactly ONCE.
 *
 * The local pipeline still applies the region scope after the fetch, and either can drop rows —
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
export async function getMemberships(params: MembershipListParams): Promise<MembershipListResult> {
  const { page: _p, pageSize: _ps, ...serverParams } = params;
  const [res, idx] = await Promise.all([
    apiClient.get(BASE, { params: { ...serverParams, pageSize: WORKING_SET } }),
    scopeIndex(),
  ]);
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
