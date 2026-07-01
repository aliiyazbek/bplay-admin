import { useTranslation } from 'react-i18next';
import { IconButton, ConfirmDialog, EditIcon, TrashIcon, PowerIcon } from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { useDeleteAdmin, useToggleAdmin } from '../hooks/useAdminMutations';
import type { Admin } from '../api/admin.types';
import styles from './AdminRowActions.module.css';

interface Props {
  admin: Admin;
  onEdit: (admin: Admin) => void;
}

export function AdminRowActions({ admin, onEdit }: Props) {
  const { t } = useTranslation();
  const toggle = useToggleAdmin();
  const remove = useDeleteAdmin();
  const suspendConfirm = useDisclosure();
  const deleteConfirm = useDisclosure();
  const isActive = admin.status === 'active';

  return (
    <div className={styles.actions}>
      <IconButton
        size="sm"
        variant="ghost"
        label={t('admin.actions.edit')}
        icon={<EditIcon />}
        onClick={() => onEdit(admin)}
      />
      <IconButton
        size="sm"
        variant={isActive ? 'danger' : 'ghost'}
        label={t(isActive ? 'admin.actions.suspend' : 'admin.actions.activate')}
        icon={<PowerIcon />}
        onClick={suspendConfirm.open}
      />
      <IconButton
        size="sm"
        variant="danger"
        label={t('admin.actions.delete')}
        icon={<TrashIcon />}
        onClick={deleteConfirm.open}
      />

      <ConfirmDialog
        isOpen={suspendConfirm.isOpen}
        onClose={suspendConfirm.close}
        onConfirm={async () => {
          await toggle.mutateAsync({ id: admin.id, isActive: !isActive });
          suspendConfirm.close();
        }}
        title={t(isActive ? 'admin.suspend.title' : 'admin.activate.title')}
        message={t(isActive ? 'admin.suspend.message' : 'admin.activate.message')}
        confirmText={t(isActive ? 'admin.suspend.confirm' : 'admin.activate.confirm')}
        variant={isActive ? 'danger' : 'primary'}
        isLoading={toggle.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={async () => {
          await remove.mutateAsync(admin.id);
          deleteConfirm.close();
        }}
        title={t('admin.delete.title')}
        message={t('admin.delete.message')}
        confirmText={t('admin.delete.confirm')}
        variant="danger"
        isLoading={remove.isPending}
      />
    </div>
  );
}
