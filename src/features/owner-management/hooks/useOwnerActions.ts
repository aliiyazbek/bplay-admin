import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useToast } from '@ui';
import { ownerKeys } from '../api/owner.keys';
import { updateOwnerStatus } from '../api';
import type { OwnerAction } from '../api/owner.types';

/** Approve/reject/activate/disable/block — invalidates the owners list + detail and toasts. */
export function useOwnerActions() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: OwnerAction }) =>
      updateOwnerStatus(id, action),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ownerKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ownerKeys.detail(variables.id) });
      toast.success(t(`owner.toast.${variables.action}`));
    },
  });
}
