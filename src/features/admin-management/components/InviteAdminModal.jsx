import { useState } from "react";
import { motion } from "framer-motion";

function InviteAdminModal({ isOpen, onClose, onInvite }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    onInvite({
      name,
      email,
      role: "admin",
      password,
    });

    setName("");
    setEmail("");
    setPassword("");

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>

      <motion.div
        className="invite-card"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35 }}
        onClick={(e) => e.stopPropagation()}
      >

        <div className="invite-avatar">⚽</div>

        <h2 className="invite-title">Invite Admin</h2>
        <p className="invite-subtitle">Create a new admin account</p>

        <div className="invite-divider" />

        <form onSubmit={handleSubmit} className="invite-form">

          <input
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Temporary Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="invite-button">
            Create Admin
          </button>

          <button type="button" className="invite-cancel" onClick={onClose}>
            Cancel
          </button>

        </form>

      </motion.div>

    </div>
  );
}

export default InviteAdminModal;