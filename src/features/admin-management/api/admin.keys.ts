import type { AdminListParams } from './admin.types';

export const adminKeys = {
  all: ['admins'] as const,
  lists: () => [...adminKeys.all, 'list'] as const,
  list: (params: AdminListParams) => [...adminKeys.lists(), params] as const,
};
