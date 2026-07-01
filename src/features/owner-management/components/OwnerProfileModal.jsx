import { motion } from "framer-motion";

function OwnerProfileModal({ isOpen, onClose, owner }) {
  if (!isOpen || !owner) {
    return null;
  }

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
            <h3>{owner.name}</h3>
            <p>Owner profile and verification details</p>
          </div>
          <button className="owners-modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="owners-profile-grid">
          <div className="owners-profile-card">
            <h4>Personal info</h4>
            <p><strong>Name:</strong> {owner.name}</p>
            <p><strong>Email:</strong> {owner.email}</p>
            <p><strong>Phone:</strong> {owner.phone}</p>
            <p><strong>Status:</strong> {owner.status}</p>
            <p><strong>Verification:</strong> {owner.verificationStatus}</p>
            <p><strong>Trust tier:</strong> {owner.trustTier}</p>
          </div>

          <div className="owners-profile-card">
            <h4>Region info</h4>
            <p><strong>Region:</strong> {owner.region || "Not assigned"}</p>
            <p><strong>Facilities:</strong> {owner.facilities?.length || 0}</p>
            <p><strong>Documents:</strong> {owner.documents?.length || 0}</p>
          </div>
        </div>

        <div className="owners-profile-card">
          <h4>Facilities</h4>
          {owner.facilities?.length ? (
            <ul>
              {owner.facilities.map((facility, index) => (
                <li key={`${facility?.name || "facility"}-${index}`}>{facility?.name || facility}</li>
              ))}
            </ul>
          ) : (
            <p>No facilities linked yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default OwnerProfileModal;
