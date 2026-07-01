import { useTranslation } from 'react-i18next';
import { IconButton, ConfirmDialog, EditIcon, TrashIcon, UserPlusIcon, PowerIcon } from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { useDeleteRegion, useToggleRegion } from '../hooks/useRegionMutations';
import type { Region } from '../api/region.types';
import styles from './RegionRowActions.module.css';

interface Props {
  region: Region;
  onEdit: (region: Region) => void;
  onAssign: (region: Region) => void;
}

export function RegionRowActions({ region, onEdit, onAssign }: Props) {
  const { t } = useTranslation();
  const toggle = useToggleRegion();
  const remove = useDeleteRegion();
  const toggleConfirm = useDisclosure();
  const deleteConfirm = useDisclosure();
  const isActive = region.isActive;

  return (
    <div className={styles.actions}>
      <IconButton
        size="sm"
        variant="ghost"
        label={t('region.actions.edit')}
        icon={<EditIcon />}
        onClick={() => onEdit(region)}
      />
      <IconButton
        size="sm"
        variant="ghost"
        label={t('region.actions.assign')}
        icon={<UserPlusIcon />}
        onClick={() => onAssign(region)}
      />
      <IconButton
        size="sm"
        variant={isActive ? 'danger' : 'ghost'}
        label={t(isActive ? 'region.actions.deactivate' : 'region.actions.activate')}
        icon={<PowerIcon />}
        onClick={toggleConfirm.open}
      />
      <IconButton
        size="sm"
        variant="danger"
        label={t('region.actions.delete')}
        icon={<TrashIcon />}
        onClick={deleteConfirm.open}
      />

      <ConfirmDialog
        isOpen={toggleConfirm.isOpen}
        onClose={toggleConfirm.close}
        onConfirm={async () => {
          await toggle.mutateAsync({ id: region.id, isActive: !isActive });
          toggleConfirm.close();
        }}
        title={t(isActive ? 'region.deactivate.title' : 'region.activate.title')}
        message={t(isActive ? 'region.deactivate.message' : 'region.activate.message')}
        confirmText={t(isActive ? 'region.deactivate.confirm' : 'region.activate.confirm')}
        variant={isActive ? 'danger' : 'primary'}
        isLoading={toggle.isPending}
      />

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={deleteConfirm.close}
        onConfirm={async () => {
          await remove.mutateAsync(region.id);
          deleteConfirm.close();
        }}
        title={t('region.delete.title')}
        message={t('region.delete.message')}
        confirmText={t('region.delete.confirm')}
        variant="danger"
        isLoading={remove.isPending}
      />
    </div>
  );
}
