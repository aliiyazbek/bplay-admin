import { mockDelay } from '@shared/lib/mock';
import { filterAndPaginateAdmins } from './admin.filter';
import type {
  Admin,
  AdminListParams,
  AdminListResult,
  CreateAdminInput,
  UpdateAdminInput,
} from './admin.types';

// In-memory mutable db: mutations persist for the session and a refetch sees them.
let seq = 200;

const SEED: Array<[string, string, boolean]> = [
  ['Sara Haddad', 'sara.haddad@bplay.app', true],
  ['Omar Khoury', 'omar.khoury@bplay.app', true],
  ['Lina Nasser', 'lina.nasser@bplay.app', true],
  ['Karim Aziz', 'karim.aziz@bplay.app', false],
  ['Rana Suleiman', 'rana.suleiman@bplay.app', true],
  ['Tarek Mansour', 'tarek.mansour@bplay.app', true],
  ['Maya Fares', 'maya.fares@bplay.app', false],
  ['Ziad Halabi', 'ziad.halabi@bplay.app', true],
  ['Nour Kassem', 'nour.kassem@bplay.app', true],
  ['Hadi Rahal', 'hadi.rahal@bplay.app', true],
  ['Dina Saab', 'dina.saab@bplay.app', false],
  ['Fadi Barakat', 'fadi.barakat@bplay.app', true],
  ['Yasmin Deeb', 'yasmin.deeb@bplay.app', true],
  ['Samer Wehbe', 'samer.wehbe@bplay.app', true],
];

const db: Admin[] = SEED.map(([name, email, isActive], index) => ({
  id: String(100 + index),
  name,
  email,
  role: 'admin',
  isActive,
  status: isActive ? 'active' : 'suspended',
  createdAt: new Date(2025, 0, index + 1).toISOString(),
}));

export async function getAdmins(params: AdminListParams): Promise<AdminListResult> {
  await mockDelay();
  return filterAndPaginateAdmins([...db], params);
}

export async function createAdmin(input: CreateAdminInput): Promise<Admin> {
  await mockDelay();
  const admin: Admin = {
    id: String((seq += 1)),
    name: input.name,
    email: input.email,
    role: 'admin',
    isActive: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  db.unshift(admin);
  return admin;
}

export async function updateAdmin(id: string, input: UpdateAdminInput): Promise<Admin> {
  await mockDelay();
  const admin = db.find((item) => item.id === id);
  if (!admin) throw new Error('Admin not found');
  admin.name = input.name;
  admin.email = input.email;
  return admin;
}

export async function toggleAdminActive(id: string, isActive: boolean): Promise<void> {
  await mockDelay();
  const admin = db.find((item) => item.id === id);
  if (admin) {
    admin.isActive = isActive;
    admin.status = isActive ? 'active' : 'suspended';
  }
}

export async function deleteAdmin(id: string): Promise<void> {
  await mockDelay();
  const index = db.findIndex((item) => item.id === id);
  if (index !== -1) db.splice(index, 1);
}
