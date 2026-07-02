import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Button,
  CheckIcon,
  DataTable,
  EmptyState,
  ErrorState,
  InboxIcon,
  PageContainer,
  PageHeader,
  Pagination,
  PlusIcon,
  SearchInput,
  Skeleton,
  Tabs,
} from '@ui';
import { PATHS } from '@app/router/paths';
import { useAdminScope } from '../hooks/useAdminScope';
import { useFacilitiesQuery } from '../hooks/useFacilitiesQuery';
import { usePendingQueueQuery } from '../hooks/usePendingQueueQuery';
import { usePendingCountQuery } from '../hooks/usePendingCountQuery';
import { useAgedCountQuery } from '../hooks/useAgedCountQuery';
import { ScopeBanner } from '../components/ScopeBanner';
import { FacilityReviewCard, queueGridVariants } from '../components/FacilityReviewCard';
import { FacilityActionDialogs } from '../components/FacilityStatusActions';
import { FacilityFiltersBar } from '../components/FacilityFiltersBar';
import { FacilityRowActions } from '../components/FacilityRowActions';
import { useFacilityColumns } from '../components/useFacilityColumns';
import type { FacilityAction, FacilityListItem, FacilityListParams } from '../api/facility.types';
import styles from './FacilityManagementPage.module.css';

type FacilityTab = 'queue' | 'directory';

/**
 * The page-level dialog target — the queue cards are purely presentational.
 * The item survives `action: null` so the dialog's exit animation still runs.
 */
interface QueueDialog {
  item: FacilityListItem;
  action: FacilityAction | null;
}

const QUEUE_PAGE_SIZE = 12;
const SKELETON_CARDS = 6;

/** Stable params for the banner's orphan total (super_admin only reads it). */
const ORPHAN_COUNT_PARAMS: FacilityListParams = { regionId: 'orphans', page: 1, pageSize: 1 };

/**
 * The Review Desk: a pending-submissions queue of FacilityReviewCards plus the
 * full facility directory, as two URL-addressable tabs (?tab=queue|directory).
 * Each tab keeps its own params state so switching never clobbers filters; the
 * page owns the queue's approve/reject dialogs since the cards are presentational.
 */
