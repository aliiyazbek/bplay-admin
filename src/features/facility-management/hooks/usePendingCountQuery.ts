import { useQuery } from '@tanstack/react-query';
import { facilityKeys } from '../api/facility.keys';
import { getPendingCount } from '../api';

/** Scope-aware count of pending facilities (queue tab badge + scope banner). */
export function usePendingCountQuery() {
  return useQuery({
    queryKey: facilityKeys.pendingCount(),
    queryFn: () => getPendingCount(),
  });
}
