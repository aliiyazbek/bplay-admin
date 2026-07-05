export type AdminStatus = 'active' | 'suspended';

/**
 * An admin's oversight tier (FR: general vs region-scoped).
 * - `general`  — platform-wide oversight (like a super_admin but with fewer
 *   powers, e.g. cannot create other admins). NOT tied to any region.
 * - `regional` — scoped to one or more regions they manage.
 * The platform owner (super_admin) is a separate top account and is not
 * created or listed here.
 */
export type AdminScope = 'general' | 'regional';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AdminStatus;
  isActive: boolean;
  /** Oversight tier — general (platform-wide) or regional (region-scoped). */
  scope: AdminScope;
  /** Syrian phone in canonical form `963XXXXXXXXX` (empty when unknown). */
  phone: string;
  /** Syrian national number — exactly 11 digits (empty when unknown). */
  nationalId: string;
  /**
   * Profile photo URL; `undefined` renders an initials fallback. The admin
   * edits this themselves from their own profile — it is VIEW-ONLY here.
   */
  photoUrl?: string;
  /** Soft-deleted: hidden from lists/scope by default, restorable. */
  isDeleted: boolean;
  /**
   * Regions this admin manages. DERIVED at read time by inverting the region
   * store (the region owns the many-to-many link via `region.assignedAdminIds`).
   * Never persisted on the admin — the mock hydrates it on every read and the
   * real backend returns it from the join; defaults to `[]` otherwise.
   */
  assignedRegionIds: string[];
  assignedRegionNames: string[];
  createdAt?: string;
}

/** The raw backend shape (field names vary — normalised by toAdmin). */
export interface AdminDto {
  id?: string | number;
  _id?: string;
  admin_id?: string | number;
  name?: string;
  full_name?: string;
  email?: string;
  role?: string;
  is_active?: boolean;
  isActive?: boolean;
  status?: string;
  scope?: string;
  admin_scope?: string;
  phone?: string;
  phone_number?: string;
  mobile?: string;
  national_id?: string;
  nationalId?: string;
  national_number?: string;
  photo_url?: string;
  photoUrl?: string;
  avatar_url?: string;
  is_deleted?: boolean;
  isDeleted?: boolean;
  deleted_at?: string | null;
  assigned_region_ids?: Array<string | number>;
  assignedRegionIds?: string[];
  assigned_region_names?: string[];
  assignedRegionNames?: string[];
  created_at?: string;
  createdAt?: string;
}

function firstString(...values: Array<string | undefined>): string {
  for (const value of values) {
    if (typeof value === 'string' && value.length > 0) return value;
  }
  return '';
}

export function toAdmin(dto: AdminDto): Admin {
  const isActive =
    typeof dto.is_active === 'boolean'
      ? dto.is_active
      : typeof dto.isActive === 'boolean'
        ? dto.isActive
        : dto.status
          ? dto.status.toLowerCase() === 'active'
          : true;
  const scopeRaw = (dto.scope ?? dto.admin_scope ?? '').toLowerCase();
  const scope: AdminScope = scopeRaw === 'general' ? 'general' : 'regional';
  const regionIds = (dto.assigned_region_ids ?? dto.assignedRegionIds ?? []).map(String);
  const regionNames = dto.assigned_region_names ?? dto.assignedRegionNames ?? [];
  return {
    id: String(dto.id ?? dto._id ?? dto.admin_id ?? ''),
    name: dto.name ?? dto.full_name ?? '',
    email: dto.email ?? '',
    role: dto.role ?? 'admin',
    isActive,
    status: isActive ? 'active' : 'suspended',
    scope,
    phone: firstString(dto.phone, dto.phone_number, dto.mobile),
    nationalId: firstString(dto.national_id, dto.nationalId, dto.national_number),
    photoUrl: dto.photo_url ?? dto.photoUrl ?? dto.avatar_url,
    isDeleted: dto.is_deleted ?? dto.isDeleted ?? (dto.deleted_at != null ? true : false),
    assignedRegionIds: regionIds,
    assignedRegionNames: regionNames,
    createdAt: dto.createdAt ?? dto.created_at,
  };
}

export interface AdminListParams {
  q?: string;
  status?: 'all' | AdminStatus;
  /** Filter by oversight tier. */
  scope?: 'all' | AdminScope;
  /** Filter regional admins by whether they hold any region. */
  assignment?: 'all' | 'assigned' | 'unassigned';
  /** When true, list ONLY soft-deleted admins (the trash view); default hides them. */
  showDeleted?: boolean;
  page?: number;
  pageSize?: number;
}

export interface AdminListResult {
  items: Admin[];
  total: number;
  page: number;
  pageCount: number;
}

/** Platform-wide admin counts for the list KPI row. */
export interface AdminStats {
  total: number;
  active: number;
  /** Region-scoped admins. */
  regional: number;
  /** Region admins holding no region yet (needs attention). */
  unassigned: number;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  /** The initial password we issue — restorable later via reset-to-original. */
  password: string;
  /** 9-digit local part (e.g. 988324051); the api prepends the 963 country code. */
  phone: string;
  nationalId: string;
  scope: AdminScope;
  /** Regions to assign — used only when scope === 'regional'. */
  regionIds: string[];
}

export interface UpdateAdminInput {
  name: string;
  email: string;
  phone: string;
  nationalId: string;
  scope: AdminScope;
  regionIds: string[];
}

/** Many-to-many region assignment for an admin (replaces the whole set). */
export interface AssignRegionsInput {
  regionIds: string[];
}

/** Promote/demote an admin's oversight tier. */
export interface AdminScopeInput {
  scope: AdminScope;
}
