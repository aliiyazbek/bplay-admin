import { motion } from "framer-motion";

function SuspendAdminModal({ isOpen, onClose, admin, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="invite-card"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="invite-avatar">⛔</div>

        <h2 className="invite-title">
          {admin?.isActive
            ? "Suspend Admin"
            : "Activate Admin"}
        </h2>

        <p className="invite-subtitle">
          Are you sure you want to change status of{" "}
          <b>{admin?.name || "this admin"}</b>?
        </p>

        <div className="invite-divider" />

        <button
          className="invite-button"
          onClick={async () => {
            try {
              const res = await onConfirm();
              // only close if handler returned truthy (success)
              if (res !== false) {
                onClose();
              }
            } catch (err) {
              // keep modal open; page will show error message via parent
            }
          }}
        >
          Confirm
        </button>

        <button className="invite-cancel" onClick={onClose}>
          Cancel
        </button>
      </motion.div>
    </div>
  );
}

export default SuspendAdminModal;