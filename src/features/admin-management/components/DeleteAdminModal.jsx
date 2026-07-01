import { motion } from "framer-motion";

function DeleteAdminModal({ isOpen, onClose, onConfirm, admin }) {
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

        <div className="invite-avatar">⚠️</div>

        <h2 className="invite-title">Delete Admin</h2>
        <p className="invite-subtitle">
          Are you sure you want to delete {admin?.name}?
        </p>

        <div className="invite-divider" />

        <button
          className="invite-button"
          onClick={async () => {
            try {
              const res = await onConfirm();
              if (res !== false) {
                onClose();
              }
            } catch (err) {
              // keep modal open; parent will set error
            }
          }}
        >
          Yes, Delete
        </button>

        <button className="invite-cancel" onClick={onClose}>
          Cancel
        </button>

      </motion.div>

    </div>
  );
}

export default DeleteAdminModal;