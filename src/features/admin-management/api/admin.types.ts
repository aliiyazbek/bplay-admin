export type AdminStatus = 'active' | 'suspended';

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  status: AdminStatus;
  isActive: boolean;
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
  created_at?: string;
  createdAt?: string;
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
  return {
    id: String(dto.id ?? dto._id ?? dto.admin_id ?? ''),
    name: dto.name ?? dto.full_name ?? '',
    email: dto.email ?? '',
    role: dto.role ?? 'admin',
    isActive,
    status: isActive ? 'active' : 'suspended',
    createdAt: dto.createdAt ?? dto.created_at,
  };
}

export interface AdminListParams {
  q?: string;
  status?: 'all' | AdminStatus;
  page?: number;
  pageSize?: number;
}

export interface AdminListResult {
  items: Admin[];
  total: number;
  page: number;
  pageCount: number;
}

export interface CreateAdminInput {
  name: string;
  email: string;
  password: string;
}

export interface UpdateAdminInput {
  name: string;
  email: string;
}
