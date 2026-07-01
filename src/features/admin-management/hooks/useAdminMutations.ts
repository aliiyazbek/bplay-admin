import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@ui';
import { adminKeys } from '../api/admin.keys';
import { createAdmin, deleteAdmin, toggleAdminActive, updateAdmin } from '../api';
import type { CreateAdminInput, UpdateAdminInput } from '../api/admin.types';

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (input: CreateAdminInput) => createAdmin(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      toast.success(t('admin.toast.created'));
    },
  });
}

export function useUpdateAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAdminInput }) => updateAdmin(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      toast.success(t('admin.toast.updated'));
    },
  });
}

export function useToggleAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleAdminActive(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      toast.success(t(variables.isActive ? 'admin.toast.activated' : 'admin.toast.suspended'));
    },
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.lists() });
      toast.success(t('admin.toast.deleted'));
    },
  });
}
