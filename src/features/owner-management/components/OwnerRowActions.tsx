import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IconButton, EyeIcon, CheckIcon, XIcon, BanIcon } from '@ui';
import { availableActions } from './ownerActions';
import { OwnerActionConfirm } from './OwnerActionConfirm';
import type { Owner, OwnerAction } from '../api/owner.types';
import styles from './OwnerRowActions.module.css';

interface Props {
  owner: Owner;
  onView: (owner: Owner) => void;
}

const ROW_ACTIONS: readonly OwnerAction[] = ['approve', 'reject', 'block'];

/** Row-level actions: View + the status actions valid for this owner (approve/reject/block). */
export function OwnerRowActions({ owner, onView }: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<OwnerAction | null>(null);
  const actions = availableActions(owner).filter((action) => ROW_ACTIONS.includes(action));

  return (
    <div className={styles.actions}>
      <IconButton
        size="sm"
        variant="ghost"
        label={t('owner.actions.view')}
        icon={<EyeIcon />}
        onClick={() => onView(owner)}
      />
      {actions.map((action) => (
        <IconButton
          key={action}
          size="sm"
          variant={action === 'approve' ? 'ghost' : 'danger'}
          label={t(`owner.actions.${action}`)}
          icon={action === 'approve' ? <CheckIcon /> : action === 'reject' ? <XIcon /> : <BanIcon />}
          onClick={() => setPending(action)}
        />
      ))}

      <OwnerActionConfirm owner={owner} action={pending} onClose={() => setPending(null)} />
    </div>
  );
}
