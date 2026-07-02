import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { useAuthStore } from '@shared/stores/authStore';
import { getScopeRegions } from '@features/region-management/api';
import { buildFacilityListResult, type AdminScope } from './facility.filter';
import {
  isAged,
  toFacility,
  toRegionFacility,
  type CreateFacilityInput,
  type Facility,
  type FacilityDto,
  type FacilityListParams,
  type FacilityListResult,
  type RegionFacility,
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

export async function getPendingCount(): Promise<number> {
  const result = await getFacilities({ status: 'pending', page: 1, pageSize: 1 });
  return result.total;
}

/** Scope-wide count of pending submissions older than the aged threshold. */
export async function getAgedCount(): Promise<number> {
  const result = await getFacilities({ status: 'pending', page: 1, pageSize: 500 });
  return result.items.filter((item) => isAged(item.createdAt)).length;
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

export async function createFacility(input: CreateFacilityInput): Promise<Facility> {
  const body = {
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
    document_name: input.documentName,
    document_url: input.documentUrl,
  };
  const res = await apiClient.post(FACILITIES_PATH, body);
  return toFacility(unwrap<FacilityDto>(res.data));
}

/** Facility count per region (keyed by region id) for the region-management screen. */
export async function getRegionFacilityCounts(): Promise<Record<string, number>> {
  const res = await apiClient.get(`${BASE}/region-counts`);
  return unwrap<Record<string, number>>(res.data) ?? {};
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
