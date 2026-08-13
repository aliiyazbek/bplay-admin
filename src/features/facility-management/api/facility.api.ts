import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { useAuthStore } from '@shared/stores/authStore';
import { getScopeRegions } from '@features/region-management/api';
import {
  buildFacilityListResult,
  computeFacilityStats,
  type AdminScope,
} from './facility.filter';
import {
  toFacility,
  toRegionFacility,
  type BulkActionResult,
  type BulkFacilityAction,
  type CreateFacilityInput,
  type FacilityDocAction,
  type Facility,
  type FacilityDto,
  type FacilityListParams,
  type FacilityListResult,
  type FacilityStats,
  type RegionFacility,
  type UpdateFacilityInput,
} from './facility.types';

const BASE = '/admin/facilities-management';
const FACILITIES_PATH = `${BASE}/facilities`;

/**
 * How many rows to pull when the client must filter and paginate itself.
 *
 * Not unbounded: an explicit ceiling makes truncation a visible, chosen number
 * rather than whatever the server's default happens to be. The endpoint allows
 * up to 100000, so this leaves ample headroom while still being a real limit.
 */
const WORKING_SET = 2000;
const PENDING_PATH = `${BASE}/pending-review`;

function currentScope(): AdminScope {
  const { role, user } = useAuthStore.getState();
  return { role, assignedRegionIds: user?.assignedRegionIds };
}

/**
 * PAGINATION: deliberately CLIENT-SIDE, and paginated exactly once.
 *
 * This list cannot use server paging, and the reason is worth stating so nobody
 * "fixes" it back. After the fetch, `buildFacilityListResult` still applies
 * filters the backend cannot express — `amenities`, `minRating`, `verification`
 * — and, more importantly, the geo REGION SCOPE, which is resolved in the
 * browser from each region's circle. Any of those can drop rows. Paginating on
 * the server first would therefore return "page 2 of 8" and then filter it down
 * to 3, so the count, the page boundaries and the row set would all disagree.
 *
 * The bug this replaces was the opposite mistake: `page`/`pageSize` were
 * forwarded to the server AND the returned page was sliced again locally. With
 * `page=2` the server returned rows 6–10 and the client then sliced that
 * 5-element array from index 5 — a blank table. Paginating twice is always
 * wrong; the fix is to pick one place, not to remove both.
 *
 * So the page params are stripped from the request and a full working set is
 * fetched instead. `pageSize` is capped high server-side (100000) precisely to
 * allow this.
 */
export async function getFacilities(params: FacilityListParams): Promise<FacilityListResult> {
  // Everything except the paging keys: those are applied locally, after the
  // filters the server cannot run.
  const { page: _page, pageSize: _pageSize, ...serverParams } = params;

  const [res, regions] = await Promise.all([
    apiClient.get(FACILITIES_PATH, { params: { ...serverParams, pageSize: WORKING_SET } }),
    getScopeRegions(),
  ]);
  const all = unwrapList<FacilityDto>(res.data, ['facilities']).map(toFacility);
  return buildFacilityListResult(all, params, regions, currentScope());
}

export async function getPendingFacilities(
  params: FacilityListParams,
): Promise<FacilityListResult> {
  return getFacilities({ ...params, status: 'pending' });
}

export async function getFacilityById(id: string): Promise<Facility> {
  const [res, regions] = await Promise.all([
    apiClient.get(`${FACILITIES_PATH}/${id}`),
    getScopeRegions(),
  ]);
  const facility = toFacility(unwrap<FacilityDto>(res.data));
  const visible = buildFacilityListResult(
    [facility],
    { page: 1, pageSize: 1 },
    regions,
    currentScope(),
  );
  if (visible.total === 0) throw new Error('Facility not found');
  return facility;
}

export async function approveFacility(id: string): Promise<void> {
  await apiClient.patch(`${PENDING_PATH}/${id}`, { status: 'approved' });
}

export async function rejectFacility(id: string, reason: string): Promise<void> {
  if (reason.trim().length === 0) throw new Error('Reason is required');
  await apiClient.patch(`${PENDING_PATH}/${id}`, { status: 'rejected', reason: reason.trim() });
}

export async function suspendFacility(id: string, reason: string): Promise<void> {
  if (reason.trim().length === 0) throw new Error('Reason is required');
  await apiClient.patch(`${FACILITIES_PATH}/${id}/suspend`, { reason: reason.trim() });
}

export async function reactivateFacility(id: string): Promise<void> {
  await apiClient.patch(`${FACILITIES_PATH}/${id}/reactivate`);
}

export async function reviewFacilityDocument(
  facilityId: string,
  documentId: string,
  action: FacilityDocAction,
  reason?: string,
): Promise<void> {
  if (action === 'reject' && (!reason || reason.trim().length === 0)) {
    throw new Error('Reason is required');
  }
  await apiClient.patch(`${FACILITIES_PATH}/${facilityId}/documents/${documentId}`, {
    status: action === 'accept' ? 'approved' : 'rejected',
    reason: reason?.trim(),
  });
}

