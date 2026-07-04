import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Card,
  Badge,
  Button,
  DataTable,
  EmptyState,
  IconButton,
  RatingStars,
  BuildingIcon,
  StadiumIcon,
  EyeIcon,
  PlusIcon,
  InboxIcon,
  type Column,
} from '@ui';
import { statusToBadgeVariant } from '@shared/utils/status';
import { PATHS } from '@app/router/paths';
import { facilityRegionSeed, type RegionFacility } from '@features/facility-management/api';
import type { Region } from '../api/region.types';
import styles from './RegionFacilitiesCard.module.css';

interface Props {
  /** Kept for a stable, self-describing prop shape (the list is pre-fetched). */
  region: Region;
  facilities: RegionFacility[];
  isLoading: boolean;
}

/**
 * The facilities-in-region card: a DataTable of the facilities whose coordinates
 * fall inside the region circle. Each row links to the facility profile; the
 * header carries an "Add facility" button.
 */
export function RegionFacilitiesCard({ region, facilities, isLoading }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const columns = useMemo<Column<RegionFacility>[]>(
    () => [
      {
        key: 'name',
        header: t('facility.col.name'),
        render: (facility) => (
          <span className={styles.nameCell}>
            {facility.thumbnailUrl ? (
              <img className={styles.thumb} src={facility.thumbnailUrl} alt="" loading="lazy" />
            ) : (
              <span className={styles.thumbFallback} aria-hidden>
                <StadiumIcon />
              </span>
            )}
            <span className={styles.name}>{facility.name}</span>
            <span
              className={styles.kindGlyph}
              role="img"
              aria-label={t(`facility.kind.${facility.kind}`)}
              title={t(`facility.kind.${facility.kind}`)}
            >
              {facility.kind === 'club' ? <BuildingIcon /> : <StadiumIcon />}
            </span>
          </span>
        ),
      },
      {
        key: 'owner',
        header: t('facility.col.owner'),
        render: (facility) => (
          <button
            type="button"
            className={styles.ownerLink}
            onClick={(event) => {
              event.stopPropagation();
              navigate(`${PATHS.ownerManagement}/${facility.ownerId}`);
            }}
            aria-label={t('region.detail.facilities.viewOwner', { name: facility.ownerName })}
            data-testid={`region-facility-owner-${facility.id}`}
          >
            {facility.ownerName}
          </button>
        ),
      },
      {
        key: 'kind',
        header: t('facility.col.kind'),
        render: (facility) => (
          <Badge variant="neutral">{t(`facility.kind.${facility.kind}`)}</Badge>
        ),
      },
      {
        key: 'rating',
        header: t('facility.col.rating'),
        render: (facility) => <RatingStars value={facility.rating ?? null} size="sm" />,
      },
      {
        key: 'status',
        header: t('facility.col.status'),
        render: (facility) => (
          <Badge variant={statusToBadgeVariant(facility.status)}>
            {t(`status.${facility.status}`)}
          </Badge>
        ),
      },
    ],
    [t],
  );

  return (
    <Card className={styles.card} data-testid="region-detail-facilities">
      <div className={styles.head}>
        <h2 className={styles.title}>{t('region.detail.sections.facilities')}</h2>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<PlusIcon />}
          onClick={() =>
            navigate(PATHS.facilityManagementNew, {
              state: { region: facilityRegionSeed(region) },
            })
          }
        >
          {t('region.detail.facilities.add')}
        </Button>
      </div>

      <DataTable<RegionFacility>
        columns={columns}
        data={facilities}
        isLoading={isLoading}
        getRowId={(facility) => facility.id}
        onRowClick={(facility) => navigate(`${PATHS.facilityManagement}/${facility.id}`)}
        emptyState={
          <EmptyState icon={<InboxIcon />} title={t('region.detail.facilities.empty')} />
        }
        rowActions={(facility) => (
          <IconButton
            size="sm"
            variant="ghost"
            label={t('region.detail.facilities.view')}
            icon={<EyeIcon />}
            onClick={() => navigate(`${PATHS.facilityManagement}/${facility.id}`)}
            data-testid={`region-facility-view-${facility.id}`}
          />
        )}
      />
    </Card>
  );
}
