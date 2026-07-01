import { useEffect, useState } from "react";
import { motion } from "framer-motion";

function EditAdminModal({
  isOpen,
  onClose,
  admin,
  onSave,
}) {
  const [form, setForm] = useState({
    name: admin?.name || "",
    email: admin?.email || "",
    role: admin?.role || "admin",
  });

  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setForm({
      name: admin?.name || "",
      email: admin?.email || "",
      role: admin?.role || "admin",
    });
  }, [admin, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // Call onSave and only close on success. onSave should return true on success or throw on error.
    const doSave = async () => {
      try {
        const res = await onSave(form);
        // If onSave returns falsy, assume failure and keep modal open
        if (res === false) {
          return;
        }
        onClose();
      } catch (err) {
        // Keep modal open; show inline error if available
        setLocalError(err?.response?.data?.message || err?.message || "Failed to update admin.");
      }
    };

    doSave();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>

      <motion.div
        className="invite-card"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >

        {/* ICON */}
        <div className="invite-avatar">✏️</div>

        {/* TITLE */}
        <h2 className="invite-title">Edit Admin</h2>
        <p className="invite-subtitle">
          Update admin information
        </p>

        <div className="invite-divider" />

        {/* SAME STRUCTURE AS INVITE FORM */}
        <div className="invite-form">

          <input
            placeholder="Full Name"
            name="name"
            value={form.name}
            onChange={handleChange}
          />

          <input
            placeholder="Email Address"
            name="email"
            value={form.email}
            onChange={handleChange}
          />

          <select
            name="role"
            value={form.role}
            onChange={handleChange}
          >
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>

          <button className="invite-button" onClick={handleSave}>
            Save Changes
          </button>
          {localError && (
            <div style={{ color: "#fecaca", marginTop: 8 }}>{localError}</div>
          )}
          <button className="invite-cancel" onClick={onClose}>
            Cancel
          </button>

        </div>

      </motion.div>

    </div>
  );
}

export default EditAdminModal;