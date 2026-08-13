import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { getFacilities } from '@features/facility-management/api';
import {
  buildBookingListResult,
  buildFacilityScopeIndex,
  computeBookingStats,
  type FacilityScopeIndex,
} from './booking.filter';
import {
  toBooking,
  type Booking,
  type BookingDto,
  type BookingListParams,
  type BookingListResult,
  type BookingStats,
} from './booking.types';

const BASE = '/admin/bookings';

/**
 * The scope oracle: the caller's already-scoped facility list, indexed. Bookings
 * are then filtered/projected against it client-side (mirrors facility-management).
 */
async function scopeIndex(): Promise<FacilityScopeIndex> {
  const { items } = await getFacilities({ page: 1, pageSize: 1000 });
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
export async function getBookings(params: BookingListParams): Promise<BookingListResult> {
  const { page: _p, pageSize: _ps, ...serverParams } = params;
  const [res, idx] = await Promise.all([
    apiClient.get(BASE, { params: { ...serverParams, pageSize: WORKING_SET } }),
    scopeIndex(),
  ]);
  const all = unwrapList<BookingDto>(res.data, ['bookings']).map(toBooking);
  return buildBookingListResult(all, params, idx);
}

export async function getBookingById(id: string): Promise<Booking> {
  const [res, idx] = await Promise.all([apiClient.get(`${BASE}/${id}`), scopeIndex()]);
  const booking = toBooking(unwrap<BookingDto>(res.data));
  // Re-check scope on the single fetch too: a booking at a facility outside the
  // admin's visible set must 404, not leak (mirrors membership/facility api).
  if (!idx.visibleIds.has(booking.facilityId)) throw new Error('Booking not found');
  return booking;
}

/** Scope-aware KPI figures — derived client-side over the visible booking set. */
export async function getBookingStats(): Promise<BookingStats> {
  const [res, idx] = await Promise.all([
    apiClient.get(BASE, { params: { pageSize: 1000 } }),
    scopeIndex(),
  ]);
  const all = unwrapList<BookingDto>(res.data, ['bookings']).map(toBooking);
  return computeBookingStats(all, idx);
}
