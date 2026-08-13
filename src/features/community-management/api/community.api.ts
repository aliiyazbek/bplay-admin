import { apiClient } from '@lib/apiClient';
import { unwrap, unwrapList } from '@shared/types/api';
import { filterAndPaginatePosts } from './community.filter';
import {
  toComment,
  toPost,
  toReactor,
  type Comment,
  type CommentDto,
  type CommunityActorDto,
  type ModerationAction,
  type Post,
  type PostDto,
  type PostListParams,
  type PostListResult,
  type PostStats,
  type Reactor,
} from './community.types';

const BASE = '/admin/community-management';
const POSTS_PATH = `${BASE}/posts`;

/** Bounded working set for client-side filtering — an explicit, visible cap. */
const WORKING_SET = 2000;
/**
 * PAGINATION: client-side, and applied exactly ONCE.
 *
 * The local pipeline still filters and sorts after the fetch, and either can drop rows —
 * so paginating on the server first would return "page 2 of N" and then filter
 * it down, leaving the count, the page boundaries and the rows disagreeing.
 *
 * The bug this replaces was paginating TWICE: page/pageSize were forwarded to
 * the server AND the returned page was sliced again locally, so page 2 asked
 * the server for rows 6-10 and then sliced that 5-element array from index 5 —
 * a blank table.
 *
 * Page params are therefore stripped from the request and a bounded working set
 * is fetched instead.
 */
export async function getPosts(params: PostListParams): Promise<PostListResult> {
  const { page: _p, pageSize: _ps, ...serverParams } = params;
  const res = await apiClient.get(POSTS_PATH, { params: { ...serverParams, pageSize: WORKING_SET } });
  const all = unwrapList<PostDto>(res.data, ['posts']).map(toPost);
  return filterAndPaginatePosts(all, params);
}

export async function getPostById(id: string): Promise<Post> {
  const res = await apiClient.get(`${POSTS_PATH}/${id}`);
  return toPost(unwrap<PostDto>(res.data));
}

export async function getPostStats(): Promise<PostStats> {
  const res = await apiClient.get(POSTS_PATH, { params: { pageSize: 1000 } });
  const all = unwrapList<PostDto>(res.data, ['posts']).map(toPost);
  return {
    totalPosts: all.length,
    totalComments: all.reduce((sum, post) => sum + post.totalComments, 0),
    totalReactions: all.reduce((sum, post) => sum + post.totalReactions, 0),
    removed: all.filter((post) => post.moderationStatus === 'removed').length,
  };
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const res = await apiClient.get(`${POSTS_PATH}/${postId}/comments`);
  return unwrapList<CommentDto>(res.data, ['comments']).map(toComment);
}

export async function getPostReactors(postId: string): Promise<Reactor[]> {
  const res = await apiClient.get(`${POSTS_PATH}/${postId}/reactors`);
  return unwrapList<CommunityActorDto>(res.data, ['reactors']).map(toReactor);
}

export async function updatePostModeration(
  id: string,
  action: ModerationAction,
  reason?: string,
): Promise<void> {
  await apiClient.patch(`${POSTS_PATH}/${id}/moderation`, { action, reason });
}

export async function updateCommentModeration(
  postId: string,
  commentId: string,
  action: ModerationAction,
  reason?: string,
): Promise<void> {
  await apiClient.patch(`${POSTS_PATH}/${postId}/comments/${commentId}/moderation`, {
    action,
    reason,
  });
}
