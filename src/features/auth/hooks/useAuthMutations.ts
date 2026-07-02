import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@shared/stores/authStore';
import { useToast } from '@ui';
import { PATHS } from '@app/router/paths';
import { forgotPassword, login, resetPassword } from '../api';

export function useLoginMutation() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.login);
  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
      // Admins land on their review desk; super admins on admin management.
      navigate(session.role === 'super_admin' ? PATHS.adminManagement : PATHS.facilityManagement, {
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
