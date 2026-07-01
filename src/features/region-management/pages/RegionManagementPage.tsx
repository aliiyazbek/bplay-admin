import { useMemo, useState } from 'react';
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
  EmptyState,
  PlusIcon,
  InboxIcon,
  type Column,
} from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { statusToBadgeVariant } from '@shared/utils/status';
import { useRegionsQuery } from '../hooks/useRegionsQuery';
import { RegionFormModal } from '../components/RegionFormModal';
import { AssignAdminModal } from '../components/AssignAdminModal';
import { RegionRowActions } from '../components/RegionRowActions';
import type { Region, RegionListParams } from '../api/region.types';

export default function RegionManagementPage() {
  const { t } = useTranslation();
  const create = useDisclosure();
  const [editing, setEditing] = useState<Region | null>(null);
  const [assigning, setAssigning] = useState<Region | null>(null);
  const [params, setParams] = useState<RegionListParams>({ q: '', type: 'all', page: 1 });
  const { data, isLoading, isError, refetch } = useRegionsQuery(params);

  // Cities for the form's city select — fetched separately so it is unaffected by list filters/paging.
  const citiesQuery = useRegionsQuery({ type: 'city', page: 1, pageSize: 1000 });
  const cities = useMemo(
    () => (citiesQuery.data?.items ?? []).map((city) => ({ id: city.id, name: city.name })),
    [citiesQuery.data],
  );

  const columns: Column<Region>[] = [
    { key: 'name', header: t('region.col.name') },
    {
      key: 'type',
      header: t('region.col.type'),
      render: (region) => (
        <Badge variant={region.type === 'city' ? 'info' : 'neutral'}>
          {t(`region.type.${region.type}`)}
        </Badge>
      ),
    },
    {
      key: 'assignedAdmin',
      header: t('region.col.assignedAdmin'),
      render: (region) => region.assignedAdminName ?? '—',
    },
    {
      key: 'status',
      header: t('region.col.status'),
      render: (region) => (
        <Badge variant={statusToBadgeVariant(region.status)}>
          {t(`region.status.${region.status}`)}
        </Badge>
      ),
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        title={t('region.title')}
        subtitle={t('region.subtitle')}
        actions={
          <Button leftIcon={<PlusIcon />} onClick={create.open}>
            {t('region.create')}
          </Button>
        }
      />

      <Toolbar>
        <SearchInput
          value={params.q ?? ''}
          onChange={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
          placeholder={t('region.search')}
        />
        <Select
          aria-label={t('region.col.type')}
          value={params.type}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              type: value as RegionListParams['type'],
              page: 1,
            }))
          }
          options={[
            { value: 'all', label: t('region.filter.all') },
            { value: 'city', label: t('region.type.city') },
            { value: 'neighborhood', label: t('region.type.neighborhood') },
          ]}
        />
      </Toolbar>

      <DataTable<Region>
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(region) => region.id}
        emptyState={
          <EmptyState
            icon={<InboxIcon />}
            title={t('region.empty.title')}
            description={t('region.empty.desc')}
          />
        }
        rowActions={(region) => (
          <RegionRowActions region={region} onEdit={setEditing} onAssign={setAssigning} />
        )}
      />

      <Pagination
        page={data?.page ?? 1}
        pageCount={data?.pageCount ?? 1}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <RegionFormModal isOpen={create.isOpen} onClose={create.close} region={null} cities={cities} />
      <RegionFormModal
        isOpen={editing !== null}
        onClose={() => setEditing(null)}
        region={editing}
        cities={cities}
      />
      <AssignAdminModal
        isOpen={assigning !== null}
        onClose={() => setAssigning(null)}
        region={assigning}
      />
    </PageContainer>
  );
}
