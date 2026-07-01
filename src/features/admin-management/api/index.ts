import { USE_MOCKS } from '@shared/lib/mock';
import * as real from './admin.api';
import * as mock from './admin.api.mock';

const impl = USE_MOCKS ? mock : real;

export const getAdmins = impl.getAdmins;
export const createAdmin = impl.createAdmin;
export const updateAdmin = impl.updateAdmin;
export const toggleAdminActive = impl.toggleAdminActive;
export const deleteAdmin = impl.deleteAdmin;
