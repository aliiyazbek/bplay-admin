import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  PageContainer,
  PageHeader,
  Toolbar,
  SearchInput,
  Select,
  DataTable,
  Pagination,
  Badge,
  Button,
  ClearFiltersBar,
  Avatar,
  EmptyState,
  PlusIcon,
  InboxIcon,
  type Column,
  type BadgeVariant,
} from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { statusToBadgeVariant } from '@shared/utils/status';
import { PATHS } from '@app/router/paths';
import { useAdminsQuery } from '../hooks/useAdminsQuery';
import { AdminFormModal } from '../components/AdminFormModal';
import { AssignRegionsModal } from '../components/AssignRegionsModal';
import { AdminRowActions } from '../components/AdminRowActions';
import type { Admin, AdminListParams, AdminScope } from '../api/admin.types';
import styles from './AdminManagementPage.module.css';

const MAX_REGION_NAMES = 2;

function scopeBadgeVariant(scope: AdminScope): BadgeVariant {
  return scope === 'general' ? 'info' : 'neutral';
}

export default function AdminManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const create = useDisclosure();
  const [editing, setEditing] = useState<Admin | null>(null);
  const [assigning, setAssigning] = useState<Admin | null>(null);
  const [params, setParams] = useState<AdminListParams>({
    q: '',
    status: 'all',
    scope: 'all',
    assignment: 'all',
    page: 1,
  });
  const { data, isLoading, isError, refetch } = useAdminsQuery(params);

  const hasActiveFilters =
    (params.q ?? '') !== '' ||
    (params.status ?? 'all') !== 'all' ||
    (params.scope ?? 'all') !== 'all' ||
    (params.assignment ?? 'all') !== 'all' ||
    (params.showDeleted ?? false);

  const clearFilters = () =>
    setParams((prev) => ({
      ...prev,
      q: '',
      status: 'all',
      scope: 'all',
      assignment: 'all',
      showDeleted: false,
      page: 1,
    }));

  const openDetail = (admin: Admin) => navigate(`${PATHS.adminManagement}/${admin.id}`);

  const renderRegions = (admin: Admin) => {
    if (admin.scope === 'general') return <span className={styles.muted}>{t('admin.scope.generalTag')}</span>;
    const names = admin.assignedRegionNames;
    if (names.length === 0) return <span className={styles.muted}>—</span>;
    const shown = names.slice(0, MAX_REGION_NAMES).join(', ');
    const extra = names.length - MAX_REGION_NAMES;
    return <span className={styles.regions}>{extra > 0 ? `${shown} +${extra}` : shown}</span>;
  };

  const columns: Column<Admin>[] = [
    {
      key: 'name',
      header: t('admin.col.name'),
      render: (admin) => (
        <button
          type="button"
          className={styles.userLink}
          onClick={() => openDetail(admin)}
          data-testid={`admin-name-${admin.id}`}
        >
          <Avatar src={admin.photoUrl} name={admin.name} size="sm" />
          <span className={styles.userText}>
            <span className={styles.userName}>{admin.name}</span>
            <span className={styles.userEmail}>{admin.email}</span>
          </span>
        </button>
      ),
    },
    {
      key: 'scope',
      header: t('admin.col.scope'),
      render: (admin) => (
        <Badge variant={scopeBadgeVariant(admin.scope)}>{t(`admin.scope.${admin.scope}`)}</Badge>
      ),
    },
    {
      key: 'regions',
      header: t('admin.col.regions'),
      render: renderRegions,
    },
    {
      key: 'status',
      header: t('admin.col.status'),
      render: (admin) =>
        admin.isDeleted ? (
          <Badge variant="danger">{t('admin.deletedTag')}</Badge>
        ) : (
          <Badge variant={statusToBadgeVariant(admin.status)}>{t(`status.${admin.status}`)}</Badge>
        ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('admin.title')}
        subtitle={t('admin.subtitle')}
        actions={
          <Button leftIcon={<PlusIcon />} onClick={create.open} data-testid="admin-create">
            {t('admin.invite')}
          </Button>
        }
      />

      <Toolbar
        end={
          hasActiveFilters ? (
            <ClearFiltersBar
              count={data?.total ?? 0}
              onClear={clearFilters}
              testId="admin-clear-filters"
            />
          ) : null
        }
      >
        <SearchInput
          value={params.q ?? ''}
          onChange={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
          placeholder={t('admin.search')}
        />
        <Select
          aria-label={t('admin.col.status')}
          value={params.status ?? 'all'}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, status: value as AdminListParams['status'], page: 1 }))
          }
          options={[
            { value: 'all', label: t('status.all') },
            { value: 'active', label: t('status.active') },
            { value: 'suspended', label: t('status.suspended') },
          ]}
        />
        <Select
          aria-label={t('admin.col.scope')}
          value={params.scope ?? 'all'}
          onChange={(value) =>
            setParams((prev) => ({ ...prev, scope: value as AdminListParams['scope'], page: 1 }))
          }
          options={[
            { value: 'all', label: t('admin.filter.allScope') },
            { value: 'general', label: t('admin.scope.general') },
            { value: 'regional', label: t('admin.scope.regional') },
          ]}
        />
        <Select
          aria-label={t('admin.filter.assignment')}
          value={params.assignment ?? 'all'}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              assignment: value as AdminListParams['assignment'],
              page: 1,
            }))
          }
          options={[
            { value: 'all', label: t('admin.filter.allAssignment') },
            { value: 'assigned', label: t('admin.filter.withRegion') },
            { value: 'unassigned', label: t('admin.filter.noRegion') },
          ]}
        />
        <label className={styles.deletedToggle}>
          <input
            type="checkbox"
            className={styles.deletedCheckbox}
            checked={params.showDeleted ?? false}
            onChange={(event) =>
              setParams((prev) => ({ ...prev, showDeleted: event.target.checked, page: 1 }))
            }
            data-testid="admin-show-deleted"
          />
          <span>{t('admin.filter.showDeleted')}</span>
        </label>
      </Toolbar>

      <DataTable<Admin>
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(admin) => admin.id}
        emptyState={
          <EmptyState
            icon={<InboxIcon />}
            title={t(params.showDeleted ? 'admin.emptyDeleted.title' : 'admin.empty.title')}
            description={t(params.showDeleted ? 'admin.emptyDeleted.desc' : 'admin.empty.desc')}
          />
        }
        rowActions={(admin) => (
          <AdminRowActions
            admin={admin}
            onView={openDetail}
            onEdit={setEditing}
            onAssign={setAssigning}
          />
        )}
      />

      <Pagination
        page={data?.page ?? 1}
        pageCount={data?.pageCount ?? 1}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <AdminFormModal isOpen={create.isOpen} onClose={create.close} admin={null} />
      <AdminFormModal isOpen={editing !== null} onClose={() => setEditing(null)} admin={editing} />
      <AssignRegionsModal
        isOpen={assigning !== null}
        onClose={() => setAssigning(null)}
        admin={assigning}
      />
    </PageContainer>
  );
}
