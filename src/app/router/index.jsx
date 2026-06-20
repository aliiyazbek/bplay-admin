import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AdminManagementPage from "../../features/admin-management/pages/AdminManagementPage";
import ForgotPasswordPage from "../../features/auth/pages/ForgotPasswordPage";
import LoginPage from "../../features/auth/pages/LoginPage";
import ResetPasswordPage from "../../features/auth/pages/ResetPasswordPage";
import LandingPage from "../../features/landing/pages/LandingPage";
import ProfilePage from "../../features/profile/pages/ProfilePage";
import DashboardLayout from "../../layouts/DashboardLayout";
import NotFound from "../../pages/NotFound";

const getSessionRole = () => localStorage.getItem("role");
const getAccessToken = () => localStorage.getItem("accessToken");

function RequireSuperAdmin({ children }) {
  const token = getAccessToken();
  const role = getSessionRole();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (role !== "super_admin") {
    return <Navigate to="/app/profile" replace />;
  }

  return children;
}

function DashboardIndexRedirect() {
  const role = getSessionRole();

  return (
    <Navigate
      replace
      to={role === "super_admin" ? "/app/admin-management" : "/app/profile"}
    />
  );
}

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}
        <Route path="/" element={<LandingPage />} />

        {/* AUTH */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* DASHBOARD SYSTEM */}
        <Route path="/app" element={<DashboardLayout />}>
          <Route index element={<DashboardIndexRedirect />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route
            path="admin-management"
            element={
              <RequireSuperAdmin>
                <AdminManagementPage />
              </RequireSuperAdmin>
            }
          />
        </Route>
        <Route
          path="/app/admins"
          element={<Navigate to="/app/admin-management" replace />}
        />
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;