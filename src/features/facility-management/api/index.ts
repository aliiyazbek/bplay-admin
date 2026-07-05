import { USE_MOCKS } from '@shared/lib/mock';
import * as real from './facility.api';
import * as mock from './facility.api.mock';

const impl = USE_MOCKS ? mock : real;

export type {
  Facility,
  FacilityKind,
  FacilityStatus,
  FacilityLocation,
  FacilityStatistics,
  RegionFacility,
  FacilityRegionSeed,
  FacilityListItem,
  FacilityListParams,
  FacilityListResult,
  FacilityStats,
  FacilityAmenity,
  FacilityVerification,
  FacilitySortBy,
  CreateFacilityInput,
  UpdateFacilityInput,
  CourtInput,
  BulkFacilityAction,
  BulkActionResult,
} from './facility.types';
export {
  FACILITY_STATUSES,
  FACILITY_KINDS,
  FACILITY_LEGEND_STATUSES,
  FACILITY_AMENITIES,
  FACILITY_VERIFICATIONS,
  facilityStatusTone,
  facilityRegionSeed,
} from './facility.types';

export const getFacilities = impl.getFacilities;
export const getPendingFacilities = impl.getPendingFacilities;
export const getFacilityStats = impl.getFacilityStats;
export const getFacilityById = impl.getFacilityById;
export const approveFacility = impl.approveFacility;
export const rejectFacility = impl.rejectFacility;
export const suspendFacility = impl.suspendFacility;
export const reactivateFacility = impl.reactivateFacility;
export const createFacility = impl.createFacility;
export const updateFacility = impl.updateFacility;
export const bulkAction = impl.bulkAction;
export const getRegionFacilityCounts = impl.getRegionFacilityCounts;
export const getFacilityCountsByOwner = impl.getFacilityCountsByOwner;
export const suspendFacilitiesByOwner = impl.suspendFacilitiesByOwner;
export const getRegionFacilities = impl.getRegionFacilities;
