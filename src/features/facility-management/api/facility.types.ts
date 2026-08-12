/**
 * Facility Management — domain types (the master contract for the slice).
 *
 * Ported from the Bplay mobile app's facility model (club/pitch discriminated
 * union, 5-state FacilityStatus, Syrian governorates) per admin SRS 09-facilities.
 * Wire DTOs mirror the mobile snake_case contract so go-live is a flag flip.
 */

import type { BadgeVariant, CoverageTone, DateRangeValue } from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';

// ---------------------------------------------------------------------------
// Enums (wire values match the mobile app's apiValue strings)
// ---------------------------------------------------------------------------

export type FacilityStatus = 'pending' | 'active' | 'rejected' | 'suspended' | 'owner_suspended';

export type FacilityKind = 'club' | 'pitch';

export type SyrianGovernorate =
  | 'damascus'
  | 'rif_dimashq'
  | 'aleppo'
  | 'homs'
  | 'hama'
  | 'latakia'
  | 'tartus'
  | 'idlib'
  | 'daraa'
  | 'as_suwayda'
  | 'quneitra'
  | 'deir_ez_zor'
  | 'al_hasakah'
  | 'raqqa';

export type SportType = 'tennis' | 'padel' | 'football' | 'basketball' | 'swimming' | 'volleyball';

export type PitchSurface = 'grass' | 'artificial' | 'hardcourt' | 'clay' | 'sand';

/** The admin actions available on a facility (approve/reject need pending). */
export type FacilityAction = 'approve' | 'reject' | 'suspend' | 'reactivate';

/**
 * How a facility entered the platform: created by an admin from THIS dashboard,
 * or by the owner through the mobile app. Only admin-created facilities may be
 * edited here — see {@link canEditFacility}.
 */
export type FacilitySource = 'admin' | 'owner';

export const FACILITY_SOURCES: FacilitySource[] = ['admin', 'owner'];

/** Editing is allowed only for facilities the admin created from the dashboard. */
export function canEditFacility(source: FacilitySource): boolean {
  return source === 'admin';
}

/** A pending submission waiting longer than this is "aged" (review-desk amber). */
export const AGED_THRESHOLD_HOURS = 48;

/** True when the submission has waited past the aged threshold. */
export function isAged(createdAt: string, thresholdHours: number = AGED_THRESHOLD_HOURS): boolean {
  return Date.now() - new Date(createdAt).getTime() >= thresholdHours * 3_600_000;
}

export const FACILITY_STATUSES: FacilityStatus[] = [
  'pending',
  'active',
  'rejected',
  'suspended',
  'owner_suspended',
];

/** Facility statuses shown on a coverage-map legend, in display order. */
export const FACILITY_LEGEND_STATUSES: FacilityStatus[] = [
  'active',
  'pending',
  'suspended',
  'rejected',
  'owner_suspended',
];

/** Map a facility status to a coverage-map pin tone — the single source of this mapping. */
export function facilityStatusTone(status: FacilityStatus): CoverageTone {
  switch (status) {
    case 'active':
      return 'active';
    case 'pending':
      return 'pending';
    case 'suspended':
    case 'rejected':
    case 'owner_suspended':
      return 'danger';
    default:
      return 'neutral';
  }
}

export const FACILITY_KINDS: FacilityKind[] = ['club', 'pitch'];

export const SYRIAN_GOVERNORATES: SyrianGovernorate[] = [
  'damascus',
  'rif_dimashq',
  'aleppo',
  'homs',
  'hama',
  'latakia',
  'tartus',
  'idlib',
  'daraa',
  'as_suwayda',
  'quneitra',
  'deir_ez_zor',
  'al_hasakah',
  'raqqa',
];

/**
 * Ordered alias table for best-effort matching of a reverse-geocoded state string
 * to a governorate. `rif_dimashq` precedes `damascus` so "ريف دمشق" never matches
 * Damascus first.
 */
