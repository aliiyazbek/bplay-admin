import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { logout } from "../../../features/auth/services/auth.service";
import {
  clearAuthSession,
  getStoredRole,
  getStoredUser,
} from "../../../features/auth/utils/auth.storage";
import "./Sidebar.css";

function Sidebar() {
  const navigate = useNavigate();
  const role = getStoredRole();
  const user = getStoredUser();
  const isSuperAdmin = role === "super_admin";
  const email = user?.email || "admin@bplay.com";
  const displayName = email.split("@")[0] || "Admin";

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err) {
      // Clear client session even if the backend logout endpoint fails.
    } finally {
      clearAuthSession();
      navigate("/login");
    }
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="top">
        <div className="logo">⚽ Bplay</div>
      </div>

      <NavLink to="/app/profile" className="profile">
        <div className="avatar">A</div>
        <div className="info">
          <div className="name">{displayName}</div>
          <div className="email">{email}</div>
        </div>
      </NavLink>

      <div className="menu">
        {isSuperAdmin && (
          <>
            <NavLink to="/app/admin-management" className="menu-item">
              👥 Admin Management
            </NavLink>
            <NavLink to="/app/region-management" className="menu-item">
              🌍 Region Management
            </NavLink>
            <NavLink to="/app/owner-management" className="menu-item">
              🏟️ Owner Management
            </NavLink>
          </>
        )}
      </div>

      <div className="spacer" />

      {/* LOGOUT */}
      <motion.button
        className="logout"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleLogout}
      >
        🚪 Logout
      </motion.button>
    </motion.aside>
  );
}

export default Sidebar;