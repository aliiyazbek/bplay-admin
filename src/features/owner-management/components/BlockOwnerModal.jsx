import { motion } from "framer-motion";

function BlockOwnerModal({ isOpen, onClose, owner, onConfirm }) {
  if (!isOpen || !owner) {
    return null;
  }

  return (
    <div className="owners-modal-overlay" onClick={onClose}>
      <motion.div
        className="owners-modal-card"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(event) => event.stopPropagation()}
      >
        <h3>Block owner</h3>
        <p>
          Blocking {owner.name} will permanently prevent future access and registrations for this identity.
        </p>

        <div className="owners-form-actions">
          <button className="owners-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="owners-submit-btn owners-submit-danger" onClick={() => onConfirm(owner)}>
            Confirm block
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default BlockOwnerModal;
