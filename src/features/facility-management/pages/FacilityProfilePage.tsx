import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import {
  PageContainer,
  PageHeader,
  Card,
  Button,
  Avatar,
  Alert,
  Tabs,
  StatCard,
  RatingStars,
  Skeleton,
  SkeletonText,
  ErrorState,
  EmptyState,
  ImageLightbox,
  MapView,
  MapPinIcon,
  PhoneIcon,
  StadiumIcon,
  EditIcon,
  ChevronEndIcon,
} from '@ui';
import { PATHS } from '@app/router/paths';
import { useAuthRole } from '@shared/stores/authStore';
import { useFacilityQuery } from '../hooks/useFacilityQuery';
import { FacilityStatusActions } from '../components/FacilityStatusActions';
import { FacilityStatusBadge } from '../components/FacilityStatusBadge';
import { WorkingHoursView } from '../components/WorkingHoursView';
import { PitchSpecsGrid } from '../components/PitchSpecsGrid';
import { CourtCard } from '../components/CourtCard';
import { FacilityDocumentsCard } from '../components/FacilityDocumentsCard';
import { FacilitySourceBadge } from '../components/FacilitySourceBadge';
import { canEditFacility, type Facility } from '../api/facility.types';
import styles from './FacilityProfilePage.module.css';

type ProfileTab = 'overview' | 'courts' | 'media';

export default function FacilityProfilePage() {
  const { facilityId } = useParams<{ facilityId: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: facility, isLoading, isError, error, refetch } = useFacilityQuery(facilityId);

  const notFound = isError && error instanceof Error && error.message === 'Facility not found';

  return (
    <PageContainer>
      <PageHeader
        title={t('facility.profile.title')}
        subtitle={t('facility.profile.subtitle')}
        showBack
        backLabel={t('common.back')}
        actions={
          facility ? (
            <>
              {canEditFacility(facility.source) && (
                <Button
                  variant="secondary"
                  leftIcon={<EditIcon />}
                  onClick={() => navigate(`${PATHS.facilityManagement}/${facility.id}/edit`)}
                  data-testid="facility-edit"
                >
                  {t('facility.profile.edit')}
                </Button>
              )}
              <FacilityStatusActions facility={facility} />
            </>
          ) : undefined
        }
      />

      {isLoading ? (
        <FacilityProfileSkeleton />
      ) : notFound ? (
        <EmptyState icon={<StadiumIcon />} title={t('facility.profile.notFound')} />
      ) : isError ? (
        <ErrorState
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void refetch()}
        />
      ) : !facility ? (
        <EmptyState icon={<StadiumIcon />} title={t('facility.profile.notFound')} />
      ) : (
        <FacilityProfile facility={facility} />
      )}
    </PageContainer>
  );
}

/** Hero-shaped loading placeholder: cover block, stat tiles, two content cards. */
function FacilityProfileSkeleton() {
  return (
    <div className={styles.profile} aria-busy="true">
      <Skeleton height="240px" radius="var(--radius-2xl)" />
      <div className={styles.stats}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height="88px" radius="var(--radius-xl)" />
        ))}
      </div>
      <div className={styles.overviewGrid}>
        <Card className={styles.card}>
          <SkeletonText lines={4} />
        </Card>
        <Card className={styles.card}>
          <SkeletonText lines={4} />
        </Card>
      </div>
    </div>
  );
}

