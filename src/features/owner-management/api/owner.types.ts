/**
 * Owner Management — domain types.
 *
 * Mirrors the Bplay mobile owner contract 1:1 so go-live is a flag flip:
 *   - AccountStatus (account_status): under_review | active | suspended  (admin
 *     also records `rejected` as a review outcome — see the normalizer note).
 *   - DocReviewStatus (per document): under_review | accepted | rejected (+reason)
 *   - OwnerDocumentType: national_id | business_license | tax_certificate |
 *     ownership_proof | other
 *   - trust_score is an INTEGER 0–100 (there is no "tier" enum on the wire; the
 *     tier label is derived for display only, per admin SRS OW6 read-only).
 * `isBlocked` is a separate, permanent ban (super-admin), orthogonal to the
 * account status.
 */

import type { BadgeVariant } from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';

/** Runtime account lifecycle. `rejected` is the admin's review-denied outcome. */
export type OwnerAccountStatus = 'under_review' | 'active' | 'rejected' | 'suspended';

/** The single-glance state shown as the primary badge (account status + ban). */
export type OwnerState = OwnerAccountStatus | 'blocked';

/** Verification document category (wire `type` / upload `docType`). */
export type OwnerDocType =
  | 'national_id'
  | 'business_license'
  | 'tax_certificate'
  | 'ownership_proof'
  | 'other';

/** Per-document review status. */
export type OwnerDocStatus = 'under_review' | 'accepted' | 'rejected';

/** The facility type the owner intends to open (picked at signup). */
export type OwnerFacilityIntent = 'sports_club' | 'independent_court';

/** Account-level status actions a super-admin can apply to an owner. */
export type OwnerAction = 'approve' | 'reject' | 'suspend' | 'activate' | 'block' | 'unblock';

/** Per-document review decisions. */
export type OwnerDocAction = 'accept' | 'reject';

export interface OwnerDocument {
  id: string;
  type: OwnerDocType;
  status: OwnerDocStatus;
  /** Admin note explaining a rejection (shown to the owner, who may re-upload). */
  rejectionReason?: string;
  url: string;
  /** Drives the viewer branch — an inline image vs an embedded PDF/file. */
  kind: 'image' | 'pdf';
  uploadedAt?: string;
}

export interface Owner {
  id: string;
  /** Owner-editable display name. */
  name: string;
  /** Legal identity name (KYC, read-only). */
  legalName?: string;
  email: string;
  phone: string;
  nationalId?: string;
  dateOfBirth?: string;
  photoUrl?: string;
  city?: string;
  address?: string;
  bio?: string;
  /** Optional business website / link the owner added to their profile. */
  link?: string;
  intendedFacilityType?: OwnerFacilityIntent;
  /** Denormalised region label (derived from the owner's facilities). */
  region: string;
  accountStatus: OwnerAccountStatus;
  /** Reason for the current rejected / suspended account state (admin note). */
  statusReason?: string;
  /** Permanent ban (super-admin) — orthogonal to accountStatus. */
  isBlocked: boolean;
  /** Reason for the ban — kept separate from statusReason so neither clobbers the other. */
  blockedReason?: string;
  /** Reputation, 0–100 (admin-controlled, read-only here). */
  trustScore: number;
  /** Summed monthly revenue across the owner's facilities (FIN, read-only). */
  monthlyRevenueSyp?: number;
  /** Number of facilities this owner owns (hydrated for the list). */
  facilitiesCount?: number;
  documents: OwnerDocument[];
  /** Join date. */
  createdAt?: string;
}

/** The single account state shown as the primary state badge. */
export function ownerState(owner: Owner): OwnerState {
  return owner.isBlocked ? 'blocked' : owner.accountStatus;
}

/** Map an owner state to a shared status token for the Badge variant. */
const STATE_STATUS_KEY: Record<OwnerState, string> = {
  under_review: 'review',
  active: 'active',
  rejected: 'rejected',
  suspended: 'suspended',
  blocked: 'blocked',
};
export function ownerStateBadgeVariant(state: OwnerState): BadgeVariant {
  return statusToBadgeVariant(STATE_STATUS_KEY[state]);
}

/** Per-document status → Badge variant. */
const DOC_STATUS_KEY: Record<OwnerDocStatus, string> = {
  under_review: 'review',
  accepted: 'approved',
  rejected: 'rejected',
};
export function ownerDocBadgeVariant(status: OwnerDocStatus): BadgeVariant {
  return statusToBadgeVariant(DOC_STATUS_KEY[status]);
}

/** Read-only trust tier derived from the 0–100 score (display label only). */
export type OwnerTrustTier = 'basic' | 'verified' | 'trusted';
export function ownerTrustTier(score: number): OwnerTrustTier {
  if (score >= 85) return 'trusted';
  if (score >= 60) return 'verified';
  return 'basic';
}
export const OWNER_TRUST_VARIANT: Record<OwnerTrustTier, BadgeVariant> = {
  basic: 'neutral',
  verified: 'info',
  trusted: 'success',
};

/** Platform-wide owner counts for the list KPI row. */
export interface OwnerStats {
  total: number;
  underReview: number;
  active: number;
  blocked: number;
}

// ---------------------------------------------------------------------------
// Wire DTO (snake_case, mirrors owner_profile_model.dart) + normaliser
// ---------------------------------------------------------------------------

export interface OwnerDocumentDto {
  id?: string | number;
  type?: string;
  doc_type?: string;
  status?: string;
  verification_status?: string;
  rejection_reason?: string;
  url?: string;
  file_url?: string;
  mime_type?: string;
  uploaded_at?: string;
}

