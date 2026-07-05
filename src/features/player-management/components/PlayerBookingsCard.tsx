import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge, DataTable, EmptyState, InboxIcon, type Column } from '@ui';
import { bookingStatusBadgeVariant, type PlayerBooking } from '../api/player.types';
import { usePlayerBookings } from '../hooks/usePlayerRelated';
import styles from './playerCards.module.css';

interface Props {
  playerId: string;
}

/** The player's booking history — facility/court, sport, date, status, amount, payment. */
export function PlayerBookingsCard({ playerId }: Props) {
  const { t, i18n } = useTranslation();
  const { data, isLoading, isError, refetch } = usePlayerBookings(playerId);
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const nf = useMemo(() => new Intl.NumberFormat(locale), [locale]);

  const columns = useMemo<Column<PlayerBooking>[]>(
    () => [
      {
        key: 'facility',
        header: t('player.bookings.facility'),
        render: (b) => (
          <span className={styles.nameCell}>
            <span>{b.facilityName}</span>
            <span className={styles.nameSub}>{b.courtName}</span>
          </span>
        ),
      },
      { key: 'sport', header: t('player.bookings.sport'), render: (b) => t(`player.sport.${b.sport}`) },
      {
        key: 'date',
        header: t('player.bookings.date'),
        render: (b) => (
          <span className={styles.nameCell}>
            <span>{new Date(b.date).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <span className={styles.nameSub} dir="ltr">{b.startTime}</span>
          </span>
        ),
      },
      {
        key: 'amount',
        header: t('player.bookings.amount'),
        align: 'end',
        render: (b) => (
          <span className={styles.invoiceAmount}>
            {nf.format(b.amountSyp)} {t('player.detail.stats.currency')}
          </span>
        ),
      },
      { key: 'payment', header: t('player.bookings.payment'), render: (b) => t(`player.payment.${b.paymentMethod}`) },
      {
        key: 'status',
        header: t('player.bookings.status'),
        render: (b) => (
          <Badge variant={bookingStatusBadgeVariant(b.status)}>{t(`player.bookingStatus.${b.status}`)}</Badge>
        ),
      },
    ],
    [t, locale, nf],
  );

  return (
    <Card padding="lg" className={styles.card} data-testid="player-bookings-card">
      <div className={styles.head}>
        <h2 className={styles.title}>{t('player.tabs.bookings')}</h2>
      </div>
      <DataTable<PlayerBooking>
        columns={columns}
        data={data ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(b) => b.id}
        emptyState={<EmptyState icon={<InboxIcon />} title={t('player.bookings.empty')} />}
      />
    </Card>
  );
}
