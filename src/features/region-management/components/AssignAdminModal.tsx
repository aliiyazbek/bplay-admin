import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Modal, Field, Select, Button, Spinner } from '@ui';
import { assignAdminSchema, type AssignAdminValues } from '../api/region.schema';
import { useAssignAdmin } from '../hooks/useRegionMutations';
import { useAdminsForAssign } from '../hooks/useAdminsForAssign';
import type { Region } from '../api/region.types';
import styles from './regionForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  region: Region | null;
}

export function AssignAdminModal({ isOpen, onClose, region }: Props) {
  const { t } = useTranslation();
  const mutation = useAssignAdmin();
  const { data: admins, isLoading } = useAdminsForAssign();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AssignAdminValues>({
    resolver: zodResolver(assignAdminSchema),
    defaultValues: { adminId: '' },
  });

  useEffect(() => {
    if (isOpen) reset({ adminId: region?.assignedAdminId ?? '' });
  }, [isOpen, region, reset]);

  const submit = handleSubmit(async (values) => {
    if (!region) return;
    const adminName = admins?.find((admin) => admin.id === values.adminId)?.name;
    await mutation.mutateAsync({ id: region.id, adminId: values.adminId, adminName });
    onClose();
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('region.assign.title')}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="submit"
            form="assign-admin"
            isLoading={mutation.isPending}
            disabled={isLoading}
          >
            {t('region.assign.submit')}
          </Button>
        </>
      }
    >
      <form id="assign-admin" className={styles.form} onSubmit={submit} noValidate>
        {isLoading ? (
          <Spinner />
        ) : (
          <Field
            label={t('region.assign.admin')}
            htmlFor="assign-admin-select"
            error={errors.adminId ? t(errors.adminId.message ?? '') : undefined}
          >
            <Controller
              control={control}
              name="adminId"
              render={({ field }) => (
                <Select
                  id="assign-admin-select"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder={t('region.assign.placeholder')}
                  options={(admins ?? []).map((admin) => ({
                    value: admin.id,
                    label: admin.name,
                  }))}
                />
              )}
            />
          </Field>
        )}
      </form>
    </Modal>
  );
}
