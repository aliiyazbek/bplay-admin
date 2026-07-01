import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginateRegions } from './region.filter';
import {
  toRegion,
  type Region,
  type RegionDto,
  type RegionListParams,
  type RegionListResult,
  type CreateRegionInput,
  type UpdateRegionInput,
} from './region.types';

const CITIES_PATH = '/admin/regions/cities';
const NEIGHBORHOODS_PATH = '/admin/regions/neighborhoods';
const CITY_PATH = '/admin/regions/city';
const NEIGHBORHOOD_PATH = '/admin/regions/neighborhood';

export async function getRegions(params: RegionListParams): Promise<RegionListResult> {
  const [citiesRes, neighborhoodsRes] = await Promise.all([
    apiClient.get(CITIES_PATH),
    apiClient.get(NEIGHBORHOODS_PATH),
  ]);
  const cities = unwrapList<RegionDto>(citiesRes.data, ['cities']).map((dto) =>
    toRegion({ ...dto, type: 'city' }),
  );
  const neighborhoods = unwrapList<RegionDto>(neighborhoodsRes.data, ['neighborhoods']).map((dto) =>
    toRegion({ ...dto, type: 'neighborhood' }),
  );
  return filterAndPaginateRegions([...cities, ...neighborhoods], params);
}

export async function createRegion(input: CreateRegionInput): Promise<Region> {
  const path = input.type === 'neighborhood' ? NEIGHBORHOOD_PATH : CITY_PATH;
  const body =
    input.type === 'neighborhood'
      ? { name: input.name, city_id: input.cityId }
      : { name: input.name };
  const res = await apiClient.post(path, body);
  return toRegion({ ...unwrap<RegionDto>(res.data), type: input.type });
}

export async function updateRegion(id: string, input: UpdateRegionInput): Promise<Region> {
  const path = input.type === 'neighborhood' ? NEIGHBORHOOD_PATH : CITY_PATH;
  const body =
    input.type === 'neighborhood'
      ? { id, name: input.name, city_id: input.cityId }
      : { id, name: input.name };
  const res = await apiClient.post(`${path}/${id}`, body);
  return toRegion({ ...unwrap<RegionDto>(res.data), type: input.type });
}

export async function toggleRegionActive(id: string, isActive: boolean): Promise<void> {
  await apiClient.post(`/admin/regions/is_active/${id}`, { is_active: isActive });
}

export async function assignAdmin(
  id: string,
  adminId: string,
  _adminName?: string,
): Promise<void> {
  await apiClient.post(`/admin/regions/assign/${id}`, { admin_id: adminId });
}

export async function deleteRegion(id: string): Promise<void> {
  await apiClient.delete(`/admin/regions/${id}`);
}
