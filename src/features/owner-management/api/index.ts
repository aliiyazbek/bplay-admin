import { USE_MOCKS } from '@shared/lib/mock';
import * as real from './owner.api';
import * as mock from './owner.api.mock';

const impl = USE_MOCKS ? mock : real;

export const getOwners = impl.getOwners;
export const getOwnerById = impl.getOwnerById;
export const updateOwnerStatus = impl.updateOwnerStatus;
