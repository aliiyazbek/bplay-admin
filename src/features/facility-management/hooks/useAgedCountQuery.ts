import { useQuery } from '@tanstack/react-query';
import { facilityKeys } from '../api/facility.keys';
import { getAgedCount } from '../api';

/** Scope-wide count of pending submissions waiting over 48h (scope banner). */
export function useAgedCountQuery() {
  return useQuery({
    queryKey: facilityKeys.agedCount(),
    queryFn: () => getAgedCount(),
  });
}
