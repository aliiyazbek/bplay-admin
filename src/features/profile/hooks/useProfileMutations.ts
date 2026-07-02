import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@ui';
import { useAuthStore } from '@shared/stores/authStore';
import { changePassword, updateProfile } from '../api';
import type { ChangePasswordInput, UpdateProfileInput } from '../api/profile.types';

/** Update name + avatar, then patch the persisted auth session so the UI reflects it. */
export function useUpdateProfile() {
  const toast = useToast();
  const { t } = useTranslation();
  const applyProfile = useAuthStore((state) => state.updateProfile);

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: (user) => {
      applyProfile({ name: user.name, avatarUrl: user.avatarUrl });
      toast.success(t('profile.toast.updated'));
    },
  });
}

export function useChangePassword() {
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (input: ChangePasswordInput) => changePassword(input),
    onSuccess: () => toast.success(t('profile.toast.passwordChanged')),
  });
}
