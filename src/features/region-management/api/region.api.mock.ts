import { mockDelay } from '@shared/lib/mock';
import { filterAndPaginateRegions } from './region.filter';
import type {
  Region,
  RegionListParams,
  RegionListResult,
  CreateRegionInput,
  UpdateRegionInput,
} from './region.types';

// In-memory mutable db: mutations persist for the session and a refetch sees them.
let seq = 500;

interface CitySeed {
  id: string;
  name: string;
  isActive: boolean;
  adminId?: string;
  adminName?: string;
}

const CITIES: CitySeed[] = [
  { id: 'c1', name: 'Damascus', isActive: true, adminId: '100', adminName: 'Sara Haddad' },
  { id: 'c2', name: 'Aleppo', isActive: true, adminId: '101', adminName: 'Omar Khoury' },
  { id: 'c3', name: 'Homs', isActive: true },
  { id: 'c4', name: 'Latakia', isActive: true, adminId: '102', adminName: 'Lina Nasser' },
  { id: 'c5', name: 'Hama', isActive: false },
  { id: 'c6', name: 'Tartus', isActive: true },
];

interface NeighborhoodSeed {
  id: string;
  name: string;
  cityId: string;
  isActive: boolean;
  adminId?: string;
  adminName?: string;
}

const NEIGHBORHOODS: NeighborhoodSeed[] = [
  { id: 'n1', name: 'Mezzeh', cityId: 'c1', isActive: true, adminId: '104', adminName: 'Rana Suleiman' },
  { id: 'n2', name: 'Malki', cityId: 'c1', isActive: true },
  { id: 'n3', name: 'Bab Touma', cityId: 'c1', isActive: false },
  { id: 'n4', name: 'Al-Aziziyah', cityId: 'c2', isActive: true, adminId: '105', adminName: 'Tarek Mansour' },
  { id: 'n5', name: 'Al-Sabil', cityId: 'c2', isActive: true },
  { id: 'n6', name: 'Al-Waer', cityId: 'c3', isActive: true },
  { id: 'n7', name: 'Al-Ziraa', cityId: 'c4', isActive: true, adminId: '107', adminName: 'Ziad Halabi' },
  { id: 'n8', name: 'Al-Suwayqah', cityId: 'c5', isActive: false },
  { id: 'n9', name: 'Al-Rawda', cityId: 'c6', isActive: true },
  { id: 'n10', name: 'Al-Qusour', cityId: 'c1', isActive: true },
];

let dateCounter = 0;
function seedDate(): string {
  dateCounter += 1;
  return new Date(2025, 0, dateCounter).toISOString();
}

const db: Region[] = [
  ...CITIES.map<Region>((city) => ({
    id: city.id,
    name: city.name,
    type: 'city',
    isActive: city.isActive,
    status: city.isActive ? 'active' : 'inactive',
    assignedAdminId: city.adminId,
    assignedAdminName: city.adminName,
    createdAt: seedDate(),
  })),
  ...NEIGHBORHOODS.map<Region>((n) => ({
    id: n.id,
    name: n.name,
    type: 'neighborhood',
    cityId: n.cityId,
    isActive: n.isActive,
    status: n.isActive ? 'active' : 'inactive',
    assignedAdminId: n.adminId,
    assignedAdminName: n.adminName,
    createdAt: seedDate(),
  })),
];

export async function getRegions(params: RegionListParams): Promise<RegionListResult> {
  await mockDelay();
  return filterAndPaginateRegions([...db], params);
}

export async function createRegion(input: CreateRegionInput): Promise<Region> {
  await mockDelay();
  const region: Region = {
    id: String((seq += 1)),
    name: input.name,
    type: input.type,
    cityId: input.type === 'neighborhood' ? input.cityId : undefined,
    isActive: true,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  db.unshift(region);
  return region;
}

export async function updateRegion(id: string, input: UpdateRegionInput): Promise<Region> {
  await mockDelay();
  const region = db.find((item) => item.id === id);
  if (!region) throw new Error('Region not found');
  region.name = input.name;
  region.type = input.type;
  region.cityId = input.type === 'neighborhood' ? input.cityId : undefined;
  return region;
}

export async function toggleRegionActive(id: string, isActive: boolean): Promise<void> {
  await mockDelay();
  const region = db.find((item) => item.id === id);
  if (region) {
    region.isActive = isActive;
    region.status = isActive ? 'active' : 'inactive';
  }
}

export async function assignAdmin(
  id: string,
  adminId: string,
  adminName?: string,
): Promise<void> {
  await mockDelay();
  const region = db.find((item) => item.id === id);
  if (region) {
    region.assignedAdminId = adminId;
    region.assignedAdminName = adminName;
  }
}

export async function deleteRegion(id: string): Promise<void> {
  await mockDelay();
  const index = db.findIndex((item) => item.id === id);
  if (index !== -1) db.splice(index, 1);
}
