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
const PENDING_PATH = `${BASE}/pending-review`;

function currentScope(): AdminScope {
  const { role, user } = useAuthStore.getState();
  return { role, assignedRegionIds: user?.assignedRegionIds };
}

export async function getFacilities(params: FacilityListParams): Promise<FacilityListResult> {
  const [res, regions] = await Promise.all([
    apiClient.get(FACILITIES_PATH, { params }),
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
  await apiClient.patch(`${PENDING_PATH}/bulk`, {
    ids,
    status: action === 'approve' ? 'approved' : 'rejected',
    reason: reason?.trim(),
  });
  return { succeeded: ids.length, skipped: [] };
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
