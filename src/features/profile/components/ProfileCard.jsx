import { motion } from "framer-motion";
import {
  getStoredRole,
  getStoredUser,
} from "../../auth/utils/auth.storage";

function ProfileCard() {
  const user = getStoredUser();
  const role = getStoredRole();
  const email = user?.email || "admin@bplay.com";
  const displayName = user?.name || email.split("@")[0] || "Bplay Admin";
  const displayRole = role === "super_admin" ? "Super Admin" : "Admin";

  return (
    <motion.div
      className="profile-card"
      initial={{
        opacity: 0,
        y: 40,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.6,
      }}
    >
      <div className="profile-avatar">
        ⚽
      </div>

      <h2 className="profile-name">
        {displayName}
      </h2>

      <p className="profile-email">
        {email}
      </p>

      <div className="profile-divider" />

      <div className="profile-info">

        <div className="profile-item">
          <span>Role</span>
          <strong>{displayRole}</strong>
        </div>

        <div className="profile-item">
          <span>Status</span>
          <strong>Active</strong>
        </div>

      </div>

      <button className="profile-button">
        Edit Profile
      </button>
    </motion.div>
  );
}

export default ProfileCard;