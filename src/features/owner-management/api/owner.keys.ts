import type { OwnerListParams } from './owner.types';

export const ownerKeys = {
  all: ['owners'] as const,
  lists: () => [...ownerKeys.all, 'list'] as const,
  list: (params: OwnerListParams) => [...ownerKeys.lists(), params] as const,
  details: () => [...ownerKeys.all, 'detail'] as const,
  detail: (id: string) => [...ownerKeys.details(), id] as const,
};
