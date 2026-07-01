import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@ui';
import { actionVariant } from './ownerActions';
import { useOwnerActions } from '../hooks/useOwnerActions';
import type { Owner, OwnerAction } from '../api/owner.types';

interface Props {
  owner: Owner;
  action: OwnerAction | null;
  onClose: () => void;
  onDone?: () => void;
}

/** A shared ConfirmDialog that runs a single owner status action. */
export function OwnerActionConfirm({ owner, action, onClose, onDone }: Props) {
  const { t } = useTranslation();
  const mutation = useOwnerActions();

  return (
    <ConfirmDialog
      isOpen={action !== null}
      onClose={onClose}
      onConfirm={async () => {
        if (!action) return;
        await mutation.mutateAsync({ id: owner.id, action });
        onClose();
        onDone?.();
      }}
      title={action ? t(`owner.confirm.${action}.title`) : ''}
      message={action ? t(`owner.confirm.${action}.message`, { name: owner.name }) : undefined}
      confirmText={action ? t(`owner.actions.${action}`) : ''}
      variant={action ? actionVariant(action) : 'primary'}
      isLoading={mutation.isPending}
    />
  );
}
