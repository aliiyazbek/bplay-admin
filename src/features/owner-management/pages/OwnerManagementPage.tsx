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
  EmptyState,
  UserCell,
  InboxIcon,
  type Column,
} from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';
import { PATHS } from '@app/router/paths';
import { useOwnersQuery } from '../hooks/useOwnersQuery';
import { OwnerRowActions } from '../components/OwnerRowActions';
import type { Owner, OwnerListParams } from '../api/owner.types';

export default function OwnerManagementPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [params, setParams] = useState<OwnerListParams>({ q: '', status: 'all', page: 1 });
  const { data, isLoading, isError, refetch } = useOwnersQuery(params);

  const openProfile = (owner: Owner) => navigate(`${PATHS.ownerManagement}/${owner.id}`);

  const columns: Column<Owner>[] = [
    {
      key: 'name',
      header: t('owner.col.name'),
      render: (owner) => <UserCell name={owner.name} email={owner.email} />,
    },
    { key: 'phone', header: t('owner.col.phone') },
    { key: 'region', header: t('owner.col.region'), render: (owner) => owner.region || '—' },
    {
      key: 'verificationStatus',
      header: t('owner.col.verification'),
      render: (owner) => (
        <Badge variant={statusToBadgeVariant(owner.verificationStatus)}>
          {t(`status.${owner.verificationStatus}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: t('owner.col.status'),
      render: (owner) => (
        <Badge variant={statusToBadgeVariant(owner.status)}>{t(`status.${owner.status}`)}</Badge>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader title={t('owner.title')} subtitle={t('owner.subtitle')} />

      <Toolbar>
        <SearchInput
          value={params.q ?? ''}
          onChange={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
          placeholder={t('owner.search')}
        />
        <Select
          aria-label={t('owner.col.status')}
          value={params.status}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value as OwnerListParams['status'],
              page: 1,
            }))
          }
          options={[
            { value: 'all', label: t('status.all') },
            { value: 'pending', label: t('status.pending') },
            { value: 'approved', label: t('status.approved') },
            { value: 'active', label: t('status.active') },
            { value: 'inactive', label: t('status.inactive') },
            { value: 'rejected', label: t('status.rejected') },
            { value: 'blocked', label: t('status.blocked') },
          ]}
        />
      </Toolbar>

      <DataTable<Owner>
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(owner) => owner.id}
        emptyState={
          <EmptyState
            icon={<InboxIcon />}
            title={t('owner.empty.title')}
            description={t('owner.empty.desc')}
          />
        }
        rowActions={(owner) => <OwnerRowActions owner={owner} onView={openProfile} />}
      />

      <Pagination
        page={data?.page ?? 1}
        pageCount={data?.pageCount ?? 1}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />
    </PageContainer>
  );
}
