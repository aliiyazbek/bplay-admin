import type { AuthUser } from '@shared/stores/authStore';

/** The editable slice of the signed-in admin's profile. */
export type ProfileUser = Pick<AuthUser, 'name' | 'avatarUrl'>;

export interface UpdateProfileInput {
  name: string;
  /** Data URL / remote URL of the new photo; undefined removes the photo. */
  avatarUrl?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
