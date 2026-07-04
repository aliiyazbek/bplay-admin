import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui';
import { actionVariant, availableActions } from './ownerActions';
import { OwnerActionConfirm } from './OwnerActionConfirm';
import type { Owner, OwnerAction } from '../api/owner.types';
import styles from './OwnerStatusActions.module.css';

interface Props {
  owner: Owner;
}

/** Full set of status actions used on the owner detail page. */
export function OwnerStatusActions({ owner }: Props) {
  const { t } = useTranslation();
  const [pending, setPending] = useState<OwnerAction | null>(null);
  const actions = availableActions(owner);

  if (actions.length === 0) {
    return null;
  }

  return (
    <div className={styles.actions}>
      {actions.map((action) => {
        const variant = actionVariant(action);
        return (
          <Button
            key={action}
            size="sm"
            variant={variant === 'primary' ? 'secondary' : variant}
            onClick={() => setPending(action)}
          >
            {t(`owner.actions.${action}`)}
          </Button>
        );
      })}

      <OwnerActionConfirm owner={owner} action={pending} onClose={() => setPending(null)} />
    </div>
  );
}
