import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Badge, Button, FilterIcon, SearchInput, Select } from '@ui';
import { useAdminScope } from '../hooks/useAdminScope';
import { useScopeRegionsQuery } from '../hooks/useScopeRegionsQuery';
import { useOwnersForPicker } from '../hooks/useOwnersForPicker';
import {
  FACILITY_KINDS,
  FACILITY_STATUSES,
  SPORT_TYPES,
  type FacilityListParams,
} from '../api/facility.types';
import styles from './FacilityFiltersBar.module.css';

export interface FacilityFiltersBarProps {
  params: FacilityListParams;
  /** Merge the patch into the params (the page also resets page to 1). */
  onChange: (patch: Partial<FacilityListParams>) => void;
}

const CLEARED: Partial<FacilityListParams> = {
  status: 'all',
  kind: 'all',
  sport: 'all',
  regionId: 'all',
  ownerId: 'all',
  minRating: undefined,
};

function isSet(value: string | undefined): boolean {
  return Boolean(value) && value !== 'all';
}

/**
 * The directory's search + collapsible glass filter strip. The region options
 * are scope-aware: a regional admin only sees their assigned regions and the
 * "Outside regions" option is super_admin-only. The trigger carries a count
 * badge for the active filters; Clear resets them (search text stays).
 */
export function FacilityFiltersBar({ params, onChange }: FacilityFiltersBarProps) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const { isSuperAdmin, assignedRegionIds } = useAdminScope();
  const regionsQuery = useScopeRegionsQuery();
  const ownersQuery = useOwnersForPicker();

  const activeCount =
    [params.status, params.kind, params.sport, params.regionId, params.ownerId].filter(isSet)
      .length + (typeof params.minRating === 'number' ? 1 : 0);

  const allOption = { value: 'all', label: t('facility.filters.all') };
  const scopedRegions = (regionsQuery.data ?? []).filter(
    (region) =>
      !assignedRegionIds || assignedRegionIds.length === 0 || assignedRegionIds.includes(region.id),
  );
  const regionOptions = [
    allOption,
    ...scopedRegions.map((region) => ({ value: region.id, label: region.name })),
    ...(isSuperAdmin ? [{ value: 'orphans', label: t('facility.filters.orphansOption') }] : []),
  ];

  return (
    <div className={styles.bar}>
      <div className={styles.row}>
        <div className={styles.search}>
          <SearchInput
            value={params.q ?? ''}
            onChange={(q) => onChange({ q })}
            placeholder={t('facility.search')}
          />
        </div>
        <Button
          variant="secondary"
          leftIcon={<FilterIcon />}
          rightIcon={
            activeCount > 0 ? (
              <Badge variant="info" size="sm">
                {activeCount}
              </Badge>
            ) : undefined
          }
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          data-testid="facility-filters-toggle"
        >
          {t('facility.filters.trigger')}
        </Button>
        {activeCount > 0 && (
          <Button variant="ghost" onClick={() => onChange(CLEARED)} data-testid="facility-filters-clear">
            {t('facility.filters.clear')}
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            className={styles.collapse}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={reduceMotion ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
          >
            <div className={styles.panel}>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.status')}
                  value={params.status ?? 'all'}
                  onChange={(value) => onChange({ status: value as FacilityListParams['status'] })}
                  options={[
                    allOption,
                    ...FACILITY_STATUSES.map((status) => ({
                      value: status,
                      label: t(`status.${status}`),
                    })),
                  ]}
                />
              </div>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.kind')}
                  value={params.kind ?? 'all'}
                  onChange={(value) => onChange({ kind: value as FacilityListParams['kind'] })}
                  options={[
                    allOption,
                    ...FACILITY_KINDS.map((kind) => ({
                      value: kind,
                      label: t(`facility.kind.${kind}`),
                    })),
                  ]}
                />
              </div>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.sport')}
                  value={params.sport ?? 'all'}
                  onChange={(value) => onChange({ sport: value as FacilityListParams['sport'] })}
                  options={[
                    allOption,
                    ...SPORT_TYPES.map((sport) => ({
                      value: sport,
                      label: t(`facility.sport.${sport}`),
                    })),
                  ]}
                />
              </div>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.region')}
                  value={params.regionId ?? 'all'}
                  onChange={(value) => onChange({ regionId: value })}
                  options={regionOptions}
                />
              </div>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.owner')}
                  value={params.ownerId ?? 'all'}
                  onChange={(value) => onChange({ ownerId: value })}
                  options={[
                    allOption,
                    ...(ownersQuery.data ?? []).map((owner) => ({
                      value: owner.id,
                      label: owner.name,
                    })),
                  ]}
                />
              </div>
              <div className={styles.filter}>
                <Select
                  aria-label={t('facility.filters.rating')}
                  value={typeof params.minRating === 'number' ? String(params.minRating) : 'any'}
                  onChange={(value) =>
                    onChange({ minRating: value === 'any' ? undefined : Number(value) })
                  }
                  options={[
                    { value: 'any', label: t('facility.filters.ratingAny') },
                    { value: '3', label: t('facility.filters.rating3') },
                    { value: '4', label: t('facility.filters.rating4') },
                    { value: '4.5', label: t('facility.filters.rating45') },
                  ]}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
