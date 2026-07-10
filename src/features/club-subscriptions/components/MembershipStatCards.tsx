import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  StatCard,
  CreditCardIcon,
  CheckIcon,
  ClockIcon,
  AlertTriangleIcon,
  BanIcon,
  DownloadIcon,
} from '@ui';
import type { MembershipStats } from '../api';
import styles from './MembershipStatCards.module.css';

export interface MembershipStatCardsProps {
  stats?: MembershipStats;
}

/** The KPI row: total / active / near-expiry / churn-risk / expired / revenue. */
export function MembershipStatCards({ stats }: MembershipStatCardsProps) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const revenue = stats ? `${nf.format(stats.revenueSyp)} ${t('membership.currency')}` : '—';

  return (
    <div className={styles.grid} data-testid="membership-stats">
      <StatCard
        label={t('membership.stats.total')}
        value={stats?.total ?? 0}
        icon={<CreditCardIcon />}
        accent="primary"
        countUp
      />
      <StatCard
        label={t('membership.stats.active')}
        value={stats?.active ?? 0}
        icon={<CheckIcon />}
        accent="info"
        countUp
      />
      <StatCard
        label={t('membership.stats.nearExpiry')}
        value={stats?.nearExpiry ?? 0}
        icon={<ClockIcon />}
        accent="warning"
        countUp
      />
      <StatCard
        label={t('membership.stats.churnRisk')}
        value={stats?.churnRisk ?? 0}
        icon={<AlertTriangleIcon />}
        accent="secondary"
        countUp
      />
      <StatCard
        label={t('membership.stats.expired')}
        value={stats?.expired ?? 0}
        icon={<BanIcon />}
        accent="secondary"
        countUp
      />
      <StatCard
        label={t('membership.stats.revenue')}
        value={revenue}
        icon={<DownloadIcon />}
        accent="secondary"
      />
    </div>
  );
}
