import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, CheckIcon, XIcon, PowerIcon, BanIcon } from '@ui';
import { actionVariant, availableActions } from './ownerActions';
import { OwnerActionConfirm } from './OwnerActionConfirm';
import type { Owner, OwnerAction } from '../api/owner.types';
import styles from './OwnerStatusActions.module.css';

interface Props {
  owner: Owner;
}

const ACTION_ICON: Record<OwnerAction, ReactNode> = {
  approve: <CheckIcon />,
  reject: <XIcon />,
  suspend: <PowerIcon />,
  activate: <PowerIcon />,
  block: <BanIcon />,
  unblock: <PowerIcon />,
};

/** Full set of account actions on the owner detail header. */
export function OwnerStatusActions({ owner }: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<OwnerAction | null>(null);
  const actions = availableActions(owner);

  if (actions.length === 0) return null;

  return (
    <div className={styles.actions}>
      {actions.map((action) => {
        const variant = actionVariant(action);
        return (
          <Button
            key={action}
            leftIcon={ACTION_ICON[action]}
            variant={variant === 'primary' ? 'secondary' : variant}
            onClick={() => setPending(action)}
            data-testid={`owner-action-${action}`}
          >
            {t(`owner.actions.${action}`)}
          </Button>
        );
      })}

      <OwnerActionConfirm owner={owner} action={pending} onClose={() => setPending(null)} />
    </div>
  );
}
