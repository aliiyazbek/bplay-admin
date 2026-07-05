import { useQuery } from '@tanstack/react-query';
import { communityKeys } from '../api/community.keys';
import { getPostStats } from '../api';

/** Platform-wide community counts for the list KPI row. */
export function usePostStats() {
  return useQuery({
    queryKey: communityKeys.stats(),
    queryFn: getPostStats,
  });
}
