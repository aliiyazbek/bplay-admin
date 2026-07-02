import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@ui';
import { adminKeys } from '../api/admin.keys';
import {
  assignRegions,
  createAdmin,
  deleteAdmin,
  resetAdminPassword,
  restoreAdmin,
  setAdminScope,
  toggleAdminActive,
  updateAdmin,
} from '../api';
import type { AdminScope, CreateAdminInput, UpdateAdminInput } from '../api/admin.types';

// Assignment writes THROUGH to the region store, so those mutations must refresh
// the region slice too (lists, chips, derive hooks all live under ['regions']).
const REGION_KEY = ['regions'] as const;

export function useCreateAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (input: CreateAdminInput) => createAdmin(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
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
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
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
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      toast.success(t(variables.isActive ? 'admin.toast.activated' : 'admin.toast.suspended'));
    },
  });
}

/** Promote/demote the oversight tier (promoting to general clears the regions). */
export function useSetAdminScope() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, scope }: { id: string; scope: AdminScope }) => setAdminScope(id, scope),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success(t(variables.scope === 'general' ? 'admin.toast.promoted' : 'admin.toast.demoted'));
    },
  });
}

/** Replace an admin's whole region set (many-to-many, write-through to regions). */
export function useAssignRegions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: ({ id, regionIds }: { id: string; regionIds: string[] }) =>
      assignRegions(id, regionIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success(t('admin.toast.assigned'));
    },
  });
}

/** Reset to the original password and return it so the caller can reveal it once. */
export function useResetAdminPassword() {
  return useMutation({
    mutationFn: (id: string) => resetAdminPassword(id),
  });
}

export function useDeleteAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: () => {
      // Delete clears the admin from their regions (write-through), so refresh
      // the region slice too.
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success(t('admin.toast.deleted'));
    },
  });
}

export function useRestoreAdmin() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: (id: string) => restoreAdmin(id),
    onSuccess: () => {
      // A restored admin comes back unassigned; refresh regions defensively.
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: REGION_KEY });
      toast.success(t('admin.toast.restored'));
    },
  });
}
