import { mockDelay } from '@shared/lib/mock';
import { filterAndPaginateOwners } from './owner.filter';
import type {
  Owner,
  OwnerAction,
  OwnerListParams,
  OwnerListResult,
  OwnerStatus,
  OwnerTrustTier,
  OwnerVerificationStatus,
} from './owner.types';

// In-memory mutable db: mutations persist for the session and a refetch sees them.
interface Seed {
  name: string;
  email: string;
  phone: string;
  status: OwnerStatus;
  verificationStatus: OwnerVerificationStatus;
  trustTier: OwnerTrustTier;
  region: string;
  withDocs: boolean;
}

const SEED: Seed[] = [
  { name: 'Fadi Barakat', email: 'fadi.barakat@bplay.app', phone: '+963 933 100 201', status: 'pending', verificationStatus: 'pending', trustTier: 'basic', region: 'Damascus', withDocs: true },
  { name: 'Rana Suleiman', email: 'rana.suleiman@bplay.app', phone: '+963 944 220 118', status: 'pending', verificationStatus: 'review', trustTier: 'basic', region: 'Aleppo', withDocs: true },
  { name: 'Omar Khoury', email: 'omar.khoury@bplay.app', phone: '+963 955 330 447', status: 'approved', verificationStatus: 'approved', trustTier: 'verified', region: 'Homs', withDocs: true },
  { name: 'Lina Nasser', email: 'lina.nasser@bplay.app', phone: '+963 966 440 552', status: 'active', verificationStatus: 'approved', trustTier: 'premium', region: 'Latakia', withDocs: false },
  { name: 'Karim Aziz', email: 'karim.aziz@bplay.app', phone: '+963 977 550 663', status: 'rejected', verificationStatus: 'rejected', trustTier: 'basic', region: 'Tartus', withDocs: true },
  { name: 'Maya Fares', email: 'maya.fares@bplay.app', phone: '+963 988 660 774', status: 'blocked', verificationStatus: 'approved', trustTier: 'verified', region: 'Damascus', withDocs: false },
  { name: 'Ziad Halabi', email: 'ziad.halabi@bplay.app', phone: '+963 933 770 885', status: 'inactive', verificationStatus: 'approved', trustTier: 'basic', region: 'Hama', withDocs: false },
  { name: 'Nour Kassem', email: 'nour.kassem@bplay.app', phone: '+963 944 880 996', status: 'pending', verificationStatus: 'pending', trustTier: 'basic', region: 'Daraa', withDocs: true },
  { name: 'Hadi Rahal', email: 'hadi.rahal@bplay.app', phone: '+963 955 990 107', status: 'active', verificationStatus: 'approved', trustTier: 'verified', region: 'Aleppo', withDocs: true },
  { name: 'Dina Saab', email: 'dina.saab@bplay.app', phone: '+963 966 101 218', status: 'approved', verificationStatus: 'approved', trustTier: 'premium', region: 'Damascus', withDocs: false },
  { name: 'Tarek Mansour', email: 'tarek.mansour@bplay.app', phone: '+963 977 212 329', status: 'pending', verificationStatus: 'review', trustTier: 'basic', region: 'Homs', withDocs: true },
  { name: 'Yasmin Deeb', email: 'yasmin.deeb@bplay.app', phone: '+963 988 323 430', status: 'active', verificationStatus: 'approved', trustTier: 'verified', region: 'Latakia', withDocs: false },
  { name: 'Samer Wehbe', email: 'samer.wehbe@bplay.app', phone: '+963 933 434 541', status: 'rejected', verificationStatus: 'rejected', trustTier: 'basic', region: 'Idlib', withDocs: true },
  { name: 'Sara Haddad', email: 'sara.haddad@bplay.app', phone: '+963 944 545 652', status: 'blocked', verificationStatus: 'approved', trustTier: 'basic', region: 'Tartus', withDocs: false },
];

const db: Owner[] = SEED.map((seed, index) => ({
  id: String(300 + index),
  name: seed.name,
  email: seed.email,
  phone: seed.phone,
  status: seed.status,
  verificationStatus: seed.verificationStatus,
  trustTier: seed.trustTier,
  isActive: seed.status === 'active' || seed.status === 'approved',
  region: seed.region,
  documents: seed.withDocs
    ? [
        { id: `${300 + index}-1`, name: 'National ID', status: seed.verificationStatus, url: 'https://example.com/docs/national-id.pdf' },
        { id: `${300 + index}-2`, name: 'Business License', status: seed.verificationStatus, url: 'https://example.com/docs/business-license.pdf' },
      ]
    : [],
  createdAt: new Date(2025, 3, index + 1).toISOString(),
}));

function applyAction(owner: Owner, action: OwnerAction): void {
  switch (action) {
    case 'approve':
      owner.status = 'approved';
      owner.verificationStatus = 'approved';
      owner.isActive = true;
      break;
    case 'reject':
      owner.status = 'rejected';
      owner.verificationStatus = 'rejected';
      owner.isActive = false;
      break;
    case 'activate':
      owner.status = 'active';
      owner.isActive = true;
      break;
    case 'disable':
      owner.status = 'inactive';
      owner.isActive = false;
      break;
    case 'block':
      owner.status = 'blocked';
      owner.isActive = false;
      break;
  }
}

export async function getOwners(params: OwnerListParams): Promise<OwnerListResult> {
  await mockDelay();
  return filterAndPaginateOwners([...db], params);
}

export async function getOwnerById(id: string): Promise<Owner> {
  await mockDelay();
  const owner = db.find((item) => item.id === id);
  if (!owner) throw new Error('Owner not found');
  return { ...owner, documents: owner.documents.map((doc) => ({ ...doc })) };
}

export async function updateOwnerStatus(id: string, action: OwnerAction): Promise<void> {
  await mockDelay();
  const owner = db.find((item) => item.id === id);
  if (owner) applyAction(owner, action);
}
