import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@ui';
import { useAuthRole } from '@shared/stores/authStore';
import { RequireAuth, RequireRole } from './guards';
import { PATHS } from './paths';

// Code-split every route.
const LandingPage = lazy(() => import('@features/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@features/auth/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@features/profile/pages/ProfilePage'));
const AdminManagementPage = lazy(() => import('@features/admin-management/pages/AdminManagementPage'));
const RegionManagementPage = lazy(() => import('@features/region-management/pages/RegionManagementPage'));
const OwnerManagementPage = lazy(() => import('@features/owner-management/pages/OwnerManagementPage'));
const OwnerProfilePage = lazy(() => import('@features/owner-management/pages/OwnerProfilePage'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const DashboardLayout = lazy(() => import('@app/layouts/DashboardLayout'));

function DashboardIndexRedirect() {
  const role = useAuthRole();
  return <Navigate replace to={role === 'super_admin' ? PATHS.adminManagement : PATHS.profile} />;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="route-fallback">
            <Spinner size="lg" />
          </div>
        }
      >
        <Routes>
          {/* Public */}
          <Route path={PATHS.home} element={<LandingPage />} />

          {/* Auth */}
          <Route path={PATHS.login} element={<LoginPage />} />
          <Route path={PATHS.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={PATHS.resetPassword} element={<ResetPasswordPage />} />

          {/* Dashboard */}
          <Route
            path={PATHS.app}
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            <Route index element={<DashboardIndexRedirect />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route
              path="admin-management"
              element={
                <RequireRole role="super_admin">
                  <AdminManagementPage />
                </RequireRole>
              }
            />
            <Route
              path="region-management"
              element={
                <RequireRole role="super_admin">
                  <RegionManagementPage />
                </RequireRole>
              }
            />
            <Route
              path="owner-management"
              element={
                <RequireRole role="super_admin">
                  <OwnerManagementPage />
                </RequireRole>
              }
            />
            <Route
              path="owner-management/:ownerId"
              element={
                <RequireRole role="super_admin">
                  <OwnerProfilePage />
                </RequireRole>
              }
            />
          </Route>

          <Route path="/app/admins" element={<Navigate to={PATHS.adminManagement} replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
