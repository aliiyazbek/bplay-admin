import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Modal, Field, Input, Button } from '@ui';
import { inviteAdminSchema, type InviteAdminValues } from '../api/admin.schema';
import { useCreateAdmin } from '../hooks/useAdminMutations';
import styles from './adminForm.module.css';

export function InviteAdminModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const mutation = useCreateAdmin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteAdminValues>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const submit = handleSubmit(async (values) => {
    await mutation.mutateAsync(values);
    reset();
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.invite_modal.title')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="invite-admin" isLoading={mutation.isPending}>
            {t('admin.invite_modal.submit')}
          </Button>
        </>
      }
    >
      <form id="invite-admin" className={styles.form} onSubmit={submit} noValidate>
        <Field label={t('admin.invite_modal.name')} htmlFor="a-name" error={errors.name ? t(errors.name.message ?? '') : undefined}>
          <Input id="a-name" {...register('name')} />
        </Field>
        <Field label={t('admin.invite_modal.email')} htmlFor="a-email" error={errors.email ? t(errors.email.message ?? '') : undefined}>
          <Input id="a-email" type="email" {...register('email')} />
        </Field>
        <Field
          label={t('admin.invite_modal.password')}
          htmlFor="a-pass"
          error={errors.password ? t(errors.password.message ?? '') : undefined}
        >
          <Input id="a-pass" type="password" {...register('password')} />
        </Field>
      </form>
    </Modal>
  );
}
