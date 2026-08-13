import { useQuery } from '@tanstack/react-query';
import { getOwners } from '@features/owner-management/api';
import { ownerState } from '@features/owner-management/api/owner.types';

/**
 * Owners selectable when creating a facility.
 *
 * Blocked and suspended owners are removed. Everything they already hold was
 * deactivated when they were stopped, so offering them a NEW facility would
 * create a live, bookable venue under a banned account and quietly undo the
 * block. The backend now refuses this outright (ERR_OWNER_BLOCKED /
 * ERR_OWNER_SUSPENDED); this keeps the name out of the list so an admin never
 * picks one and meets an error at submit.
 *
 * Pending owners stay: approving an owner and opening their first facility is
 * the normal path, and the wizard is often where that starts.
 *
 * The filter is applied to the fetched page rather than by a server `status`
 * filter because that parameter takes ONE bucket — 'active' alone would also
 * drop the pending owners this list wants to keep.
 */
export function useOwnersForPicker() {
  return useQuery({
    queryKey: ['owners', 'picker'],
    queryFn: () => getOwners({ page: 1, pageSize: 100 }),
    select: (result) =>
      result.items
        .filter((owner) => {
          // `ownerState` resolves the precedence (blocked > suspended > review
          // outcome) from the three orthogonal wire signals — there is no single
          // `state` field on Owner to read.
          const state = ownerState(owner);
          return state !== 'blocked' && state !== 'suspended';
        })
        .map((owner) => ({ id: owner.id, name: owner.name, email: owner.email })),
  });
}
