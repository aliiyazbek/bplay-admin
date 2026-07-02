import { useQuery } from '@tanstack/react-query';
import { getAdmins } from '@features/admin-management/api';

/** Small query wrapping getAdmins for the "assign admin" dropdown. */
export function useAdminsForAssign() {
  return useQuery({
    queryKey: ['admins', 'for-assign'],
    queryFn: () => getAdmins({ pageSize: 1000 }),
    select: (result) =>
      result.items.map((admin) => ({
        id: admin.id,
        name: admin.name,
        email: admin.email,
        isActive: admin.isActive,
      })),
  });
}
