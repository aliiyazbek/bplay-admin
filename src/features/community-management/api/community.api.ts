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

export async function getPosts(params: PostListParams): Promise<PostListResult> {
  const res = await apiClient.get(POSTS_PATH, { params });
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
