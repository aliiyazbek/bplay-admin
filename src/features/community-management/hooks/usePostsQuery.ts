import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { communityKeys } from '../api/community.keys';
import { getPosts } from '../api';
import type { PostListParams } from '../api/community.types';

export function usePostsQuery(params: PostListParams) {
  return useQuery({
    queryKey: communityKeys.list(params),
    queryFn: () => getPosts(params),
    placeholderData: keepPreviousData,
  });
}
