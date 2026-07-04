import { useMemo, type ReactNode } from 'react';
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
  ImageLightbox,
  CoverageMap,
  InboxIcon,
  PhoneIcon,
  DocumentIcon,
  CalendarIcon,
  toLocalPhone,
  type BadgeVariant,
  type CoverageCircle,
  type CoveragePin,
  type CoverageLegendItem,
} from '@ui';
import { useDisclosure, type Disclosure } from '@shared/hooks/useDisclosure';
import { statusToBadgeVariant } from '@shared/utils/status';
import {
  FACILITY_STATUSES,
  FACILITY_LEGEND_STATUSES,
  facilityStatusTone,
  type FacilityStatus,
} from '@features/facility-management/api';
import { useAdminQuery } from '../hooks/useAdminQuery';
import { useAdminRegions } from '../hooks/useAdminRegions';
import { useAdminFacilities } from '../hooks/useAdminFacilities';
import { AdminDetailActions } from '../components/AdminDetailActions';
import { AdminAttentionCard } from '../components/AdminAttentionCard';
import { AdminStatCards } from '../components/AdminStatCards';
import { AdminRegionsCard } from '../components/AdminRegionsCard';
import { AdminFacilitiesCard } from '../components/AdminFacilitiesCard';
import { AdminFormModal } from '../components/AdminFormModal';
import { AssignRegionsModal } from '../components/AssignRegionsModal';
import { ResetPasswordModal } from '../components/ResetPasswordModal';
import type { Admin, AdminScope } from '../api/admin.types';
import styles from './AdminDetailPage.module.css';

const NOT_FOUND_MESSAGE = 'Admin not found';

function scopeBadgeVariant(scope: AdminScope): BadgeVariant {
  return scope === 'general' ? 'info' : 'neutral';
}

/**
 * The admin detail page: an identity hero (photo lightbox, contact info, scope +
 * status), and — for a regional admin — KPI stats, a coverage map of all their
 * region circles, the regions they manage, and the facilities within them. Owns
 * the edit / assign-regions / reset-password / photo disclosures.
 */
export default function AdminDetailPage() {
  const { adminId } = useParams<{ adminId: string }>();
  const { t } = useTranslation();
  const { data: admin, isLoading, isError, error, refetch } = useAdminQuery(adminId);

  const editDisclosure = useDisclosure();
  const assignDisclosure = useDisclosure();
  const resetDisclosure = useDisclosure();

  const notFound =
    (isError && error instanceof Error && error.message === NOT_FOUND_MESSAGE) ||
    (!isLoading && !isError && !admin);

  return (
    <PageContainer>
      <PageHeader
        title={admin ? admin.name : t('admin.detail.title')}
        subtitle={t('admin.detail.subtitle')}
        showBack
        backLabel={t('common.back')}
        actions={
          admin ? (
            <AdminDetailActions
              admin={admin}
              onEdit={editDisclosure.open}
              onAssign={assignDisclosure.open}
              onResetPassword={resetDisclosure.open}
            />
          ) : undefined
        }
      />

      {isLoading ? (
        <div className={styles.center}>
          <Spinner size="lg" />
        </div>
      ) : notFound ? (
        <EmptyState icon={<InboxIcon />} title={t('admin.detail.notFound')} />
      ) : isError ? (
        <ErrorState
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void refetch()}
        />
      ) : admin ? (
        <AdminDetailContent
          admin={admin}
          editDisclosure={editDisclosure}
          assignDisclosure={assignDisclosure}
          resetDisclosure={resetDisclosure}
        />
      ) : null}
    </PageContainer>
  );
}

interface ContentProps {
  admin: Admin;
  editDisclosure: Disclosure;
  assignDisclosure: Disclosure;
  resetDisclosure: Disclosure;
}

