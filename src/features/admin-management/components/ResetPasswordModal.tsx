import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input, Spinner, useToast } from '@ui';
import { useResetAdminPassword } from '../hooks/useAdminMutations';
import type { Admin } from '../api/admin.types';
import styles from './adminForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

/**
 * Resets an admin's password back to the ORIGINAL value we issued and reveals it
 * once (with a copy button) so the super-admin can hand it over. The plaintext is
 * a mock-only capability — a real backend issues a reset link instead.
 */
export function ResetPasswordModal({ isOpen, onClose, admin }: Props) {
  const { t } = useTranslation();
  const toast = useToast();
  const reset = useResetAdminPassword();
  const [password, setPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen || !admin) return;
    setPassword(null);
    setCopied(false);
    let cancelled = false;
    reset
      .mutateAsync(admin.id)
      .then((value) => {
        if (!cancelled) setPassword(value);
      })
      .catch(() => {
        /* surfaced by the mutation's error state */
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, admin]);

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      toast.success(t('admin.reset.copiedToast'));
    } catch {
      /* clipboard unavailable — the value is still visible to copy manually */
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.reset.title')}
      description={admin ? t('admin.reset.subtitle', { name: admin.name }) : undefined}
      size="sm"
      closeLabel={t('common.close')}
      footer={<Button onClick={onClose}>{t('common.close')}</Button>}
    >
      {password === null ? (
        <div className={styles.loading}>
          <Spinner />
        </div>
      ) : (
        <>
          <div className={styles.revealRow}>
            <div className={styles.revealField}>
              <Input
                readOnly
                value={password}
                dir="ltr"
                aria-label={t('admin.reset.title')}
                data-testid="admin-reset-value"
              />
            </div>
            <Button variant="secondary" onClick={copy} data-testid="admin-reset-copy">
              {copied ? t('admin.reset.copied') : t('admin.reset.copy')}
            </Button>
          </div>
          <p className={styles.revealWarn}>{t('admin.reset.warn')}</p>
        </>
      )}
    </Modal>
  );
}
