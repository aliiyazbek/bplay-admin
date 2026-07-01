import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { ComponentType, SVGProps } from 'react';
import {
  Avatar,
  Button,
  clsx,
  BrandMark,
  UsersIcon,
  GlobeIcon,
  BuildingIcon,
  UserIcon,
  LogoutIcon,
} from '@ui';
import { useAuthStore, useAuthUser, useAuthRole } from '@shared/stores/authStore';
import { useUiStore } from '@shared/stores/uiStore';
import { logout as apiLogout } from '@features/auth/api';
import { PATHS } from '@app/router/paths';
import styles from './AppSidebar.module.css';

interface NavItem {
  to: string;
  key: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  superAdminOnly: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: PATHS.adminManagement, key: 'nav.adminManagement', Icon: UsersIcon, superAdminOnly: true },
  { to: PATHS.regionManagement, key: 'nav.regionManagement', Icon: GlobeIcon, superAdminOnly: true },
  { to: PATHS.ownerManagement, key: 'nav.ownerManagement', Icon: BuildingIcon, superAdminOnly: true },
  { to: PATHS.profile, key: 'nav.profile', Icon: UserIcon, superAdminOnly: false },
];

export function AppSidebar() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthUser();
  const role = useAuthRole();
  const isSidebarOpen = useUiStore((s) => s.isSidebarOpen);
  const closeSidebar = useUiStore((s) => s.closeSidebar);

  const handleLogout = async () => {
    try {
      await apiLogout();
    } catch {
      // Clear the local session regardless of the backend result.
    }
    useAuthStore.getState().logout();
    navigate(PATHS.login, { replace: true });
  };

  const items = NAV_ITEMS.filter((item) => !item.superAdminOnly || role === 'super_admin');
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Admin';

  return (
    <aside className={clsx(styles.sidebar, isSidebarOpen && styles.open)}>
      <div className={styles.brand}>
        <BrandMark size={30} />
        <span className={styles.brandName}>Bplay</span>
      </div>

      <NavLink to={PATHS.profile} className={styles.profile} onClick={closeSidebar}>
        <Avatar name={displayName} size="md" />
        <span className={styles.userInfo}>
          <span className={styles.userName}>{displayName}</span>
          <span className={styles.userEmail}>{user?.email}</span>
        </span>
      </NavLink>

      <nav className={styles.nav}>
        {items.map(({ to, key, Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={closeSidebar}
            className={({ isActive }) => clsx(styles.link, isActive && styles.linkActive)}
          >
            <Icon className={styles.linkIcon} />
            <span>{t(key)}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.spacer} />

      <Button variant="secondary" fullWidth leftIcon={<LogoutIcon />} onClick={handleLogout}>
        {t('common.signOut')}
      </Button>
    </aside>
  );
}
