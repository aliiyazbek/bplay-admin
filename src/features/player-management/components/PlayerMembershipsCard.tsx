import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, DataTable, EmptyState, InboxIcon, type Column } from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';
import type { PlayerMembership } from '../api/player.types';
import { usePlayerMemberships } from '../hooks/usePlayerRelated';
import styles from './playerCards.module.css';

interface Props {
  playerId: string;
}

/** The player's sports-club memberships (subscriptions to club packages). */
export function PlayerMembershipsCard({ playerId }: Props) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlayerMemberships(playerId);
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);
  const fmt = (value: string) =>
    new Date(value).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });

  const columns = useMemo<Column<PlayerMembership>[]>(
    () => [
      {
        key: 'club',
        header: t('player.memberships.club'),
        render: (m) => (
          <span className={styles.nameCell}>
            <span>{m.clubName}</span>
            <span className={styles.nameSub}>{m.planName}</span>
          </span>
        ),
      },
      {
        key: 'price',
        header: t('player.memberships.price'),
        align: 'end',
        render: (m) => (
          <span className={styles.invoiceAmount}>
            {nf.format(m.priceSyp)} {t('player.detail.stats.currency')}
          </span>
        ),
      },
      {
        key: 'period',
        header: t('player.memberships.period'),
        render: (m) => (
          <span className={styles.nameSub} dir="ltr">
            {fmt(m.startDate)} – {fmt(m.endDate)}
          </span>
        ),
      },
      {
        key: 'autoRenew',
        header: t('player.memberships.autoRenew'),
        render: (m) => t(m.autoRenew ? 'player.memberships.autoOn' : 'player.memberships.autoOff'),
      },
      {
        key: 'status',
        header: t('player.memberships.status'),
        render: (m) => (
          <Badge variant={statusToBadgeVariant(m.status)}>{t(`player.membershipStatus.${m.status}`)}</Badge>
        ),
      },
    ],
    [t, locale, nf],
  );

  return (
    <Card padding="lg" className={styles.card} data-testid="player-memberships-card">
      <div className={styles.head}>
        <h2 className={styles.title}>{t('player.memberships.title')}</h2>
      </div>
      <DataTable<PlayerMembership>
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(m) => m.id}
        emptyState={<EmptyState icon={<InboxIcon />} title={t('player.memberships.empty')} />}
      />
    </Card>
  );
}
