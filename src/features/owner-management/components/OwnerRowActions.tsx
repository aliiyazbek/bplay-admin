import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, EyeIcon, CheckIcon, XIcon, BanIcon, PowerIcon } from '@ui';
import { availableActions } from './ownerActions';
import { OwnerActionConfirm } from './OwnerActionConfirm';
import type { Owner, OwnerAction } from '../api/owner.types';
import styles from './OwnerRowActions.module.css';

interface Props {
  owner: Owner;
  onView: (owner: Owner) => void;
}

const ACTION_ICON: Record<OwnerAction, ReactNode> = {
  approve: <CheckIcon />,
  reject: <XIcon />,
  suspend: <PowerIcon />,
  activate: <PowerIcon />,
  block: <BanIcon />,
  unblock: <PowerIcon />,
};

const GHOST_ACTIONS: readonly OwnerAction[] = ['approve', 'activate', 'unblock'];

/** Row-level actions: View + the account actions valid for this owner. */
export function OwnerRowActions({ owner, onView }: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<OwnerAction | null>(null);
  const actions = availableActions(owner);

  return (
    <div className={styles.actions}>
      <IconButton
        size="sm"
        variant="ghost"
        label={t('owner.actions.view')}
        icon={<EyeIcon />}
        onClick={() => onView(owner)}
        data-testid={`owner-view-${owner.id}`}
      />
      {actions.map((action) => (
        <IconButton
          key={action}
          size="sm"
          variant={GHOST_ACTIONS.includes(action) ? 'ghost' : action === 'suspend' ? 'caution' : 'danger'}
          label={t(`owner.actions.${action}`)}
          icon={ACTION_ICON[action]}
          onClick={() => setPending(action)}
          data-testid={`owner-${action}-${owner.id}`}
        />
      ))}

      <OwnerActionConfirm owner={owner} action={pending} onClose={() => setPending(null)} />
    </div>
  );
}