/** The snake_case wire body shared by create (POST) and update (PUT). */
function buildFacilityBody(input: CreateFacilityInput) {
  return {
    owner_id: input.ownerId,
    type: input.kind,
    name: input.name,
    description: input.description,
    sports: input.sports,
    contact_phone: input.contactPhone,
    location: {
      lat: input.location.lat,
      lng: input.location.lng,
      address: input.location.address,
      city: input.location.city,
      governorate: input.location.governorate,
      district: input.location.district,
    },
    working_hours: input.workingHours
      ? Object.fromEntries(
          Object.entries(input.workingHours).map(([day, dayHours]) => [
            day,
            {
              is_open: dayHours.isOpen,
              open_time: dayHours.openTime,
              close_time: dayHours.closeTime,
            },
          ]),
        )
      : undefined,
    courts: input.courts?.map((court) => ({
      id: court.id,
      name: court.name,
      sport: court.sport,
      price_per_hour: court.pricePerHour,
      surface: court.surface,
      is_indoor: court.isIndoor,
      has_lighting: court.hasLighting,
      capacity: court.capacity,
      is_active: court.isActive,
    })),
    price_per_hour: input.pricePerHour,
    capacity: input.capacity,
    specs: input.specs
      ? {
          surface: input.specs.surface,
          is_indoor: input.specs.isIndoor,
          has_lighting: input.specs.hasLighting,
          has_parking: input.specs.hasParking,
          has_locker_room: input.specs.hasLockerRoom,
          has_cafe: input.specs.hasCafe,
        }
      : undefined,
    cancel_policy: input.cancelPolicy
      ? {
          free_hours_before: input.cancelPolicy.freeHoursBefore,
          penalty_percent: input.cancelPolicy.penaltyPercent,
        }
      : undefined,
    images: input.images,
    documents: (input.documents ?? []).map((doc) => ({ name: doc.name, url: doc.url })),
  };
}

export async function createFacility(input: CreateFacilityInput): Promise<Facility> {
  const res = await apiClient.post(FACILITIES_PATH, buildFacilityBody(input));
  return toFacility(unwrap<FacilityDto>(res.data));
}

export async function updateFacility(id: string, input: UpdateFacilityInput): Promise<Facility> {
  const res = await apiClient.put(`${FACILITIES_PATH}/${id}`, buildFacilityBody(input));
  return toFacility(unwrap<FacilityDto>(res.data));
}

export async function bulkAction(
  ids: string[],
  action: BulkFacilityAction,
  reason?: string,
): Promise<BulkActionResult> {
  if (action === 'reject' && (!reason || reason.trim().length === 0)) {
    throw new Error('Reason is required');
  }
  // The route is /facilities/review/bulk, not /pending-review/bulk — the
  // latter does not exist on the backend, so every bulk action 404'd and the
  // fabricated return value below hid it completely.
  const res = await apiClient.patch(`${FACILITIES_PATH}/review/bulk`, {
    ids,
    status: action === 'approve' ? 'approved' : 'rejected',
    reason: reason?.trim(),
  });
  // Report what actually happened. Previously this returned
  // `{ succeeded: ids.length, skipped: [] }` unconditionally, so an admin
  // bulk-approving facilities with unapproved KYC documents was told every one
  // succeeded while the backend had skipped them all.
  const result = unwrap<BulkActionResult>(res.data);
  return {
    succeeded: result?.succeeded ?? 0,
    skipped: result?.skipped ?? [],
  };
}

/** Scope-aware KPI figures — derived client-side over the visible facility set. */
export async function getFacilityStats(): Promise<FacilityStats> {
  const [res, regions] = await Promise.all([
    apiClient.get(FACILITIES_PATH, { params: { pageSize: 1000 } }),
    getScopeRegions(),
  ]);
  const all = unwrapList<FacilityDto>(res.data, ['facilities']).map(toFacility);
  return computeFacilityStats(all, regions, currentScope());
}

/** Facility count per region (keyed by region id) for the region-management screen. */
export async function getRegionFacilityCounts(): Promise<Record<string, number>> {
  const res = await apiClient.get(`${BASE}/region-counts`);
  return unwrap<Record<string, number>>(res.data) ?? {};
}

/** Facility count per owner id (for the owners list facility-count column/filter). */
export async function getFacilityCountsByOwner(): Promise<Record<string, number>> {
  const res = await apiClient.get(`${BASE}/owner-counts`);
  return unwrap<Record<string, number>>(res.data) ?? {};
}

/**
 * The owner block/suspend cascade is applied server-side (the admin only calls
 * the owner status endpoint), so this is a no-op against a real backend.
 */
export function suspendFacilitiesByOwner(_ownerId: string): Promise<void> {
  return Promise.resolve();
}

/**
 * The facilities inside a single region (for the region detail page). The
 * endpoint is already scoped by region, so we just normalise and project —
 * no client-side geo filtering here.
 */
export async function getRegionFacilities(region: {
  id: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}): Promise<RegionFacility[]> {
  const res = await apiClient.get(FACILITIES_PATH, { params: { regionId: region.id } });
  return unwrapList<FacilityDto>(res.data, ['facilities']).map(toFacility).map(toRegionFacility);
}