function AdminDetailContent({ admin, editDisclosure, assignDisclosure, resetDisclosure }: ContentProps) {
  const { t, i18n } = useTranslation();
  const lightbox = useDisclosure();
  const isRegional = admin.scope === 'regional';

  const { data: regions, isLoading: regionsLoading } = useAdminRegions(admin);
  const regionList = useMemo(() => regions ?? [], [regions]);
  const { data: facilities, isLoading: facilitiesLoading } = useAdminFacilities(regionList);
  const facilityList = useMemo(() => facilities ?? [], [facilities]);

  const statusLabels = useMemo(
    () =>
      FACILITY_STATUSES.reduce(
        (acc, status) => {
          acc[status] = t(`status.${status}`);
          return acc;
        },
        {} as Record<FacilityStatus, string>,
      ),
    [t],
  );

  const circles = useMemo<CoverageCircle[]>(
    () =>
      regionList.map((region) => ({
        id: region.id,
        lat: region.centerLat,
        lng: region.centerLng,
        radiusKm: region.radiusKm,
      })),
    [regionList],
  );

  const pins = useMemo<CoveragePin[]>(
    () =>
      facilityList.map((facility) => ({
        id: facility.id,
        name: facility.name,
        lat: facility.lat,
        lng: facility.lng,
        tone: facilityStatusTone(facility.status),
        label: statusLabels[facility.status] ?? facility.status,
      })),
    [facilityList, statusLabels],
  );

  const legend = useMemo<CoverageLegendItem[]>(
    () =>
      FACILITY_LEGEND_STATUSES.map((status) => ({
        tone: facilityStatusTone(status),
        label: statusLabels[status] ?? status,
      })),
    [statusLabels],
  );

  const dateLocale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const createdLabel = admin.createdAt
    ? new Date(admin.createdAt).toLocaleDateString(dateLocale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : null;
  const phoneLabel = admin.phone ? `+963 ${toLocalPhone(admin.phone)}` : '—';

  return (
    <div className={styles.page}>
      <Card className={styles.hero} data-testid="admin-detail-hero">
        <div className={styles.identity}>
          <button
            type="button"
            className={styles.avatarButton}
            onClick={lightbox.open}
            aria-label={t('admin.detail.viewPhoto')}
            data-testid="admin-detail-avatar"
          >
            <Avatar src={admin.photoUrl} name={admin.name} size="xl" />
          </button>
          <div className={styles.identityText}>
            <p className={styles.name}>{admin.name}</p>
            <span className={styles.email} dir="ltr">
              {admin.email}
            </span>
            <div className={styles.badges}>
              <Badge variant={scopeBadgeVariant(admin.scope)}>{t(`admin.scope.${admin.scope}`)}</Badge>
              {admin.isDeleted ? (
                <Badge variant="danger">{t('admin.deletedTag')}</Badge>
              ) : (
                <Badge variant={statusToBadgeVariant(admin.status)}>{t(`status.${admin.status}`)}</Badge>
              )}
            </div>
          </div>
        </div>

        <div className={styles.rows}>
          <MetaItem icon={<PhoneIcon />} label={t('admin.form.phone')} value={phoneLabel} ltr />
          <MetaItem
            icon={<DocumentIcon />}
            label={t('admin.form.nationalId')}
            value={admin.nationalId || '—'}
            ltr
          />
          {createdLabel && (
            <MetaItem icon={<CalendarIcon />} label={t('admin.detail.createdAt')} value={createdLabel} />
          )}
        </div>
      </Card>

      <AdminAttentionCard admin={admin} onManage={assignDisclosure.open} />

      {isRegional ? (
        <>
          <AdminStatCards regionCount={regionList.length} facilities={facilityList} />

          <section className={styles.section} data-testid="admin-detail-map">
            <h2 className={styles.sectionTitle}>{t('admin.detail.sections.map')}</h2>
            <CoverageMap
              circles={circles}
              pins={pins}
              legend={legend}
              emptyLabel={t('admin.detail.map.empty')}
            />
          </section>

          <div className={styles.grid}>
            <AdminRegionsCard
              regions={regionList}
              isLoading={regionsLoading}
              onManage={assignDisclosure.open}
            />
            <AdminFacilitiesCard facilities={facilityList} isLoading={facilitiesLoading} />
          </div>
        </>
      ) : (
        <Card className={styles.scopeNote} data-testid="admin-detail-scope-note">
          <h2 className={styles.scopeNoteTitle}>{t('admin.detail.general.title')}</h2>
          <p className={styles.scopeNoteText}>{t('admin.detail.general.desc')}</p>
        </Card>
      )}

      <AdminFormModal isOpen={editDisclosure.isOpen} onClose={editDisclosure.close} admin={admin} />
      <AssignRegionsModal isOpen={assignDisclosure.isOpen} onClose={assignDisclosure.close} admin={admin} />
      <ResetPasswordModal isOpen={resetDisclosure.isOpen} onClose={resetDisclosure.close} admin={admin} />
      <ImageLightbox
        isOpen={lightbox.isOpen}
        onClose={lightbox.close}
        src={admin.photoUrl}
        alt={admin.name}
        title={admin.name}
        closeLabel={t('common.close')}
        zoomInLabel={t('common.zoomIn')}
        zoomOutLabel={t('common.zoomOut')}
        resetLabel={t('common.resetZoom')}
        fallback={<Avatar name={admin.name} size="xl" />}
      />
    </div>
  );
}

/** One contact meta item in the hero: an icon chip + stacked label / value. */
function MetaItem({
  icon,
  label,
  value,
  ltr,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  ltr?: boolean;
}) {
  return (
    <span className={styles.row}>
      <span className={styles.rowIcon} aria-hidden>
        {icon}
      </span>
      <span className={styles.rowText}>
        <span className={styles.label}>{label}</span>
        <span className={styles.value} dir={ltr ? 'ltr' : undefined}>
          {value}
        </span>
      </span>
    </span>
  );
}
