import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Button, Badge } from '@ui';
import { useNeighbourhoods } from '@features/region-management/hooks/useNeighbourhoods';
import { useAssignRegions } from '../hooks/useAdminMutations';
import { RegionPicker } from './RegionPicker';
import type { Admin } from '../api/admin.types';
import styles from './adminForm.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  admin: Admin | null;
}

/**
 * Region (re)assignment for a regional admin, at BOTH levels of the geography.
 *
 * A city grant covers the whole city. Beneath it, individual neighbourhoods can
 * be EXCLUDED — the backend's scope resolver gives exclusions the highest
 * precedence, so "Riyadh except Al Malaz" is expressible. Only cities that
 * actually have neighbourhoods offer the carve-out.
 *
 * The narrowing form (grant specific neighbourhoods INSTEAD of the city) is
 * supported by the API but not offered here: it and a city grant are two ways
 * of saying overlapping things, and presenting both invites contradictory
 * selections. Exclusion alone covers the real use case without that ambiguity.
 */
export function AssignRegionsModal({ isOpen, onClose, admin }: Props) {
  const { t } = useTranslation();
  const mutation = useAssignRegions();
  const { data: neighbourhoods } = useNeighbourhoods();
  const [selected, setSelected] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);

  // Pre-check from the admin's current scope; reset on (re)open.
  useEffect(() => {
    if (isOpen) {
      setSelected(admin?.assignedRegionIds ?? []);
      setExcluded(admin?.excludedNeighbourhoodIds ?? []);
    }
  }, [isOpen, admin]);

  /** Neighbourhoods of the currently selected cities, grouped by city. */
  const groups = useMemo(() => {
    const byCity = new Map<string, { cityName: string; items: typeof neighbourhoods }>();
    for (const hood of neighbourhoods ?? []) {
      if (!selected.includes(hood.cityId)) continue;
      const entry = byCity.get(hood.cityId) ?? { cityName: hood.cityName, items: [] };
      entry.items = [...(entry.items ?? []), hood];
      byCity.set(hood.cityId, entry);
    }
    return [...byCity.entries()].map(([cityId, entry]) => ({ cityId, ...entry }));
  }, [neighbourhoods, selected]);

  const toggleExcluded = (id: string) => {
    setExcluded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const submit = async () => {
    if (!admin) return;
    // Only keep exclusions that still sit inside a selected city — dropping a
    // city must not leave an orphaned carve-out pointing into it.
    const live = new Set(
      (neighbourhoods ?? [])
        .filter((hood) => selected.includes(hood.cityId))
        .map((hood) => hood.id),
    );
    await mutation.mutateAsync({
      id: admin.id,
      regionIds: selected,
      neighbourhoods: {
        includedIds: [],
        excludedIds: excluded.filter((id) => live.has(id)),
      },
    });
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

      {groups.length > 0 && (
        <section className={styles.exclusions} data-testid="admin-assign-exclusions">
          <h3 className={styles.exclusionsTitle}>{t('admin.assign.exclude.title')}</h3>
          <p className={styles.exclusionsHint}>{t('admin.assign.exclude.hint')}</p>

          {groups.map((group) => (
            <div key={group.cityId} className={styles.exclusionGroup}>
              <span className={styles.exclusionCity}>{group.cityName}</span>
              <div className={styles.exclusionChips}>
                {(group.items ?? []).map((hood) => {
                  const isExcluded = excluded.includes(hood.id);
                  return (
                    <button
                      key={hood.id}
                      type="button"
                      className={styles.exclusionChip}
                      onClick={() => toggleExcluded(hood.id)}
                      aria-pressed={isExcluded}
                      data-testid={`admin-exclude-${hood.id}`}
                    >
                      <Badge variant={isExcluded ? 'danger' : 'neutral'}>
                        {isExcluded ? t('admin.assign.exclude.excluded') : t('admin.assign.exclude.included')}
                      </Badge>
                      <span>{hood.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}
    </Modal>
  );
}
