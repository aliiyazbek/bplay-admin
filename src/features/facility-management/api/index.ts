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
} from './facility.types';
export {
  FACILITY_STATUSES,
  FACILITY_KINDS,
  FACILITY_LEGEND_STATUSES,
  facilityStatusTone,
  facilityRegionSeed,
} from './facility.types';

export const getFacilities = impl.getFacilities;
export const getPendingFacilities = impl.getPendingFacilities;
export const getPendingCount = impl.getPendingCount;
export const getAgedCount = impl.getAgedCount;
export const getFacilityById = impl.getFacilityById;
export const approveFacility = impl.approveFacility;
export const rejectFacility = impl.rejectFacility;
export const suspendFacility = impl.suspendFacility;
export const reactivateFacility = impl.reactivateFacility;
export const createFacility = impl.createFacility;
export const getRegionFacilityCounts = impl.getRegionFacilityCounts;
export const getRegionFacilities = impl.getRegionFacilities;
