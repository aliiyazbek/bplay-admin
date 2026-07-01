import { motion } from "framer-motion";

function ApproveOwnerModal({ isOpen, onClose, owner, onConfirm, action }) {
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
        <h3>{action === "reject" ? "Reject owner" : "Approve owner"}</h3>
        <p>
          {action === "reject"
            ? `Reject ${owner.name} and mark the request as rejected?`
            : `Approve ${owner.name} and move the request to the approved state?`}
        </p>

        <div className="owners-form-actions">
          <button className="owners-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button className="owners-submit-btn" onClick={() => onConfirm(owner)}>
            Confirm
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default ApproveOwnerModal;
