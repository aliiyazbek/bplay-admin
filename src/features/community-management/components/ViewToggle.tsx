import { useTranslation } from 'react-i18next';
import { IconButton, LayoutGridIcon, ListIcon } from '@ui';
import styles from './communityActions.module.css';

export type ViewMode = 'grid' | 'table';

interface Props {
  value: ViewMode;
  onChange: (value: ViewMode) => void;
}

/** Grid ⇄ table switch for the community list page. */
export function ViewToggle({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className={styles.viewToggle} role="group" aria-label={t('community.view.label')}>
      <IconButton
        size="sm"
        variant={value === 'grid' ? 'primary' : 'ghost'}
        label={t('community.view.grid')}
        icon={<LayoutGridIcon />}
        onClick={() => onChange('grid')}
        aria-pressed={value === 'grid'}
        data-testid="community-view-grid"
      />
      <IconButton
        size="sm"
        variant={value === 'table' ? 'primary' : 'ghost'}
        label={t('community.view.table')}
        icon={<ListIcon />}
        onClick={() => onChange('table')}
        aria-pressed={value === 'table'}
        data-testid="community-view-table"
      />
    </div>
  );
}
