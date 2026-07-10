import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StatCard,
  CalendarIcon,
  ClockIcon,
  CheckIcon,
  AlertTriangleIcon,
  BuildingIcon,
} from '@ui';
import type { BookingStats } from '../api/booking.types';
import styles from './BookingStatCards.module.css';

interface Props {
  stats?: BookingStats;
}

/** The KPI row: total / under-review / confirmed / completed / attention / revenue. */
export function BookingStatCards({ stats }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const revenue = stats ? `${nf.format(stats.revenueSyp)} ${t('booking.currency')}` : '—';

  return (
    <div className={styles.grid} data-testid="booking-stats">
      <StatCard
        label={t('booking.stats.total')}
        value={stats?.total ?? 0}
        icon={<CalendarIcon />}
        accent="primary"
        countUp
      />
      <StatCard
        label={t('booking.stats.underReview')}
        value={stats?.underReview ?? 0}
        icon={<ClockIcon />}
        accent="warning"
        countUp
      />
      <StatCard
        label={t('booking.stats.confirmed')}
        value={stats?.confirmed ?? 0}
        icon={<CheckIcon />}
        accent="info"
        countUp
      />
      <StatCard
        label={t('booking.stats.completed')}
        value={stats?.completed ?? 0}
        icon={<CheckIcon />}
        accent="primary"
        countUp
      />
      <StatCard
        label={t('booking.stats.attention')}
        value={stats?.attention ?? 0}
        icon={<AlertTriangleIcon />}
        accent="warning"
        countUp
      />
      <StatCard
        label={t('booking.stats.revenue')}
        value={revenue}
        icon={<BuildingIcon />}
        accent="secondary"
      />
    </div>
  );
}
