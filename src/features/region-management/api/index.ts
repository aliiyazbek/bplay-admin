import { USE_MOCKS } from '@shared/lib/mock';
import * as real from './region.api';
import * as mock from './region.api.mock';

const impl = USE_MOCKS ? mock : real;

export const getRegions = impl.getRegions;
export const getRegionById = impl.getRegionById;
export const getScopeRegions = impl.getScopeRegions;
export const createRegion = impl.createRegion;
export const updateRegion = impl.updateRegion;
export const toggleRegionActive = impl.toggleRegionActive;
export const assignAdmins = impl.assignAdmins;
export const deleteRegion = impl.deleteRegion;
export const restoreRegion = impl.restoreRegion;
