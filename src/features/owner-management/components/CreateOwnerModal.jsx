import { useMemo, useState } from "react";
import { motion } from "framer-motion";

function CreateOwnerModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const password = useMemo(() => {
    if (form.password) {
      return form.password;
    }

    return Math.random().toString(36).slice(-10);
  }, [form.password]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    const success = await onCreate({ ...form, password });

    if (success) {
      setForm({ name: "", email: "", phone: "", password: "" });
      onClose();
    }
  };

  return (
    <div className="owners-modal-overlay" onClick={onClose}>
      <motion.div
        className="owners-modal-card"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="owners-modal-header">
          <div>
            <h3>Create owner</h3>
            <p>Generate a temporary password for the new owner</p>
          </div>
          <button className="owners-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <form className="owners-form" onSubmit={handleSubmit}>
          <input
            className="owners-input"
            placeholder="Owner name"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            required
          />
          <input
            className="owners-input"
            type="email"
            placeholder="Owner email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
          <input
            className="owners-input"
            placeholder="Phone"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            required
          />
          <input
            className="owners-input"
            placeholder="Temporary password"
            value={password}
            readOnly
          />

          <div className="owners-form-actions">
            <button type="button" className="owners-cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="owners-submit-btn">
              Create owner
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateOwnerModal;
