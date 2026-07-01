import { useTranslation } from 'react-i18next';
import { PageContainer, PageHeader, Card, Avatar, Badge } from '@ui';
import { useAuthUser, useAuthRole } from '@shared/stores/authStore';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { t } = useTranslation();
  const user = useAuthUser();
  const role = useAuthRole();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Admin';

  return (
    <PageContainer>
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />
      <Card padding="lg">
        <div className={styles.head}>
          <Avatar name={displayName} size="lg" />
          <div>
            <h2 className={styles.name}>{displayName}</h2>
            <p className={styles.email}>{user?.email}</p>
          </div>
        </div>
        <dl className={styles.grid}>
          <div className={styles.row}>
            <dt>{t('profile.role')}</dt>
            <dd>
              <Badge variant="info">{t(`status.${role ?? 'admin'}`, role ?? 'admin')}</Badge>
            </dd>
          </div>
          <div className={styles.row}>
            <dt>{t('profile.email')}</dt>
            <dd>{user?.email}</dd>
          </div>
        </dl>
      </Card>
    </PageContainer>
  );
}
