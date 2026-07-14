import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Spinner } from '@ui';
import { useAuthRole } from '@shared/stores/authStore';
import { RequireAnyRole, RequireAuth, RequireRole } from './guards';
import { PATHS } from './paths';

// Code-split every route.
const LandingPage = lazy(() => import('@features/landing/pages/LandingPage'));
const LoginPage = lazy(() => import('@features/auth/pages/LoginPage'));
const ForgotPasswordPage = lazy(() => import('@features/auth/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('@features/auth/pages/ResetPasswordPage'));
const ProfilePage = lazy(() => import('@features/profile/pages/ProfilePage'));
const AdminManagementPage = lazy(() => import('@features/admin-management/pages/AdminManagementPage'));
const AdminDetailPage = lazy(() => import('@features/admin-management/pages/AdminDetailPage'));
const RegionManagementPage = lazy(() => import('@features/region-management/pages/RegionManagementPage'));
const RegionDetailPage = lazy(() => import('@features/region-management/pages/RegionDetailPage'));
const OwnerManagementPage = lazy(() => import('@features/owner-management/pages/OwnerManagementPage'));
const OwnerProfilePage = lazy(() => import('@features/owner-management/pages/OwnerProfilePage'));
const PlayerManagementPage = lazy(
  () => import('@features/player-management/pages/PlayerManagementPage'),
);
const PlayerProfilePage = lazy(() => import('@features/player-management/pages/PlayerProfilePage'));
const FacilityManagementPage = lazy(
  () => import('@features/facility-management/pages/FacilityManagementPage'),
);
const AddFacilityWizardPage = lazy(
  () => import('@features/facility-management/pages/AddFacilityWizardPage'),
);
const FacilityProfilePage = lazy(
  () => import('@features/facility-management/pages/FacilityProfilePage'),
);
const CommunityManagementPage = lazy(
  () => import('@features/community-management/pages/CommunityManagementPage'),
);
const PostDetailPage = lazy(() => import('@features/community-management/pages/PostDetailPage'));
const BookingManagementPage = lazy(
  () => import('@features/booking-management/pages/BookingManagementPage'),
);
const BookingDetailPage = lazy(
  () => import('@features/booking-management/pages/BookingDetailPage'),
);
const ClubSubscriptionsPage = lazy(
  () => import('@features/club-subscriptions/pages/ClubSubscriptionsPage'),
);
const MembershipDetailPage = lazy(
  () => import('@features/club-subscriptions/pages/MembershipDetailPage'),
);
const NotFound = lazy(() => import('@/pages/NotFound'));
const DashboardLayout = lazy(() => import('@app/layouts/DashboardLayout'));
const DashboardPage = lazy(() => import('@features/dashboard/pages/DashboardPage'));

function DashboardIndexRedirect() {
  const role = useAuthRole();
  if (role === 'super_admin') return <Navigate replace to={PATHS.dashboard} />;
  if (role === 'admin') return <Navigate replace to={PATHS.facilityManagement} />;
  return <Navigate replace to={PATHS.profile} />;
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
            <Route
              path="dashboard"
              element={
                <RequireRole role="super_admin">
                  <DashboardPage />
                </RequireRole>
              }
            />
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
              path="admin-management/:adminId"
              element={
                <RequireRole role="super_admin">
                  <AdminDetailPage />
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
              path="region-management/:regionId"
              element={
                <RequireRole role="super_admin">
                  <RegionDetailPage />
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
            <Route
              path="player-management"
              element={
                <RequireRole role="super_admin">
                  <PlayerManagementPage />
                </RequireRole>
              }
            />
            <Route
              path="player-management/:playerId"
              element={
                <RequireRole role="super_admin">
                  <PlayerProfilePage />
                </RequireRole>
              }
            />
            <Route
              path="facility-management"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <FacilityManagementPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="facility-management/new"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <AddFacilityWizardPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="facility-management/:facilityId/edit"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <AddFacilityWizardPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="facility-management/:facilityId"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <FacilityProfilePage />
                </RequireAnyRole>
              }
            />
            <Route
              path="community-management"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <CommunityManagementPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="community-management/:postId"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <PostDetailPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="booking-management"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <BookingManagementPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="booking-management/:bookingId"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <BookingDetailPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="club-subscriptions"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <ClubSubscriptionsPage />
                </RequireAnyRole>
              }
            />
            <Route
              path="club-subscriptions/:membershipId"
              element={
                <RequireAnyRole roles={['super_admin', 'admin']}>
                  <MembershipDetailPage />
                </RequireAnyRole>
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
