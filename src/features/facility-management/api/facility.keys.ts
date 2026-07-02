import type { FacilityListParams } from './facility.types';

export const facilityKeys = {
  all: ['facilities'] as const,
  lists: () => [...facilityKeys.all, 'list'] as const,
  list: (params: FacilityListParams) => [...facilityKeys.lists(), params] as const,
  pending: (params: FacilityListParams) => [...facilityKeys.all, 'pending', params] as const,
  pendingCount: () => [...facilityKeys.all, 'pending-count'] as const,
  agedCount: () => [...facilityKeys.all, 'aged-count'] as const,
  details: () => [...facilityKeys.all, 'detail'] as const,
  detail: (id: string) => [...facilityKeys.details(), id] as const,
};
