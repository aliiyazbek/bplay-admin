export type OwnerStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'blocked'
  | 'active'
  | 'inactive';

export type OwnerVerificationStatus = 'pending' | 'review' | 'approved' | 'rejected';

export type OwnerTrustTier = 'basic' | 'verified' | 'premium';

/** The action a super-admin can PATCH onto a pending-verification owner. */
export type OwnerAction = 'approve' | 'reject' | 'activate' | 'disable' | 'block';

export interface OwnerDocument {
  id: string;
  name: string;
  status: string;
  url: string;
}

export interface Owner {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: OwnerStatus;
  verificationStatus: OwnerVerificationStatus;
  trustTier: OwnerTrustTier;
  isActive: boolean;
  region: string;
  documents: OwnerDocument[];
  createdAt?: string;
}

/** The raw backend shape (field names vary — normalised by toOwner). */
export interface OwnerDto {
  id?: string | number;
  _id?: string;
  owner_id?: string | number;
  ownerId?: string | number;
  name?: string;
  full_name?: string;
  owner_name?: string;
  user?: { name?: string; fullName?: string; email?: string; phone?: string } | null;
  email?: string;
  email_address?: string;
  phone?: string;
  phone_number?: string;
  mobile?: string;
  status?: string;
  verification_status?: string;
  verificationStatus?: string;
  document_status?: string;
  trust_tier?: string;
  trustTier?: string;
  is_active?: boolean;
  isActive?: boolean;
  region?: string;
  region_name?: string;
  assigned_region?: string;
  documents?: Array<{
    id?: string | number;
    _id?: string;
    document_id?: string | number;
    name?: string;
    document_name?: string;
    status?: string;
    verification_status?: string;
    url?: string;
    file_url?: string;
  }>;
  created_at?: string;
  createdAt?: string;
}

const OWNER_STATUSES: OwnerStatus[] = [
  'pending',
  'approved',
  'rejected',
  'blocked',
  'active',
  'inactive',
];

const VERIFICATION_STATUSES: OwnerVerificationStatus[] = [
  'pending',
  'review',
  'approved',
  'rejected',
];

const TRUST_TIERS: OwnerTrustTier[] = ['basic', 'verified', 'premium'];

function normalizeStatus(value: string | undefined, fallback: OwnerStatus): OwnerStatus {
  const s = (value ?? '').toLowerCase();
  return (OWNER_STATUSES as string[]).includes(s) ? (s as OwnerStatus) : fallback;
}

function normalizeVerification(value: string | undefined): OwnerVerificationStatus {
  const s = (value ?? '').toLowerCase();
  return (VERIFICATION_STATUSES as string[]).includes(s)
    ? (s as OwnerVerificationStatus)
    : 'pending';
}

function normalizeTier(value: string | undefined): OwnerTrustTier {
  const s = (value ?? '').toLowerCase();
  return (TRUST_TIERS as string[]).includes(s) ? (s as OwnerTrustTier) : 'basic';
}

export function toOwner(dto: OwnerDto): Owner {
  const verificationStatus = normalizeVerification(
    dto.verification_status ?? dto.verificationStatus ?? dto.document_status ?? dto.status,
  );
  const isActive =
    typeof dto.is_active === 'boolean'
      ? dto.is_active
      : typeof dto.isActive === 'boolean'
        ? dto.isActive
        : dto.status
          ? dto.status.toLowerCase() === 'active'
          : verificationStatus === 'approved';
  const status = normalizeStatus(dto.status ?? dto.verification_status, isActive ? 'active' : 'pending');

  const documents: OwnerDocument[] = Array.isArray(dto.documents)
    ? dto.documents.map((document, index) => ({
        id: String(document.id ?? document._id ?? document.document_id ?? index),
        name: document.name ?? document.document_name ?? 'Document',
        status: (document.status ?? document.verification_status ?? 'pending').toLowerCase(),
        url: document.url ?? document.file_url ?? '',
      }))
    : [];

  return {
    id: String(dto.id ?? dto._id ?? dto.owner_id ?? dto.ownerId ?? ''),
    name: dto.name ?? dto.full_name ?? dto.owner_name ?? dto.user?.name ?? dto.user?.fullName ?? '',
    email: dto.email ?? dto.email_address ?? dto.user?.email ?? '',
    phone: dto.phone ?? dto.phone_number ?? dto.mobile ?? dto.user?.phone ?? '',
    status,
    verificationStatus,
    trustTier: normalizeTier(dto.trust_tier ?? dto.trustTier),
    isActive,
    region: dto.region ?? dto.region_name ?? dto.assigned_region ?? '',
    documents,
    createdAt: dto.createdAt ?? dto.created_at,
  };
}

export interface OwnerListParams {
  q?: string;
  status?: 'all' | OwnerStatus;
  page?: number;
  pageSize?: number;
}

export interface OwnerListResult {
  items: Owner[];
  total: number;
  page: number;
  pageCount: number;
}
