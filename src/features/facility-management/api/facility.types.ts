/**
 * Facility Management — domain types (the master contract for the slice).
 *
 * Ported from the Bplay mobile app's facility model (club/pitch discriminated
 * union, 5-state FacilityStatus, Syrian governorates) per admin SRS 09-facilities.
 * Wire DTOs mirror the mobile snake_case contract so go-live is a flag flip.
 */

import type { CoverageTone } from '@ui';

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

export const SPORT_TYPES: SportType[] = [
  'tennis',
  'padel',
  'football',
  'basketball',
  'swimming',
  'volleyball',
];

export const PITCH_SURFACES: PitchSurface[] = ['grass', 'artificial', 'hardcourt', 'clay', 'sand'];

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
  name: string;
  status: string;
  url: string;
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
  createdAt: string;
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
  rating?: number;
  thumbnailUrl?: string;
  /** All facility photos — the review queue shows a hero + peeking strip. */
  images: string[];
  createdAt: string;
  documents: FacilityDocument[];
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
    rating: facility.rating,
    thumbnailUrl: facility.images[0],
    images: facility.images,
    createdAt: facility.createdAt,
    documents: facility.documents,
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
  sport?: 'all' | SportType;
  /** A scope-region id, 'orphans' (super_admin only) or 'all'. */
  regionId?: 'all' | 'orphans' | string;
  ownerId?: 'all' | string;
  /** Minimum rating (inclusive); undefined = any. */
  minRating?: number;
  page?: number;
  pageSize?: number;
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
  /** Pitch only. */
  pricePerHour?: number;
  capacity?: number;
  specs?: PitchSpecs;
  cancelPolicy?: CancelPolicy;
  images: string[];
  documentName?: string;
  documentUrl?: string;
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
  created_at?: string;
  admin_notes?: string;
  suspension_reason?: string;
  rating?: number;
  documents?: Array<{ id?: string | number; name?: string; status?: string; url?: string }>;
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
    createdAt: dto.created_at ?? new Date().toISOString(),
    adminNotes: dto.admin_notes,
    suspensionReason: dto.suspension_reason,
    rating: dto.rating,
    documents: Array.isArray(dto.documents)
      ? dto.documents.map((doc, index) => ({
          id: String(doc.id ?? index),
          name: doc.name ?? 'Document',
          status: (doc.status ?? 'pending').toLowerCase(),
          url: doc.url ?? '',
        }))
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
