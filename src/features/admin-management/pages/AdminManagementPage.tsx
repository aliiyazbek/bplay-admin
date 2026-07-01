import { useState } from 'react';
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
  UserCell,
  PlusIcon,
  InboxIcon,
  type Column,
} from '@ui';
import { useDisclosure } from '@shared/hooks/useDisclosure';
import { statusToBadgeVariant } from '@shared/utils/status';
import { useAdminsQuery } from '../hooks/useAdminsQuery';
import { InviteAdminModal } from '../components/InviteAdminModal';
import { EditAdminModal } from '../components/EditAdminModal';
import { AdminRowActions } from '../components/AdminRowActions';
import type { Admin, AdminListParams } from '../api/admin.types';

export default function AdminManagementPage() {
  const { t } = useTranslation();
  const invite = useDisclosure();
  const [editing, setEditing] = useState<Admin | null>(null);
  const [params, setParams] = useState<AdminListParams>({ q: '', status: 'all', page: 1 });
  const { data, isLoading, isError, refetch } = useAdminsQuery(params);

  const columns: Column<Admin>[] = [
    {
      key: 'name',
      header: t('admin.col.name'),
      render: (admin) => <UserCell name={admin.name} email={admin.email} />,
    },
    { key: 'role', header: t('admin.col.role') },
    {
      key: 'status',
      header: t('admin.col.status'),
      render: (admin) => (
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
          <Button leftIcon={<PlusIcon />} onClick={invite.open}>
            {t('admin.invite')}
          </Button>
        }
      />

      <Toolbar>
        <SearchInput
          value={params.q ?? ''}
          onChange={(q) => setParams((prev) => ({ ...prev, q, page: 1 }))}
          placeholder={t('admin.search')}
        />
        <Select
          aria-label={t('admin.col.status')}
          value={params.status}
          onChange={(value) =>
            setParams((prev) => ({
              ...prev,
              status: value as AdminListParams['status'],
              page: 1,
            }))
          }
          options={[
            { value: 'all', label: t('status.all') },
            { value: 'active', label: t('status.active') },
            { value: 'suspended', label: t('status.suspended') },
          ]}
        />
      </Toolbar>

      <DataTable<Admin>
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading}
        error={isError ? t('common.loadError') : undefined}
        onRetry={() => void refetch()}
        getRowId={(admin) => admin.id}
        emptyState={
          <EmptyState icon={<InboxIcon />} title={t('admin.empty.title')} description={t('admin.empty.desc')} />
        }
        rowActions={(admin) => <AdminRowActions admin={admin} onEdit={setEditing} />}
      />

      <Pagination
        page={data?.page ?? 1}
        pageCount={data?.pageCount ?? 1}
        onPageChange={(page) => setParams((prev) => ({ ...prev, page }))}
      />

      <InviteAdminModal isOpen={invite.isOpen} onClose={invite.close} />
      <EditAdminModal isOpen={editing !== null} onClose={() => setEditing(null)} admin={editing} />
    </PageContainer>
  );
}
