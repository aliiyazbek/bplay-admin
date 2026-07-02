import { apiClient } from '@lib/apiClient';
import { unwrap } from '@shared/types/api';
import type { ChangePasswordInput, ProfileUser, UpdateProfileInput } from './profile.types';

const PATH = '/admin/profile';

export async function updateProfile(input: UpdateProfileInput): Promise<ProfileUser> {
  const res = await apiClient.patch(PATH, {
    name: input.name,
    avatar_url: input.avatarUrl ?? null,
  });
  return unwrap<ProfileUser>(res.data);
}

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await apiClient.post(`${PATH}/password`, {
    current_password: input.currentPassword,
    new_password: input.newPassword,
  });
}
