import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, Badge } from '@ui';
import { ownerTrustTier, OWNER_TRUST_VARIANT, type Owner } from '../api/owner.types';
import styles from './OwnerAboutCard.module.css';

interface Props {
  owner: Owner;
}

/** The owner's KYC / profile details: legal identity, trust score, revenue, bio. */
export function OwnerAboutCard({ owner }: Props) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';

  const dob = owner.dateOfBirth
    ? new Date(owner.dateOfBirth).toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const revenue =
    typeof owner.monthlyRevenueSyp === 'number'
      ? new Intl.NumberFormat(locale).format(owner.monthlyRevenueSyp)
      : null;
  const tier = ownerTrustTier(owner.trustScore);

  const rows: Array<{ key: string; label: string; value: ReactNode }> = [];
  if (owner.legalName) rows.push({ key: 'legal', label: t('owner.about.legalName'), value: owner.legalName });
  if (dob) rows.push({ key: 'dob', label: t('owner.about.dob'), value: dob });
  if (owner.city) rows.push({ key: 'city', label: t('owner.about.city'), value: owner.city });
  if (owner.address) rows.push({ key: 'address', label: t('owner.about.address'), value: owner.address });
  if (owner.intendedFacilityType) {
    rows.push({
      key: 'intent',
      label: t('owner.about.intent'),
      value: t(`owner.intent.${owner.intendedFacilityType}`),
    });
  }
  rows.push({
    key: 'trust',
    label: t('owner.about.trust'),
    value: (
      <span className={styles.trust}>
        <span className={styles.trustScore}>{owner.trustScore} / 100</span>
        <Badge variant={OWNER_TRUST_VARIANT[tier]} size="sm">
          {t(`owner.trust.${tier}`)}
        </Badge>
      </span>
    ),
  });
  if (revenue) {
    rows.push({
      key: 'revenue',
      label: t('owner.about.revenue'),
      value: `${revenue} ${t('owner.about.currency')}`,
    });
  }

  return (
    <Card className={styles.card} data-testid="owner-detail-about">
      <h2 className={styles.title}>{t('owner.about.title')}</h2>
      <dl className={styles.rows}>
        {rows.map((row) => (
          <div key={row.key} className={styles.row}>
            <dt className={styles.label}>{row.label}</dt>
            <dd className={styles.value}>{row.value}</dd>
          </div>
        ))}
      </dl>
      {owner.bio && <p className={styles.bio}>{owner.bio}</p>}
    </Card>
  );
}
