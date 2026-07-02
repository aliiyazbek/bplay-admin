import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button } from '@ui';
import { useAssignRegions } from '../hooks/useAdminMutations';
import { RegionPicker } from './RegionPicker';
import type { Admin } from '../api/admin.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

/**
 * Standalone region (re)assignment for a regional admin — pre-checks the admin's
 * current regions and replaces the whole set on submit (write-through to regions).
 */
export function AssignRegionsModal({ isOpen, onClose, admin }: Props) {
  const { t } = useTranslation();
  const mutation = useAssignRegions();
  const [selected, setSelected] = useState<string[]>([]);

  // Pre-check from the admin's current regions; reset on (re)open.
  useEffect(() => {
    if (isOpen) setSelected(admin?.assignedRegionIds ?? []);
  }, [isOpen, admin]);

  const submit = async () => {
    if (!admin) return;
    await mutation.mutateAsync({ id: admin.id, regionIds: selected });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.assign.title')}
      description={t('admin.assign.subtitle')}
      size="lg"
      closeLabel={t('common.cancel')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={submit} isLoading={mutation.isPending} data-testid="admin-assign-submit">
            {t('admin.assign.submit')}
          </Button>
        </>
      }
    >
      <RegionPicker value={selected} onChange={setSelected} />
    </Modal>
  );
}
