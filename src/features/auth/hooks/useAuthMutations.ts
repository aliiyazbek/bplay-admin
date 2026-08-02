import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@shared/stores/authStore';
import { useToast } from '@ui';
import { PATHS } from '@app/router/paths';
import { queryClient } from '@shared/lib/queryClient';
import { forgotPassword, login, resetPassword } from '../api';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      // Drop everything the PREVIOUS principal cached before the new session is
      // installed. /login is reachable from an authenticated tab by client-side
      // navigation, so without this a region-scoped list could be served from
      // cache to the admin who just signed in. Mirrors AppSidebar.handleLogout.
      queryClient.clear();
      setSession(session);
      // Super admins land on the platform overview dashboard; regional admins on
      // their facility review desk.
      navigate(session.role === 'super_admin' ? PATHS.dashboard : PATHS.facilityManagement, {
        replace: true,
      });
    },
  });
}

export function useForgotPasswordMutation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  return useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success(t('auth.forgotSent'));
      navigate(PATHS.resetPassword);
    },
  });
}

export function useResetPasswordMutation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const toast = useToast();
  return useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success(t('auth.resetDone'));
      navigate(PATHS.login);
    },
  });
}