export interface OwnerDto {
  id?: string | number;
  _id?: string;
  user_id?: string | number;
  owner_id?: string | number;
  ownerId?: string | number;
  name?: string;
  legal_name?: string;
  full_name?: string;
  email?: string;
  email_address?: string;
  phone?: string;
  phone_number?: string;
  national_id?: string;
  nationalId?: string;
  date_of_birth?: string;
  avatar_url?: string;
  photo_url?: string;
  city?: string;
  address?: string;
  bio?: string;
  link?: string;
  website?: string;
  intended_facility_type?: string;
  facility_type?: string;
  region?: string;
  region_name?: string;
  account_status?: string;
  status?: string;
  status_reason?: string;
  blocked_reason?: string;
  is_blocked?: boolean;
  isBlocked?: boolean;
  blocked?: boolean;
  trust_score?: number;
  monthly_revenue_syp?: number;
  facilities_count?: number;
  documents?: OwnerDocumentDto[];
  join_date?: string;
  created_at?: string;
  createdAt?: string;
}

const ACCOUNT_STATUSES: OwnerAccountStatus[] = ['under_review', 'active', 'rejected', 'suspended'];
const DOC_TYPES: OwnerDocType[] = [
  'national_id',
  'business_license',
  'tax_certificate',
  'ownership_proof',
  'other',
];
const DOC_STATUSES: OwnerDocStatus[] = ['under_review', 'accepted', 'rejected'];

function normalizeAccountStatus(value: string | undefined): OwnerAccountStatus {
  const s = (value ?? '').toLowerCase();
  // The mobile runtime enum is active/under_review/suspended; the admin also
  // stores `rejected`. Anything else falls back to under_review.
  return (ACCOUNT_STATUSES as string[]).includes(s) ? (s as OwnerAccountStatus) : 'under_review';
}

function normalizeDocType(value: string | undefined): OwnerDocType {
  const s = (value ?? '').toLowerCase();
  return (DOC_TYPES as string[]).includes(s) ? (s as OwnerDocType) : 'other';
}

function normalizeDocStatus(value: string | undefined): OwnerDocStatus {
  const s = (value ?? '').toLowerCase();
  return (DOC_STATUSES as string[]).includes(s) ? (s as OwnerDocStatus) : 'under_review';
}

/** An image vs a PDF/other file, from the mime type or the url extension. */
function documentKind(mime: string | undefined, url: string): 'image' | 'pdf' {
  if (mime?.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  return /\.(png|jpe?g|webp|gif)$/i.test(url) ? 'image' : 'pdf';
}

function normalizeIntent(value: string | undefined): OwnerFacilityIntent | undefined {
  const s = (value ?? '').toLowerCase();
  if (s === 'sports_club' || s === 'independent_court') return s;
  return undefined;
}

export function toOwner(dto: OwnerDto): Owner {
  const isBlocked = dto.is_blocked ?? dto.isBlocked ?? dto.blocked ?? false;
  const documents: OwnerDocument[] = Array.isArray(dto.documents)
    ? dto.documents.map((document, index) => {
        const url = document.url ?? document.file_url ?? '';
        return {
          id: String(document.id ?? index),
          type: normalizeDocType(document.type ?? document.doc_type),
          status: normalizeDocStatus(document.status ?? document.verification_status),
          rejectionReason: document.rejection_reason,
          url,
          kind: documentKind(document.mime_type, url),
          uploadedAt: document.uploaded_at,
        };
      })
    : [];

  return {
    id: String(dto.id ?? dto._id ?? dto.user_id ?? dto.owner_id ?? dto.ownerId ?? ''),
    name: dto.name ?? dto.full_name ?? '',
    legalName: dto.legal_name,
    email: dto.email ?? dto.email_address ?? '',
    phone: dto.phone ?? dto.phone_number ?? '',
    nationalId: dto.national_id ?? dto.nationalId,
    dateOfBirth: dto.date_of_birth,
    photoUrl: dto.avatar_url ?? dto.photo_url,
    city: dto.city,
    address: dto.address,
    bio: dto.bio,
    link: dto.link ?? dto.website,
    intendedFacilityType: normalizeIntent(dto.intended_facility_type ?? dto.facility_type),
    region: dto.region ?? dto.region_name ?? '',
    accountStatus: normalizeAccountStatus(dto.account_status ?? dto.status),
    statusReason: dto.status_reason,
    isBlocked,
    blockedReason: dto.blocked_reason,
    trustScore: typeof dto.trust_score === 'number' ? dto.trust_score : 0,
    monthlyRevenueSyp: dto.monthly_revenue_syp,
    facilitiesCount: dto.facilities_count,
    documents,
    createdAt: dto.join_date ?? dto.createdAt ?? dto.created_at,
  };
}

/** Registration-date window (relative to now) for the "Joined" filter. */
export type OwnerJoinedWindow = 'all' | '7d' | '30d' | '90d' | 'year';

export interface OwnerListParams {
  q?: string;
  /** Account state filter (single, SRS-aligned): under_review/active/rejected/suspended/blocked. */
  status?: 'all' | OwnerState;
  /** Facility ownership: none (0) or has (≥1). */
  facilities?: 'all' | 'none' | 'has';
  /** Registration recency window (SRS: registration-date filter). */
  joined?: OwnerJoinedWindow;
  page?: number;
  pageSize?: number;
}

export interface OwnerListResult {
  items: Owner[];
  total: number;
  page: number;
  pageCount: number;
}

/** Admin-created owner — data taken from the app's signup (FR-ADM-OWNER-005). */
export interface CreateOwnerInput {
  name: string;
  email: string;
  /** 9-digit local part; the api prepends 963. */
  phone: string;
  nationalId?: string;
  intendedFacilityType: OwnerFacilityIntent;
  region?: string;
}

/** The result of creating an owner — carries the one-time temporary password. */
export interface CreatedOwner {
  owner: Owner;
  tempPassword: string;
}
