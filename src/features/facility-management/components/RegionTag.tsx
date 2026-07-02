import { useTranslation } from 'react-i18next';
import { GlobeIcon, MapPinIcon, clsx } from '@ui';
import styles from './RegionTag.module.css';

export interface RegionTagProps {
  /** Names of the active scope regions containing the facility. */
  regionNames: string[];
  /** True when no active scope region contains the facility. */
  isOrphan: boolean;
  /** Compact = first region + "+N" (directory table cells). */
  compact?: boolean;
}

/**
 * Where a facility lives in the scope model: its containing region(s), or an
 * amber "outside regions" tag for orphans (only super_admin ever sees those).
 */
export function RegionTag({ regionNames, isOrphan, compact = false }: RegionTagProps) {
  const { t } = useTranslation();

  if (isOrphan || regionNames.length === 0) {
    return (
      <span className={clsx(styles.tag, styles.orphan)}>
        <GlobeIcon className={styles.icon} />
        {t('facility.queue.orphan')}
      </span>
    );
  }

  const [first, ...rest] = regionNames;
  return (
    <span className={styles.tag} title={regionNames.join(' · ')}>
      <MapPinIcon className={styles.icon} />
      {compact ? first : regionNames.join(' · ')}
      {compact && rest.length > 0 && <span className={styles.more}>+{rest.length}</span>}
    </span>
  );
}
