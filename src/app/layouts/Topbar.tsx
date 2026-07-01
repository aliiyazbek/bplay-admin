import { useTranslation } from 'react-i18next';
import { IconButton, MenuIcon } from '@ui';
import { useUiStore } from '@shared/stores/uiStore';
import { LanguageSwitcher } from './LanguageSwitcher';
import styles from './Topbar.module.css';

export function Topbar() {
  const { t } = useTranslation();
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <header className={styles.topbar}>
      <IconButton
        className={styles.menuButton}
        variant="ghost"
        label={t('common.appName')}
        icon={<MenuIcon />}
        onClick={toggleSidebar}
      />
      <div className={styles.spacer} />
      <LanguageSwitcher />
    </header>
  );
}
