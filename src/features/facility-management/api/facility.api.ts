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
/** Approve/reject live under /facilities/review, both singly and in bulk. */
const REVIEW_PATH = `${FACILITIES_PATH}/review`;

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

/**
 * Approve / reject a pending facility.
 *
 * The route is `/facilities/review/:id` — `/pending-review/:id` does not exist
 * on the backend, so every approve and reject 404'd from the dashboard.
 */
export async function approveFacility(id: string): Promise<void> {
  await apiClient.patch(`${REVIEW_PATH}/${id}`, { status: 'approved' });
}

export async function rejectFacility(id: string, reason: string): Promise<void> {
  if (reason.trim().length === 0) throw new Error('Reason is required');
  await apiClient.patch(`${REVIEW_PATH}/${id}`, { status: 'rejected', reason: reason.trim() });
}

/**
 * Suspend and reactivate are ONE endpoint taking a boolean, not two verbs:
 * `PATCH /facilities/:id/suspension { isSuspended }`. The previous
 * `/suspend` + `/reactivate` pair matched no route at all.
 */
export async function suspendFacility(id: string, reason: string): Promise<void> {
  if (reason.trim().length === 0) throw new Error('Reason is required');
  await apiClient.patch(`${FACILITIES_PATH}/${id}/suspension`, {
    isSuspended: true,
    reason: reason.trim(),
  });
}

