import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Input, useToast } from '@ui';
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

  // Reset local + mutation state whenever the modal (re)opens — but never auto-fire;
  // a password reset must be an explicit, deliberate action.
  useEffect(() => {
    if (isOpen) {
      setPassword(null);
      setCopied(false);
      reset.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, admin]);

  const runReset = async () => {
    if (!admin) return;
    try {
      setPassword(await reset.mutateAsync(admin.id));
    } catch {
      /* error surfaced via reset.isError below */
    }
  };

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
        <>
          <p className={styles.revealWarn}>{t('admin.reset.confirmHint')}</p>
          {reset.isError && (
            <p className={styles.revealWarn} role="alert">
              {t('admin.reset.error')}
            </p>
          )}
          <Button
            onClick={runReset}
            isLoading={reset.isPending}
            fullWidth
            data-testid="admin-reset-run"
          >
            {t('admin.reset.confirm')}
          </Button>
        </>
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
