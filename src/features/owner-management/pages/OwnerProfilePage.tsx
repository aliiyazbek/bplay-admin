import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  PageHeader,
  Card,
  Badge,
  Avatar,
  Spinner,
  ErrorState,
  EmptyState,
  InboxIcon,
} from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';
import { useOwnerQuery } from '../hooks/useOwnerQuery';
import { OwnerStatusActions } from '../components/OwnerStatusActions';
import type { Owner } from '../api/owner.types';
import styles from './OwnerProfilePage.module.css';

export default function OwnerProfilePage() {
  const { ownerId } = useParams<{ ownerId: string }>();
  const { t } = useTranslation();
  const { data: owner, isLoading, isError, refetch } = useOwnerQuery(ownerId);

  return (
    <PageContainer>
      <PageHeader
        title={t('owner.profile.title')}
        subtitle={t('owner.profile.subtitle')}
        showBack
        backLabel={t('common.back')}
        actions={owner ? <OwnerStatusActions owner={owner} /> : undefined}
      />

      {isLoading ? (
        <Spinner />
      ) : isError ? (
        <ErrorState message={t('common.loadError')} retryLabel={t('common.retry')} onRetry={() => void refetch()} />
      ) : !owner ? (
        <EmptyState icon={<InboxIcon />} title={t('owner.profile.notFound')} />
      ) : (
        <OwnerProfile owner={owner} />
      )}
    </PageContainer>
  );
}

function OwnerProfile({ owner }: { owner: Owner }) {
  const { t } = useTranslation();

  return (
    <div className={styles.grid}>
      <Card className={styles.card}>
        <div className={styles.identity}>
          <Avatar name={owner.name} size="lg" />
          <div className={styles.identityText}>
            <p className={styles.name}>{owner.name}</p>
            <p className={styles.email}>{owner.email}</p>
          </div>
        </div>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.phone')}</span>
            <span className={styles.value}>{owner.phone || '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.region')}</span>
            <span className={styles.value}>{owner.region || '—'}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.trustTier')}</span>
            <span className={styles.value}>{t(`owner.tier.${owner.trustTier}`)}</span>
          </div>
          {owner.createdAt && (
            <div className={styles.row}>
              <span className={styles.label}>{t('owner.col.created')}</span>
              <span className={styles.value}>
                {new Date(owner.createdAt).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.sectionTitle}>{t('owner.profile.statusSection')}</h2>
        <div className={styles.badges}>
          <Badge variant={statusToBadgeVariant(owner.status)}>{t(`status.${owner.status}`)}</Badge>
          <Badge variant={statusToBadgeVariant(owner.verificationStatus)}>
            {t(`status.${owner.verificationStatus}`)}
          </Badge>
        </div>
        <div className={styles.rows}>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.status')}</span>
            <span className={styles.value}>{t(`status.${owner.status}`)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.verification')}</span>
            <span className={styles.value}>{t(`status.${owner.verificationStatus}`)}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>{t('owner.col.active')}</span>
            <span className={styles.value}>
              {owner.isActive ? t('owner.value.yes') : t('owner.value.no')}
            </span>
          </div>
        </div>
      </Card>

      <Card className={styles.card}>
        <h2 className={styles.sectionTitle}>{t('owner.profile.documents')}</h2>
        {owner.documents.length === 0 ? (
          <p className={styles.muted}>{t('owner.profile.noDocuments')}</p>
        ) : (
          <div className={styles.docs}>
            {owner.documents.map((document) => (
              <div className={styles.doc} key={document.id}>
                <div className={styles.docMeta}>
                  <span className={styles.docName}>{document.name}</span>
                  <Badge variant={statusToBadgeVariant(document.status)}>
                    {t(`status.${document.status}`, { defaultValue: document.status })}
                  </Badge>
                </div>
                {document.url && (
                  <div className={styles.docActions}>
                    <a className={styles.link} href={document.url} target="_blank" rel="noreferrer">
                      {t('owner.profile.preview')}
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