export async function reactivateFacility(id: string): Promise<void> {
  await apiClient.patch(`${FACILITIES_PATH}/${id}/suspension`, { isSuspended: false });
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

/**
 * Sport SLUG -> UUID.
 *
 * The wizard speaks slugs ('tennis'); every facility route wants the sports
 * table's uuid. `GET /sports` returns both, and `sports.slug` matches
 * `SportType` one-for-one, so the lookup is a straight map.
 *
 * Cached for the session: the list is small, static, and needed by both create
 * paths — refetching it per court would be a request per row.
 */
let sportIdCache: Map<string, string> | null = null;

async function sportIds(): Promise<Map<string, string>> {
  if (sportIdCache) return sportIdCache;
  const res = await apiClient.get('/sports');
  const rows = unwrapList<{ id: string; slug: string }>(res.data, ['sports']);
  sportIdCache = new Map(rows.map((row) => [row.slug, row.id]));
  return sportIdCache;
}

/** Surfaces the backend accepts; anything else is sent as null rather than rejected. */
const SURFACES = new Set([
  'artificial_grass',
  'natural_grass',
  'hard_court',
  'clay',
  'sand',
  'wood',
  'other',
]);

const toSurface = (surface?: string) =>
  surface && SURFACES.has(surface) ? surface : null;

/** The wizard's isIndoor boolean against the backend's environment enum. */
const toEnvironment = (isIndoor?: boolean) => (isIndoor ? 'indoor' : 'outdoor');

/**
 * WorkingHours is Record<dayIndex, DayHours> in the UI and an ARRAY of
 * { dayOfWeek, openTime, closeTime, isClosed } on the wire — note the camelCase
 * here, which is unusual for this API but is what the schema declares.
 */
function toWorkingHours(hours: CreateFacilityInput['workingHours']) {
  return Object.entries(hours ?? {}).map(([day, dayHours]) => ({
    dayOfWeek: Number(day),
    openTime: dayHours.isOpen ? (dayHours.openTime ?? null) : null,
    closeTime: dayHours.isOpen ? (dayHours.closeTime ?? null) : null,
    isClosed: !dayHours.isOpen,
  }));
}

/**
 * A CLUB body — `POST /facilities/clubs`.
 *
 * The body is `additionalProperties: false`, so every key here must be one the
 * schema declares. `description`, `contactPhone` and the club-level amenity
 * flags have nowhere to go and are dropped rather than sent (AJV's
 * removeAdditional would strip them silently anyway; being explicit means the
 * loss is visible in review rather than discovered later).
 */
async function buildClubBody(input: CreateFacilityInput) {
  const ids = await sportIds();
  return {
    owner_id: input.ownerId,
    name: input.name,
    sports: input.sports.map((slug) => ids.get(slug)).filter((id): id is string => Boolean(id)),
    address: input.location.address ?? null,
    latitude: input.location.lat,
    longitude: input.location.lng,
    images: input.images,
    documents: (input.documents ?? []).map((doc) => ({ name: doc.name, url: doc.url })),
    working_hours: toWorkingHours(input.workingHours),
    courts: (input.courts ?? []).map((court) => ({
      name: court.name,
      sport_id: ids.get(court.sport),
      capacity: court.capacity ?? 1,
      price_per_hour: court.pricePerHour,
      surface_type: toSurface(court.surface),
      environment: toEnvironment(court.isIndoor),
      visibility: 'public',
    })),
  };
}

/** A standalone PITCH body — `POST /facilities/pitches`. */
async function buildPitchBody(input: CreateFacilityInput) {
  const ids = await sportIds();
  return {
    owner_id: input.ownerId,
    name: input.name,
    // A pitch is exactly one sport — the first entry, per CreateFacilityInput.
    sport_id: input.sports[0] ? (ids.get(input.sports[0]) ?? null) : null,
    address: input.location.address ?? null,
    latitude: input.location.lat,
    longitude: input.location.lng,
    price_per_hour: input.pricePerHour ?? 0,
    capacity: input.capacity ?? 1,
    specs: {
      surface_type: toSurface(input.specs?.surface),
      environment: toEnvironment(input.specs?.isIndoor),
    },
    ...(input.cancelPolicy
      ? {
          cancel_policy: {
            cancel_free_hours: input.cancelPolicy.freeHoursBefore,
            cancel_penalty_percent: input.cancelPolicy.penaltyPercent,
          },
        }
      : {}),
    images: input.images,
    documents: (input.documents ?? []).map((doc) => ({ name: doc.name, url: doc.url })),
  };
}

/**
 * Create a facility.
 *
 * Creation is TWO endpoints, not one: a club (with courts and working hours)
 * and a standalone pitch (with its own price and capacity) are different
 * shapes, and the backend validates them separately. This used to POST a
 * single merged body to `/facilities`, a route that does not exist — so the
 * Add Facility wizard 404'd on submit no matter what was entered.
 */
export async function createFacility(input: CreateFacilityInput): Promise<Facility> {
  const res =
    input.kind === 'club'
      ? await apiClient.post(`${FACILITIES_PATH}/clubs`, await buildClubBody(input))
      : await apiClient.post(`${FACILITIES_PATH}/pitches`, await buildPitchBody(input));
  return toFacility(unwrap<FacilityDto>(res.data));
}

/**
 * Update a facility — `PUT /facilities/{id}`.
 *
 * One endpoint for both kinds, and every field is optional, so this sends only
 * what the schema declares. Courts and working hours are NOT updatable here;
 * they have their own routes.
 */
export async function updateFacility(id: string, input: UpdateFacilityInput): Promise<Facility> {
  const ids = await sportIds();
  const res = await apiClient.put(`${FACILITIES_PATH}/${id}`, {
    name: input.name,
    address: input.location.address ?? null,
    latitude: input.location.lat,
    longitude: input.location.lng,
    contact_phone: input.contactPhone ?? null,
    sports: input.sports.map((slug) => ids.get(slug)).filter((sid): sid is string => Boolean(sid)),
    ...(input.kind === 'pitch'
      ? {
          price_per_hour: input.pricePerHour ?? null,
          capacity: input.capacity ?? null,
          specs: {
            surface_type: toSurface(input.specs?.surface),
            environment: toEnvironment(input.specs?.isIndoor),
          },
        }
      : {}),
    ...(input.cancelPolicy
      ? {
          cancel_policy: {
            cancel_free_hours: input.cancelPolicy.freeHoursBefore,
            cancel_penalty_percent: input.cancelPolicy.penaltyPercent,
          },
        }
      : {}),
    images: input.images,
    documents: (input.documents ?? []).map((doc) => ({ name: doc.name, url: doc.url })),
  });
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

/** One `{ id, name, count }` bucket as both counts endpoints return them. */
interface CountBucket {
  id: string;
  name?: string;
  count?: number;
}

/**
 * Both counts endpoints return ARRAYS of `{ id, name, count }`, not the
 * `Record<id, number>` these functions used to cast to. The cast silently
 * succeeded and every lookup then returned `undefined`, so the facility-count
 * column and its filter read as blank/zero for every row.
 */
function toCountMap(buckets: CountBucket[] | null | undefined): Record<string, number> {
  if (!Array.isArray(buckets)) return {};
  const map: Record<string, number> = {};
  for (const bucket of buckets) {
    if (bucket?.id) map[bucket.id] = bucket.count ?? 0;
  }
  return map;
}

/**
 * Facility count per region, keyed by region id.
 *
 * The endpoint splits its answer into `{ cities, neighborhoods }`. Regions in
 * this dashboard are backed by either level, so both are merged into one map —
 * ids are UUIDs and cannot collide across the two sets.
 */
export async function getRegionFacilityCounts(): Promise<Record<string, number>> {
  const res = await apiClient.get(`${FACILITIES_PATH}/region-counts`);
  const data = unwrap<{ cities?: CountBucket[]; neighborhoods?: CountBucket[] }>(res.data);
  return { ...toCountMap(data?.cities), ...toCountMap(data?.neighborhoods) };
}

/** Facility count per owner id (for the owners list facility-count column/filter). */
export async function getFacilityCountsByOwner(): Promise<Record<string, number>> {
  const res = await apiClient.get(`${FACILITIES_PATH}/owner-counts`);
  return toCountMap(unwrap<CountBucket[]>(res.data));
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
  // `regionId` filters on the facility's STORED city/neighbourhood, which is
  // what the region actually owns. Deliberately not the browser's circle test:
  // that answers a different question ("do the coordinates fall inside?") and
  // disagrees with the database — a facility can sit outside the drawn circle
  // and still belong to the city, or have no coordinates at all yet still be
  // filed under it. For "the facilities in this region", the stored assignment
  // is the honest answer.
  const res = await apiClient.get(FACILITIES_PATH, {
    params: { regionId: region.id, pageSize: WORKING_SET },
  });
  return unwrapList<FacilityDto>(res.data, ['facilities']).map(toFacility).map(toRegionFacility);
}