const GOVERNORATE_ALIASES: Array<[SyrianGovernorate, string[]]> = [
  ['rif_dimashq', ['rif dimashq', 'rif-dimashq', 'ريف دمشق']],
  ['damascus', ['damascus', 'دمشق']],
  ['aleppo', ['aleppo', 'حلب']],
  ['homs', ['homs', 'حمص']],
  ['hama', ['hama', 'حماة', 'حماه']],
  ['latakia', ['latakia', 'lattakia', 'اللاذقية', 'لاذقية']],
  ['tartus', ['tartus', 'طرطوس']],
  ['idlib', ['idlib', 'إدلب', 'ادلب']],
  ['daraa', ['daraa', "dar'a", 'درعا']],
  ['as_suwayda', ['suwayda', 'sweida', 'as-suwayda', 'السويداء', 'سويداء']],
  ['quneitra', ['quneitra', 'القنيطرة', 'قنيطرة']],
  ['deir_ez_zor', ['deir ez-zor', 'deir ez zor', 'deir', 'دير الزور']],
  ['al_hasakah', ['hasakah', 'hasaka', 'al-hasakah', 'الحسكة', 'حسكة']],
  ['raqqa', ['raqqa', 'ar-raqqah', 'الرقة', 'رقة']],
];

/** Best-effort map of a reverse-geocoded state/governorate string to the enum. */
export function matchGovernorate(raw: string | undefined | null): SyrianGovernorate | undefined {
  if (!raw) return undefined;
  const value = raw.toLowerCase();
  for (const [governorate, aliases] of GOVERNORATE_ALIASES) {
    if (aliases.some((alias) => value.includes(alias))) return governorate;
  }
  return undefined;
}

export const SPORT_TYPES: SportType[] = [
  'tennis',
  'padel',
  'football',
  'basketball',
  'swimming',
  'volleyball',
];

export const PITCH_SURFACES: PitchSurface[] = ['grass', 'artificial', 'hardcourt', 'clay', 'sand'];

/** Amenities a facility can offer — unified across pitches (specs) and clubs (courts). */
export type FacilityAmenity = 'indoor' | 'lighting' | 'parking' | 'lockerRoom' | 'cafe';

export const FACILITY_AMENITIES: FacilityAmenity[] = [
  'indoor',
  'lighting',
  'parking',
  'lockerRoom',
  'cafe',
];

/** Document-verification state derived from a facility's documents. */
export type FacilityVerification = 'verified' | 'unverified' | 'no_docs';

export const FACILITY_VERIFICATIONS: FacilityVerification[] = ['verified', 'unverified', 'no_docs'];

/** Per-document review status (mirrors the owner KYC review contract). */
export type FacilityDocStatus = 'pending' | 'approved' | 'rejected';

export const FACILITY_DOC_STATUSES: FacilityDocStatus[] = ['pending', 'approved', 'rejected'];

/** Per-document review decisions an admin can apply. */
export type FacilityDocAction = 'accept' | 'reject';

/** Sortable directory columns. */
export type FacilitySortBy = 'createdAt' | 'name' | 'rating';

// ---------------------------------------------------------------------------
// Value objects
// ---------------------------------------------------------------------------

export interface FacilityLocation {
  lat: number;
  lng: number;
  address: string;
  city?: string;
  governorate?: SyrianGovernorate;
  district?: string;
}

export interface FacilityDocument {
  id: string;
  /** Free-text document title (e.g. "Business License") — the row label. */
  name: string;
  status: FacilityDocStatus;
  /** Admin note explaining a rejection (shown to the owner, who may re-upload). */
  rejectionReason?: string;
  url: string;
  /** Drives the viewer branch + row icon — an inline image vs an embedded PDF/file. */
  kind: 'image' | 'pdf';
}

/** Read-only figures (D-ADM-5) — the admin never edits these. */
export interface FacilityStatistics {
  occupancyPercent: number;
  revenueSyp: number;
  todayBookings: number;
}

/** An in-club court. A pitch-kind facility IS its own single court. */
export interface Court {
  id: string;
  name: string;
  sport: SportType;
  pricePerHour: number;
  surface: PitchSurface;
  isIndoor: boolean;
  hasLighting: boolean;
  capacity?: number;
  isActive: boolean;
}

export interface PitchSpecs {
  surface: PitchSurface;
  isIndoor: boolean;
  hasLighting: boolean;
  hasParking: boolean;
  hasLockerRoom: boolean;
  hasCafe: boolean;
}

