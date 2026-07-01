import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Modal, Field, Input, Button } from '@ui';
import { editAdminSchema, type EditAdminValues } from '../api/admin.schema';
import { useUpdateAdmin } from '../hooks/useAdminMutations';
import type { Admin } from '../api/admin.types';
import styles from './adminForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

export function EditAdminModal({ isOpen, onClose, admin }: Props) {
  const { t } = useTranslation();
  const mutation = useUpdateAdmin();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAdminValues>({
    resolver: zodResolver(editAdminSchema),
    defaultValues: { name: '', email: '' },
  });

  useEffect(() => {
    if (admin) reset({ name: admin.name, email: admin.email });
  }, [admin, reset]);

  const submit = handleSubmit(async (values) => {
    if (!admin) return;
    await mutation.mutateAsync({ id: admin.id, input: values });
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.edit_modal.title')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="edit-admin" isLoading={mutation.isPending}>
            {t('admin.edit_modal.submit')}
          </Button>
        </>
      }
    >
      <form id="edit-admin" className={styles.form} onSubmit={submit} noValidate>
        <Field label={t('admin.invite_modal.name')} htmlFor="e-name" error={errors.name ? t(errors.name.message ?? '') : undefined}>
          <Input id="e-name" {...register('name')} />
        </Field>
        <Field label={t('admin.invite_modal.email')} htmlFor="e-email" error={errors.email ? t(errors.email.message ?? '') : undefined}>
          <Input id="e-email" type="email" {...register('email')} />
        </Field>
      </form>
    </Modal>
  );
}