function FacilityProfile({ facility }: { facility: Facility }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [tab, setTab] = useState<ProfileTab>('overview');
  const [lightbox, setLightbox] = useState<string | null>(null);
  // Owner profiles live on a super_admin-only route — only super_admins can open them.
  const canViewOwner = useAuthRole() === 'super_admin';
  const editPath = `${PATHS.facilityManagement}/${facility.id}/edit`;

  const numberLocale = i18n.language.startsWith('ar') ? 'ar-SY' : 'en-US';
  const cover = facility.images[0];
  const locationLine =
    [
      facility.location.governorate
        ? t(`facility.governorate.${facility.location.governorate}`)
        : undefined,
      facility.location.city,
      facility.location.district,
    ]
      .filter(Boolean)
      .join(' · ') || facility.location.address;

  return (
    <div className={styles.profile}>
      <motion.section
        className={styles.hero}
        initial={reduceMotion ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        data-testid="facility-profile-hero"
      >
        {cover ? (
          <img className={styles.heroImage} src={cover} alt={facility.name} />
        ) : (
          <div className={styles.heroFallback} aria-hidden>
            <StadiumIcon />
          </div>
        )}
        <div className={styles.scrim} aria-hidden />

        <motion.div
          className={styles.plate}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut', delay: 0.1 }}
        >
          {facility.kind === 'club' ? (
            <Avatar src={facility.logoUrl} name={facility.name} size="lg" />
          ) : (
            <span className={styles.kindIcon} aria-hidden>
              <StadiumIcon />
            </span>
          )}
          <div className={styles.plateInfo}>
            <h2 className={styles.plateName}>{facility.name}</h2>
            <p className={styles.plateLocation}>
              <MapPinIcon className={styles.plateLocationIcon} />
              <span className={styles.plateLocationText}>{locationLine}</span>
            </p>
          </div>
          <div className={styles.plateMeta}>
            <FacilityStatusBadge status={facility.status} size="md" />
            <FacilitySourceBadge source={facility.source} size="md" />
            <span className={styles.plateRating}>
              <RatingStars value={facility.rating ?? null} size="md" />
            </span>
          </div>
        </motion.div>
      </motion.section>

      <div className={styles.stats}>
        <StatCard
          label={t('facility.profile.stats.occupancy')}
          value={facility.statistics.occupancyPercent}
          accent="primary"
          countUp
        />
        <StatCard
          label={t('facility.profile.stats.revenue')}
          value={`${facility.statistics.revenueSyp.toLocaleString(numberLocale)} ${t('facility.profile.stats.currency')}`}
          accent="secondary"
        />
        <StatCard
          label={t('facility.profile.stats.bookings')}
          value={facility.statistics.todayBookings}
          accent="info"
          countUp
        />
        <StatCard
          label={t('facility.profile.stats.rating')}
          value={typeof facility.rating === 'number' ? facility.rating.toFixed(1) : '—'}
          accent="warning"
        />
      </div>

      <Tabs
        items={[
          { key: 'overview', label: t('facility.profile.tabs.overview') },
          { key: 'courts', label: t('facility.profile.tabs.courts') },
          { key: 'media', label: t('facility.profile.tabs.media') },
        ]}
        value={tab}
        onChange={(key) => setTab(key as ProfileTab)}
        aria-label={t('facility.profile.title')}
      />

      {tab === 'overview' && (
        <div className={styles.tabPanel} role="tabpanel" aria-label={t('facility.profile.tabs.overview')}>
          {facility.status === 'rejected' && (
            <Alert variant="error" title={t('facility.profile.rejectionReason')}>
              {facility.adminNotes}
            </Alert>
          )}
          {facility.status === 'suspended' && (
            <Alert variant="error" title={t('facility.profile.suspensionReason')}>
              {facility.suspensionReason}
            </Alert>
          )}
          {facility.status === 'owner_suspended' && (
            <Alert variant="info">{t('facility.profile.ownerPausedNote')}</Alert>
          )}

          <div className={styles.overviewGrid}>
            <Card className={styles.card}>
              <h2 className={styles.sectionTitle}>{t('facility.profile.description')}</h2>
              {facility.kind === 'club' && facility.description ? (
                <p className={styles.description}>{facility.description}</p>
              ) : (
                <p className={styles.muted}>{t('facility.profile.noDescription')}</p>
              )}
              {facility.kind === 'club' && facility.contactPhone && (
                <div className={styles.contact}>
                  <PhoneIcon className={styles.contactIcon} />
                  <span className={styles.contactLabel}>{t('facility.profile.contact')}</span>
                  <span className={styles.contactValue}>{facility.contactPhone}</span>
                </div>
              )}
            </Card>

            {facility.kind === 'club' ? (
              <Card className={styles.card}>
                <h2 className={styles.sectionTitle}>{t('facility.profile.workingHours')}</h2>
                <WorkingHoursView workingHours={facility.workingHours} />
              </Card>
            ) : (
              <Card className={styles.card}>
                <h2 className={styles.sectionTitle}>{t('facility.profile.specs')}</h2>
                <PitchSpecsGrid
                  specs={facility.specs}
                  pricePerHour={facility.pricePerHour}
                  capacity={facility.capacity}
                  cancelPolicy={facility.cancelPolicy}
                />
              </Card>
            )}

            <Card className={styles.card}>
              <h2 className={styles.sectionTitle}>{t('facility.profile.location')}</h2>
              <div className={styles.rows}>
                <div className={styles.row}>
                  <span className={styles.label}>{t('facility.profile.address')}</span>
                  <span className={styles.value}>{facility.location.address || '—'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>{t('facility.wizard.location.city')}</span>
                  <span className={styles.value}>{facility.location.city || '—'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>{t('facility.wizard.location.district')}</span>
                  <span className={styles.value}>{facility.location.district || '—'}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.label}>{t('facility.wizard.location.governorate')}</span>
                  <span className={styles.value}>
                    {facility.location.governorate
                      ? t(`facility.governorate.${facility.location.governorate}`)
                      : '—'}
                  </span>
                </div>
              </div>
              <div className={styles.mapView}>
                <MapView lat={facility.location.lat} lng={facility.location.lng} />
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === 'courts' && (
        <div className={styles.tabPanel} role="tabpanel" aria-label={t('facility.profile.tabs.courts')}>
          {facility.kind === 'club' ? (
            <>
              <div className={styles.courtsHead}>
                <p className={styles.courtsCount}>
                  {facility.courts.length === 0
                    ? t('facility.profile.courtsEmpty')
                    : t('facility.profile.courtsCount', { count: facility.courts.length })}
                </p>
                {canEditFacility(facility.source) && (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={() => navigate(editPath)}
                    data-testid="facility-manage-courts"
                  >
                    {t('facility.profile.manageCourts')}
                  </Button>
                )}
              </div>
              {facility.courts.length > 0 && (
                <div className={styles.courtsGrid}>
                  {facility.courts.map((court) => (
                    <CourtCard key={court.id} court={court} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card className={styles.card}>
              <p className={styles.muted}>{t('facility.profile.pitchSelf')}</p>
              <PitchSpecsGrid
                specs={facility.specs}
                pricePerHour={facility.pricePerHour}
                capacity={facility.capacity}
                cancelPolicy={facility.cancelPolicy}
              />
            </Card>
          )}
        </div>
      )}

      {tab === 'media' && (
        <div className={styles.tabPanel} role="tabpanel" aria-label={t('facility.profile.tabs.media')}>
          <Card className={styles.card}>
            <h2 className={styles.sectionTitle}>{t('facility.profile.photos')}</h2>
            {facility.images.length === 0 ? (
              <p className={styles.muted}>{t('facility.profile.noPhotos')}</p>
            ) : (
              <div className={styles.photoGrid}>
                {facility.images.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    className={styles.photoLink}
                    onClick={() => setLightbox(image)}
                    aria-label={`${facility.name} — ${t('facility.profile.photos')} ${index + 1}`}
                    data-testid={`facility-photo-${index}`}
                  >
                    <img className={styles.photo} src={image} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </Card>

          <FacilityDocumentsCard facilityId={facility.id} documents={facility.documents} />
        </div>
      )}

      <section className={styles.ownerCard} data-testid="facility-owner-card">
        {canViewOwner ? (
          <button
            type="button"
            className={styles.ownerLink}
            onClick={() => navigate(`${PATHS.ownerManagement}/${facility.ownerId}`)}
            data-testid="facility-view-owner"
            title={t('facility.profile.viewOwner')}
          >
            <Avatar src={facility.ownerPhotoUrl} name={facility.ownerName} size="md" />
            <span className={styles.ownerInfo}>
              <span className={styles.ownerLabel}>{t('facility.profile.owner')}</span>
              <span className={styles.ownerName}>{facility.ownerName}</span>
            </span>
            <ChevronEndIcon className={styles.ownerChevron} aria-hidden />
          </button>
        ) : (
          <>
            <Avatar src={facility.ownerPhotoUrl} name={facility.ownerName} size="md" />
            <div className={styles.ownerInfo}>
              <span className={styles.ownerLabel}>{t('facility.profile.owner')}</span>
              <span className={styles.ownerName}>{facility.ownerName}</span>
            </div>
          </>
        )}
      </section>

      <ImageLightbox
        isOpen={lightbox !== null}
        onClose={() => setLightbox(null)}
        src={lightbox ?? undefined}
        alt={facility.name}
        title={facility.name}
        closeLabel={t('common.close')}
        zoomInLabel={t('common.zoomIn')}
        zoomOutLabel={t('common.zoomOut')}
        resetLabel={t('common.resetZoom')}
      />
    </div>
  );
}