export default function FacilityManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [searchParams, setSearchParams] = useSearchParams();
  const tab: FacilityTab = searchParams.get('tab') === 'directory' ? 'directory' : 'queue';

  const [queueParams, setQueueParams] = useState<FacilityListParams>({
    q: '',
    page: 1,
    pageSize: QUEUE_PAGE_SIZE,
  });
  const [directoryParams, setDirectoryParams] = useState<FacilityListParams>({
    q: '',
    status: 'all',
    kind: 'all',
    sport: 'all',
    regionId: 'all',
    ownerId: 'all',
    page: 1,
  });
  const [queueDialog, setQueueDialog] = useState<QueueDialog | null>(null);

  const { isSuperAdmin } = useAdminScope();
  const queueQuery = usePendingQueueQuery(queueParams);
  const directoryQuery = useFacilitiesQuery(directoryParams);
  const pendingCountQuery = usePendingCountQuery();
  const agedCountQuery = useAgedCountQuery();
  const orphanQuery = useFacilitiesQuery(ORPHAN_COUNT_PARAMS);

  const queueItems = queueQuery.data?.items ?? [];

  const openProfile = useCallback(
    (item: FacilityListItem) => navigate(`${PATHS.facilityManagement}/${item.id}`),
    [navigate],
  );
  const openOwner = useCallback(
    (ownerId: string) => navigate(`${PATHS.ownerManagement}/${ownerId}`),
    [navigate],
  );
  const columns = useFacilityColumns({ onOwnerClick: openOwner });

  const onTabChange = (key: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set('tab', key);
        return next;
      },
      { replace: true },
    );
  };

  const closeQueueDialog = () =>
    setQueueDialog((prev) => (prev ? { ...prev, action: null } : prev));

  const renderQueue = () => {
    if (queueQuery.isLoading) {
      return (
        <div className={styles.grid} aria-hidden data-testid="facility-queue-loading">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <div key={index} className={styles.skeletonCard}>
              <Skeleton height="150px" radius="0" />
              <div className={styles.skeletonBody}>
                <Skeleton width="70%" height="var(--space-5)" />
                <Skeleton width="45%" />
                <Skeleton width="60%" />
              </div>
            </div>
          ))}
        </div>
      );
    }
    if (queueQuery.isError) {
      return (
        <ErrorState
          message={t('common.loadError')}
          retryLabel={t('common.retry')}
          onRetry={() => void queueQuery.refetch()}
        />
      );
    }
    if (queueItems.length === 0) {
      return (
        <div className={styles.emptyCard}>
          <EmptyState
            icon={<CheckIcon />}
            title={t('facility.queue.empty.title')}
            description={t('facility.queue.empty.desc')}
          />
        </div>
      );
    }
    return (
      <>
        <motion.div
          className={styles.grid}
          variants={reduceMotion ? undefined : queueGridVariants}
          initial={reduceMotion ? false : 'hidden'}
          animate="visible"
        >
          {queueItems.map((item) => (
            <FacilityReviewCard
              key={item.id}
              item={item}
              onView={openProfile}
              onApprove={(target) => setQueueDialog({ item: target, action: 'approve' })}
              onReject={(target) => setQueueDialog({ item: target, action: 'reject' })}
            />
          ))}
        </motion.div>
        <Pagination
          page={queueQuery.data?.page ?? 1}
          pageCount={queueQuery.data?.pageCount ?? 1}
          onPageChange={(page) => setQueueParams((prev) => ({ ...prev, page }))}
        />
      </>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        title={t('facility.title')}
        subtitle={t('facility.subtitle')}
        actions={
          <Button
            leftIcon={<PlusIcon />}
            onClick={() => navigate(PATHS.facilityManagementNew)}
            data-testid="facility-add"
          >
            {t('facility.actions.add')}
          </Button>
        }
      />

      <ScopeBanner
        agedCount={agedCountQuery.data}
        orphanCount={isSuperAdmin ? orphanQuery.data?.total : undefined}
      />

      <Tabs
        items={[
          { key: 'queue', label: t('facility.tabs.queue'), badge: pendingCountQuery.data },
          { key: 'directory', label: t('facility.tabs.directory') },
        ]}
        value={tab}
        onChange={onTabChange}
        aria-label={t('facility.title')}
      />

      {tab === 'queue' ? (
        <section
          className={styles.panel}
          role="tabpanel"
          aria-label={t('facility.tabs.queue')}
          data-testid="facility-queue-grid"
        >
          <div className={styles.queueSearch}>
            <SearchInput
              value={queueParams.q ?? ''}
              onChange={(q) => setQueueParams((prev) => ({ ...prev, q, page: 1 }))}
              placeholder={t('facility.search')}
            />
          </div>
          {renderQueue()}
        </section>
      ) : (
        <section
          className={styles.panel}
          role="tabpanel"
          aria-label={t('facility.tabs.directory')}
          data-testid="facility-directory-table"
        >
          <FacilityFiltersBar
            params={directoryParams}
            onChange={(patch) =>
              setDirectoryParams((prev) => ({ ...prev, ...patch, page: 1 }))
            }
          />
          <DataTable<FacilityListItem>
            columns={columns}
            data={directoryQuery.data?.items ?? []}
            isLoading={directoryQuery.isLoading}
            error={directoryQuery.isError ? t('common.loadError') : undefined}
            onRetry={() => void directoryQuery.refetch()}
            getRowId={(item) => item.id}
            emptyState={
              <EmptyState
                icon={<InboxIcon />}
                title={t('facility.empty.title')}
                description={t('facility.empty.desc')}
              />
            }
            rowActions={(item) => <FacilityRowActions item={item} onView={openProfile} />}
          />
          <Pagination
            page={directoryQuery.data?.page ?? 1}
            pageCount={directoryQuery.data?.pageCount ?? 1}
            onPageChange={(page) => setDirectoryParams((prev) => ({ ...prev, page }))}
          />
        </section>
      )}

      {queueDialog && (
        <FacilityActionDialogs
          facility={queueDialog.item}
          action={queueDialog.action}
          onClose={closeQueueDialog}
        />
      )}
    </PageContainer>
  );
}
