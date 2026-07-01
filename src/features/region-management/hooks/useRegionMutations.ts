import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@ui';
import { regionKeys } from '../api/region.keys';
import {
  assignAdmin,
  createRegion,
  deleteRegion,
  toggleRegionActive,
  updateRegion,
} from '../api';
import type { CreateRegionInput, UpdateRegionInput } from '../api/region.types';

export function useCreateRegion() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (input: CreateRegionInput) => createRegion(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      toast.success(t('region.toast.created'));
    },
  });
}

export function useUpdateRegion() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateRegionInput }) =>
      updateRegion(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      toast.success(t('region.toast.updated'));
    },
  });
}

export function useToggleRegion() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleRegionActive(id, isActive),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      toast.success(t(variables.isActive ? 'region.toast.activated' : 'region.toast.deactivated'));
    },
  });
}

export function useAssignAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, adminId, adminName }: { id: string; adminId: string; adminName?: string }) =>
      assignAdmin(id, adminId, adminName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      toast.success(t('region.toast.assigned'));
    },
  });
}

export function useDeleteRegion() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => deleteRegion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regionKeys.lists() });
      toast.success(t('region.toast.deleted'));
    },
  });
}