export interface CancelPolicy {
  freeHoursBefore: number;
  penaltyPercent: number;
}

export interface DayHours {
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
}

/** Keyed by ISO weekday (1 = Monday … 7 = Sunday). Missing key = closed. */
export type WorkingHours = Record<number, DayHours>;

// ---------------------------------------------------------------------------
// Facility entities — discriminated union on `kind`
// ---------------------------------------------------------------------------

export interface FacilityBase {
  id: string;
  name: string;
  kind: FacilityKind;
  status: FacilityStatus;
  location: FacilityLocation;
  images: string[];
  ownerId: string;
  ownerName: string;
  /** Owner's avatar photo (for the clickable owner cell); falls back to initials. */
  ownerPhotoUrl?: string;
  createdAt: string;
  /** Origin: 'admin' (created from this dashboard — editable here) or 'owner' (via the app). */
  source: FacilitySource;
  /** Rejection reason — set when status is 'rejected'; shown to the owner. */
  adminNotes?: string;
  /** Admin suspension reason — set when status is 'suspended'. */
  suspensionReason?: string;
  rating?: number;
  documents: FacilityDocument[];
  statistics: FacilityStatistics;
}

export interface ClubFacility extends FacilityBase {
  kind: 'club';
  description?: string;
  logoUrl?: string;
  sports: SportType[];
  workingHours: WorkingHours;
  contactPhone?: string;
  courts: Court[];
}

export interface PitchFacility extends FacilityBase {
  kind: 'pitch';
  sport: SportType;
  pricePerHour: number;
  capacity?: number;
  specs: PitchSpecs;
  cancelPolicy: CancelPolicy;
}

export type Facility = ClubFacility | PitchFacility;

/** Flat projection for the directory table / review-desk cards. */
export interface FacilityListItem {
  id: string;
  name: string;
  kind: FacilityKind;
  status: FacilityStatus;
  sports: SportType[];
  governorate?: SyrianGovernorate;
  city?: string;
  /** Names of the scope regions containing this facility (may be several). */
  regionNames: string[];
  /** True when no active scope region contains the facility (super_admin only). */
  isOrphan: boolean;
  ownerId: string;
  ownerName: string;
  /** Owner's avatar photo (for the clickable owner cell); falls back to initials. */
  ownerPhotoUrl?: string;
  /** Origin: 'admin' (created from the dashboard) or 'owner' (via the app). */
  source: FacilitySource;
  rating?: number;
  thumbnailUrl?: string;
  /** All facility photos — the review queue shows a hero + peeking strip. */
  images: string[];
  createdAt: string;
  documents: FacilityDocument[];
  /** Amenities offered (derived) — powers the amenity filter chips. */
  amenities: FacilityAmenity[];
  /** Document-verification state (derived) — powers the verification filter + badge. */
  verification: FacilityVerification;
}

/**
 * Amenities a facility offers, unified across pitches (from specs) and clubs
 * (from their courts). Club-level parking / locker room / cafe are inferred from
 * the club's scale and mix — a mock-first heuristic a real backend replaces with
 * explicit flags. Returned in the canonical FACILITY_AMENITIES order.
 */
export function facilityAmenities(facility: Facility): FacilityAmenity[] {
  const set = new Set<FacilityAmenity>();
  if (facility.kind === 'pitch') {
    const s = facility.specs;
    if (s.isIndoor) set.add('indoor');
    if (s.hasLighting) set.add('lighting');
    if (s.hasParking) set.add('parking');
    if (s.hasLockerRoom) set.add('lockerRoom');
    if (s.hasCafe) set.add('cafe');
  } else {
    if (facility.courts.some((c) => c.isIndoor)) set.add('indoor');
    if (facility.courts.some((c) => c.hasLighting)) set.add('lighting');
    if (facility.courts.length >= 3) set.add('parking');
    if (facility.courts.some((c) => c.isIndoor)) set.add('lockerRoom');
    if (facility.sports.includes('swimming') || facility.courts.length >= 4) set.add('cafe');
  }
  return FACILITY_AMENITIES.filter((amenity) => set.has(amenity));
}

