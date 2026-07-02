import { useQuery } from '@tanstack/react-query';
import { getOwners } from '@features/owner-management/api';

/** All owners (any status — the queue demo needs pending ones too) for the wizard Select. */
export function useOwnersForPicker() {
  return useQuery({
    queryKey: ['owners', 'picker'],
    queryFn: () => getOwners({ page: 1, pageSize: 100 }),
    select: (result) =>
      result.items.map((owner) => ({ id: owner.id, name: owner.name, email: owner.email })),
  });
}
