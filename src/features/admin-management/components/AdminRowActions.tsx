import { useTranslation } from 'react-i18next';
import {
  IconButton,
  ConfirmDialog,
  EditIcon,
  TrashIcon,
  PowerIcon,
  EyeIcon,
  MapPinIcon,
} from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { useDeleteAdmin, useRestoreAdmin, useToggleAdmin } from '../hooks/useAdminMutations';
import type { Admin } from '../api/admin.types';
import styles from './AdminRowActions.module.css';

interface Props {
  admin: Admin;
  onView: (admin: Admin) => void;
  onEdit: (admin: Admin) => void;
  onAssign: (admin: Admin) => void;
}

export function AdminRowActions({ admin, onView, onEdit, onAssign }: Props) {
  const { t } = useTranslation();
  const toggle = useToggleAdmin();
  const remove = useDeleteAdmin();
  const restore = useRestoreAdmin();
  const suspendConfirm = useDisclosure();
  const deleteConfirm = useDisclosure();
  const restoreConfirm = useDisclosure();
  const isActive = admin.status === 'active';

  // A soft-deleted admin only offers "view details" + "restore".
  if (admin.isDeleted) {
    return (
      <div className={styles.actions}>
        <IconButton
          size="sm"
          variant="ghost"
          label={t('admin.actions.viewDetails')}
          icon={<EyeIcon />}
          onClick={() => onView(admin)}
          data-testid={`admin-view-${admin.id}`}
        />
        <IconButton
          size="sm"
          variant="ghost"
          label={t('admin.actions.restore')}
          icon={<PowerIcon />}
          onClick={restoreConfirm.open}
          data-testid={`admin-restore-${admin.id}`}
        />
        <ConfirmDialog
          isOpen={restoreConfirm.isOpen}
          onClose={restoreConfirm.close}
          onConfirm={async () => {
            await restore.mutateAsync(admin.id);
            restoreConfirm.close();
          }}
          title={t('admin.restore.title')}
          message={t('admin.restore.message')}
          confirmText={t('admin.restore.confirm')}
          variant="primary"
          isLoading={restore.isPending}
        />
      </div>
    );
  }

  return (
    <div className={styles.actions}>
      <IconButton
        size="sm"
        variant="ghost"
        label={t('admin.actions.viewDetails')}
        icon={<EyeIcon />}
        onClick={() => onView(admin)}
        data-testid={`admin-view-${admin.id}`}
      />
      <IconButton
        size="sm"
        variant="ghost"
        label={t('admin.actions.edit')}
        icon={<EditIcon />}
        onClick={() => onEdit(admin)}
      />
      {admin.scope === 'regional' && (
        <IconButton
          size="sm"
          variant="ghost"
          label={t('admin.actions.assignRegions')}
          icon={<MapPinIcon />}
          onClick={() => onAssign(admin)}
        />
      )}
      <IconButton
        size="sm"
        variant={isActive ? 'caution' : 'ghost'}
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
        variant={isActive ? 'caution' : 'primary'}
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
