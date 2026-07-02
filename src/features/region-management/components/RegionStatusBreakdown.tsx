import { useTranslation } from 'react-i18next';
import { Card, clsx } from '@ui';
import type { FacilityStatus, RegionFacility } from '@features/facility-management/api';
import styles from './RegionStatusBreakdown.module.css';

interface Props {
  facilities: RegionFacility[];
}

/** Display order (active first) + the token color class per status. */
const ORDER: FacilityStatus[] = ['active', 'pending', 'suspended', 'rejected', 'owner_suspended'];
const COLOR_CLASS: Record<FacilityStatus, string> = {
  active: 'cActive',
  pending: 'cPending',
  suspended: 'cSuspended',
  rejected: 'cRejected',
  owner_suspended: 'cOwnerSuspended',
};

/**
 * A dependency-free "facilities by status" breakdown: a proportional bar
 * (segment widths from each status count — runtime geometry, the sanctioned
 * inline-style exception, same as Skeleton) plus a legend of counts.
 */
export function RegionStatusBreakdown({ facilities }: Props) {
  const { t } = useTranslation();
  const total = facilities.length;
  if (total === 0) return null;

  const segments = ORDER.map((status) => ({
    status,
    count: facilities.filter((facility) => facility.status === status).length,
  })).filter((segment) => segment.count > 0);

  return (
    <Card className={styles.card} data-testid="region-detail-breakdown">
      <h2 className={styles.title}>{t('region.detail.breakdown.title')}</h2>

      <div className={styles.bar} role="img" aria-label={t('region.detail.breakdown.title')}>
        {segments.map(({ status, count }) => (
          <span
            key={status}
            className={clsx(styles.seg, styles[COLOR_CLASS[status]])}
            style={{ flexGrow: count }}
          />
        ))}
      </div>

      <ul className={styles.legend}>
        {segments.map(({ status, count }) => (
          <li key={status} className={styles.legendItem}>
            <span className={clsx(styles.dot, styles[COLOR_CLASS[status]])} aria-hidden />
            <span className={styles.legendLabel}>{t(`status.${status}`)}</span>
            <span className={styles.legendCount}>{count}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