/** All docs approved = verified; any still pending = unverified; none uploaded = no_docs. */
export function facilityVerification(facility: Facility): FacilityVerification {
  if (facility.documents.length === 0) return 'no_docs';
  return facility.documents.every((doc) => doc.status === 'approved') ? 'verified' : 'unverified';
}

/**
 * A facility may only be approved once every uploaded verification document is
 * approved (a facility with no documents can never be approved). Drives the
 * approve-button gate on the queue, the directory rows and the profile, and is
 * enforced again in the approve mutation.
 */
export function facilityDocsAllApproved(documents: FacilityDocument[]): boolean {
  return documents.length > 0 && documents.every((doc) => doc.status === 'approved');
}

/** Per-document status → Badge variant (mirrors the owner doc-status mapping). */
const FACILITY_DOC_STATUS_KEY: Record<FacilityDocStatus, string> = {
  pending: 'review',
  approved: 'approved',
  rejected: 'rejected',
};
export function facilityDocBadgeVariant(status: FacilityDocStatus): BadgeVariant {
  return statusToBadgeVariant(FACILITY_DOC_STATUS_KEY[status]);
}

/** An image vs a PDF/other file, from the mime type, the url or the filename extension. */
export function facilityDocumentKind(url: string, mime?: string, name?: string): 'image' | 'pdf' {
  if (mime?.startsWith('image/')) return 'image';
  if (mime === 'application/pdf') return 'pdf';
  // Wizard uploads carry a `blob:` URL with no extension, so fall back to the filename.
  const imageExt = /\.(png|jpe?g|webp|gif)$/i;
  return imageExt.test(url) || (name != null && imageExt.test(name)) ? 'image' : 'pdf';
}

export function toFacilityListItem(
  facility: Facility,
  regionNames: string[],
  isOrphan: boolean,
): FacilityListItem {
  return {
    id: facility.id,
    name: facility.name,
    kind: facility.kind,
    status: facility.status,
    sports: facility.kind === 'club' ? facility.sports : [facility.sport],
    governorate: facility.location.governorate,
    city: facility.location.city,
    regionNames,
    isOrphan,
    ownerId: facility.ownerId,
    ownerName: facility.ownerName,
    ownerPhotoUrl: facility.ownerPhotoUrl,
    source: facility.source,
    rating: facility.rating,
    thumbnailUrl: facility.images[0],
    images: facility.images,
    createdAt: facility.createdAt,
    documents: facility.documents,
    amenities: facilityAmenities(facility),
    verification: facilityVerification(facility),
  };
}

/**
 * Flat projection of a facility for the region detail page — the facilities
 * that fall inside a region's geo circle (map pins + table rows).
 */
export interface RegionFacility {
  id: string;
  name: string;
  kind: FacilityKind;
  status: FacilityStatus;
  ownerId: string;
  ownerName: string;
  ownerPhotoUrl?: string;
  rating?: number;
  thumbnailUrl?: string;
  lat: number;
  lng: number;
  statistics: FacilityStatistics;
}

/** Project a full facility to the flat RegionFacility shape (sport ignored). */
export function toRegionFacility(facility: Facility): RegionFacility {
  return {
    id: facility.id,
    name: facility.name,
    kind: facility.kind,
    status: facility.status,
    ownerId: facility.ownerId,
    ownerName: facility.ownerName,
    ownerPhotoUrl: facility.ownerPhotoUrl,
    rating: facility.rating,
    thumbnailUrl: facility.images[0],
    lat: facility.location.lat,
    lng: facility.location.lng,
    statistics: facility.statistics,
  };
}

/**
 * The minimal region context passed to the Add-Facility wizard when it is
 * opened from a region's detail page. The wizard seeds the new facility's
 * coordinates from the region center (so it falls inside the region circle)
 * and skips the standalone location step. Carried in router navigation state.
 */
export interface FacilityRegionSeed {
  id: string;
  name: string;
  centerLat: number;
  centerLng: number;
  radiusKm: number;
}

