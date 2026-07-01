export type RegionType = 'city' | 'neighborhood';
export type RegionStatus = 'active' | 'inactive';

export interface Region {
  id: string;
  name: string;
  type: RegionType;
  /** Parent city id — set for neighborhoods. */
  cityId?: string;
  isActive: boolean;
  status: RegionStatus;
  assignedAdminId?: string;
  assignedAdminName?: string;
  createdAt?: string;
}

/** The raw backend shape (field names vary — normalised by toRegion). */
export interface RegionDto {
  id?: string | number;
  _id?: string;
  region_id?: string | number;
  name?: string;
  city_name?: string;
  neighborhood_name?: string;
  type?: string;
  city_id?: string | number;
  cityId?: string;
  is_active?: boolean;
  isActive?: boolean;
  active?: boolean;
  status?: string;
  assigned_admin_id?: string | number;
  assignedAdminId?: string;
  assigned_admin_name?: string;
  assignedAdminName?: string;
  created_at?: string;
  createdAt?: string;
}

export function toRegion(dto: RegionDto): Region {
  const isActive =
    typeof dto.is_active === 'boolean'
      ? dto.is_active
      : typeof dto.isActive === 'boolean'
        ? dto.isActive
        : typeof dto.active === 'boolean'
          ? dto.active
          : dto.status
            ? dto.status.toLowerCase() === 'active'
            : true;
  const type: RegionType = dto.type === 'neighborhood' ? 'neighborhood' : 'city';
  const cityId =
    dto.city_id !== undefined && dto.city_id !== null
      ? String(dto.city_id)
      : (dto.cityId ?? undefined);
  const assignedAdminId =
    dto.assigned_admin_id !== undefined && dto.assigned_admin_id !== null
      ? String(dto.assigned_admin_id)
      : (dto.assignedAdminId ?? undefined);
  return {
    id: String(dto.id ?? dto._id ?? dto.region_id ?? ''),
    name: dto.name ?? dto.city_name ?? dto.neighborhood_name ?? '',
    type,
    cityId: type === 'neighborhood' ? cityId : undefined,
    isActive,
    status: isActive ? 'active' : 'inactive',
    assignedAdminId,
    assignedAdminName: dto.assigned_admin_name ?? dto.assignedAdminName ?? undefined,
    createdAt: dto.createdAt ?? dto.created_at,
  };
}

export interface RegionListParams {
  q?: string;
  type?: 'all' | RegionType;
  page?: number;
  pageSize?: number;
}

export interface RegionListResult {
  items: Region[];
  total: number;
  page: number;
  pageCount: number;
}

export interface CreateRegionInput {
  name: string;
  type: RegionType;
  /** Required when type is 'neighborhood'. */
  cityId?: string;
}

export interface UpdateRegionInput {
  name: string;
  type: RegionType;
  cityId?: string;
}
