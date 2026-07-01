import { USE_MOCKS } from '@shared/lib/mock';
import * as real from './region.api';
import * as mock from './region.api.mock';

const impl = USE_MOCKS ? mock : real;

export const getRegions = impl.getRegions;
export const createRegion = impl.createRegion;
export const updateRegion = impl.updateRegion;
export const toggleRegionActive = impl.toggleRegionActive;
export const assignAdmin = impl.assignAdmin;
export const deleteRegion = impl.deleteRegion;