/** Pick the wizard-relevant fields off a region (drops extra region fields). */
export function facilityRegionSeed(region: FacilityRegionSeed): FacilityRegionSeed {
  return {
    id: region.id,
    name: region.name,
    centerLat: region.centerLat,
    centerLng: region.centerLng,
    radiusKm: region.radiusKm,
  };
}

// ---------------------------------------------------------------------------
// List query params / result
// ---------------------------------------------------------------------------

export interface FacilityListParams {
  /** Matches facility name or owner name. */
  q?: string;
  status?: 'all' | FacilityStatus;
  kind?: 'all' | FacilityKind;
  /** Origin: created by an admin from the dashboard vs by the owner via the app. */
  source?: 'all' | FacilitySource;
  sport?: 'all' | SportType;
  /** A scope-region id, 'orphans' (super_admin only) or 'all'. */
  regionId?: 'all' | 'orphans' | string;
  ownerId?: 'all' | string;
  /** Minimum rating (inclusive); undefined = any. */
  minRating?: number;
  governorate?: 'all' | SyrianGovernorate;
  /** Free-text city match (case-insensitive substring); empty = any. */
  city?: string;
  verification?: 'all' | FacilityVerification;
  /** Every listed amenity must be present (AND semantics). */
  amenities?: FacilityAmenity[];
  /** Created-date window; preset 'all' = no date filter. */
  dateRange?: DateRangeValue;
  sortBy?: FacilitySortBy;
  sortDir?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/** Scope-aware KPI figures for the directory header (one lightweight call). */
export interface FacilityStats {
  total: number;
  active: number;
  pending: number;
  /** Admin-suspended + owner-paused combined. */
  suspended: number;
  rejected: number;
  /** Mean rating across rated facilities (0 when none rated). */
  avgRating: number;
  /** Pending submissions past the aged threshold — the "needs attention" figure. */
  aged: number;
  /** Facilities outside every active region (super_admin scope only). */
  orphan: number;
}

export interface FacilityListResult {
  items: FacilityListItem[];
  total: number;
  page: number;
  pageCount: number;
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

/** A court being authored in the wizard — id is assigned on save (absent = new). */
export interface CourtInput {
  id?: string;
  name: string;
  sport: SportType;
  pricePerHour: number;
  surface: PitchSurface;
  isIndoor: boolean;
  hasLighting: boolean;
  capacity?: number;
  isActive: boolean;
}

/** An uploaded verification document (name + resolvable URL). */
export interface FacilityDocumentInput {
  name: string;
  url: string;
}

/** Wizard payload — kind-specific fields validated per step by facility.schema. */
export interface CreateFacilityInput {
  ownerId: string;
  kind: FacilityKind;
  name: string;
  description?: string;
  /** Club: one or more sports. Pitch: exactly one (first entry). */
  sports: SportType[];
  contactPhone?: string;
  location: FacilityLocation;
  /** Club only. */
  workingHours?: WorkingHours;
  /** Club only — the authored courts. */
  courts?: CourtInput[];
  /** Pitch only. */
  pricePerHour?: number;
  capacity?: number;
  specs?: PitchSpecs;
  cancelPolicy?: CancelPolicy;
  images: string[];
  /** Verification documents. */
  documents?: FacilityDocumentInput[];
}

/** Editing reuses the create shape; the id is passed alongside. */
export type UpdateFacilityInput = CreateFacilityInput;

/** Seed the wizard draft from an existing facility (edit mode). */
export function facilityToInput(facility: Facility): CreateFacilityInput {
  const base: CreateFacilityInput = {
    ownerId: facility.ownerId,
    kind: facility.kind,
    name: facility.name,
    sports: facility.kind === 'club' ? [...facility.sports] : [facility.sport],
    contactPhone: facility.kind === 'club' ? facility.contactPhone : undefined,
    location: { ...facility.location },
    images: [...facility.images],
    documents: facility.documents.map((doc) => ({ name: doc.name, url: doc.url })),
  };
  if (facility.kind === 'club') {
    return {
      ...base,
      description: facility.description,
      workingHours: { ...facility.workingHours },
      courts: facility.courts.map((court) => ({
        id: court.id,
        name: court.name,
        sport: court.sport,
        pricePerHour: court.pricePerHour,
        surface: court.surface,
        isIndoor: court.isIndoor,
        hasLighting: court.hasLighting,
        capacity: court.capacity,
        isActive: court.isActive,
      })),
    };
  }
  return {
    ...base,
    pricePerHour: facility.pricePerHour,
    capacity: facility.capacity,
    specs: { ...facility.specs },
    cancelPolicy: { ...facility.cancelPolicy },
  };
}

/** The two review actions applicable in bulk from the queue. */
export type BulkFacilityAction = 'approve' | 'reject';

/** Why the backend declined to act on one facility in a bulk request. */
export type BulkSkipReason =
  | 'ERR_FACILITY_NOT_FOUND'
  | 'ERR_ALREADY_IN_STATUS'
  | 'ERR_NOT_PENDING_REVIEW'
  | 'ERR_NO_DOCUMENTS'
  | 'ERR_DOCUMENTS_NOT_APPROVED';

export interface BulkSkip {
  id: string;
  reason: BulkSkipReason;
  /** The status that blocked it, when the skip was a state problem. */
  status?: string;
}

export interface BulkActionResult {
  /** How many facilities the action actually applied to (invalid transitions skipped). */
  succeeded: number;
  /**
   * Facilities the backend declined to act on, each with a reason. A bare id
   * list could not distinguish "outside your region" from "KYC docs not
   * approved" from "already decided", so the UI had nothing useful to report.
   */
  skipped: BulkSkip[];
}

// ---------------------------------------------------------------------------
// Wire DTO (snake_case, mirrors the mobile/backend contract) + normalizer
// ---------------------------------------------------------------------------

export interface FacilityDto {
  id?: string | number;
  name?: string;
  type?: string;
  status?: string;
  location?: {
    lat?: number;
    lng?: number;
    address?: string;
    city?: string;
    governorate?: string;
    district?: string;
  };
  images?: string[];
  owner_id?: string | number;
  owner_name?: string;
  source?: string;
  created_at?: string;
  admin_notes?: string;
  suspension_reason?: string;
  rating?: number;
  documents?: Array<{
    id?: string | number;
    name?: string;
    status?: string;
    rejection_reason?: string;
    url?: string;
    mime_type?: string;
  }>;
  statistics?: {
    occupancy_percent?: number;
    revenue_syp?: number;
    today_bookings?: number;
  };
  // Club
  description?: string;
  logo_url?: string;
  sports?: string[];
  working_hours?: Record<
    string,
    { is_open?: boolean; open_time?: string; close_time?: string }
  >;
  contact_phone?: string;
  courts?: Array<{
    id?: string | number;
    name?: string;
    sport?: string;
    price_per_hour?: number;
    surface?: string;
    is_indoor?: boolean;
    has_lighting?: boolean;
    capacity?: number;
    is_active?: boolean;
  }>;
  // Pitch
  sport?: string;
  price_per_hour?: number;
  capacity?: number;
  specs?: {
    surface?: string;
    is_indoor?: boolean;
    has_lighting?: boolean;
    has_parking?: boolean;
    has_locker_room?: boolean;
    has_cafe?: boolean;
  };
  cancel_policy?: { free_hours_before?: number; penalty_percent?: number };
}

function normalizeStatus(value: string | undefined): FacilityStatus {
  const s = (value ?? '').toLowerCase();
  return (FACILITY_STATUSES as string[]).includes(s) ? (s as FacilityStatus) : 'pending';
}

function normalizeKind(value: string | undefined): FacilityKind {
  return value === 'club' ? 'club' : 'pitch';
}

function normalizeSource(value: string | undefined): FacilitySource {
  return value === 'admin' ? 'admin' : 'owner';
}

function normalizeGovernorate(value: string | undefined): SyrianGovernorate | undefined {
  const s = (value ?? '').toLowerCase();
  return (SYRIAN_GOVERNORATES as string[]).includes(s) ? (s as SyrianGovernorate) : undefined;
}

function normalizeSport(value: string | undefined): SportType {
  const s = (value ?? '').toLowerCase();
  return (SPORT_TYPES as string[]).includes(s) ? (s as SportType) : 'football';
}

function normalizeSurface(value: string | undefined): PitchSurface {
  const s = (value ?? '').toLowerCase();
  return (PITCH_SURFACES as string[]).includes(s) ? (s as PitchSurface) : 'artificial';
}

function normalizeDocStatus(value: string | undefined): FacilityDocStatus {
  const s = (value ?? '').toLowerCase();
  if (s === 'approved' || s === 'accepted' || s === 'verified') return 'approved';
  if (s === 'rejected' || s === 'denied') return 'rejected';
  return 'pending';
}

export function toFacility(dto: FacilityDto): Facility {
  const base: FacilityBase = {
    id: String(dto.id ?? ''),
    name: dto.name ?? '',
    kind: normalizeKind(dto.type),
    status: normalizeStatus(dto.status),
    location: {
      lat: dto.location?.lat ?? 0,
      lng: dto.location?.lng ?? 0,
      address: dto.location?.address ?? '',
      city: dto.location?.city,
      governorate: normalizeGovernorate(dto.location?.governorate),
      district: dto.location?.district,
    },
    images: Array.isArray(dto.images) ? dto.images : [],
    ownerId: String(dto.owner_id ?? ''),
    ownerName: dto.owner_name ?? '',
    source: normalizeSource(dto.source),
    createdAt: dto.created_at ?? new Date().toISOString(),
    adminNotes: dto.admin_notes,
    suspensionReason: dto.suspension_reason,
    rating: dto.rating,
    documents: Array.isArray(dto.documents)
      ? dto.documents.map((doc, index) => {
          const url = doc.url ?? '';
          const name = doc.name ?? 'Document';
          return {
            id: String(doc.id ?? index),
            name,
            status: normalizeDocStatus(doc.status),
            rejectionReason: doc.rejection_reason,
            url,
            kind: facilityDocumentKind(url, doc.mime_type, name),
          };
        })
      : [],
    statistics: {
      occupancyPercent: dto.statistics?.occupancy_percent ?? 0,
      revenueSyp: dto.statistics?.revenue_syp ?? 0,
      todayBookings: dto.statistics?.today_bookings ?? 0,
    },
  };

  if (base.kind === 'club') {
    const workingHours: WorkingHours = {};
    for (const [day, hours] of Object.entries(dto.working_hours ?? {})) {
      const weekday = Number(day);
      if (Number.isInteger(weekday)) {
        workingHours[weekday] = {
          isOpen: hours.is_open ?? false,
          openTime: hours.open_time,
          closeTime: hours.close_time,
        };
      }
    }
    const club: ClubFacility = {
      ...base,
      kind: 'club',
      description: dto.description,
      logoUrl: dto.logo_url,
      sports: (dto.sports ?? []).map(normalizeSport),
      workingHours,
      contactPhone: dto.contact_phone,
      courts: (dto.courts ?? []).map((court, index) => ({
        id: String(court.id ?? index),
        name: court.name ?? '',
        sport: normalizeSport(court.sport),
        pricePerHour: court.price_per_hour ?? 0,
        surface: normalizeSurface(court.surface),
        isIndoor: court.is_indoor ?? false,
        hasLighting: court.has_lighting ?? false,
        capacity: court.capacity,
        isActive: court.is_active ?? true,
      })),
    };
    return club;
  }

  const pitch: PitchFacility = {
    ...base,
    kind: 'pitch',
    sport: normalizeSport(dto.sport),
    pricePerHour: dto.price_per_hour ?? 0,
    capacity: dto.capacity,
    specs: {
      surface: normalizeSurface(dto.specs?.surface),
      isIndoor: dto.specs?.is_indoor ?? false,
      hasLighting: dto.specs?.has_lighting ?? false,
      hasParking: dto.specs?.has_parking ?? false,
      hasLockerRoom: dto.specs?.has_locker_room ?? false,
      hasCafe: dto.specs?.has_cafe ?? false,
    },
    cancelPolicy: {
      freeHoursBefore: dto.cancel_policy?.free_hours_before ?? 24,
      penaltyPercent: dto.cancel_policy?.penalty_percent ?? 0,
    },
  };
  return pitch;
}
