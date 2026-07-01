function RegionDetailsModal({ isOpen, onClose, region }) {
  if (!isOpen || !region) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="region-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Region details</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="region-details">
          <div className="detail-row">
            <span>Name</span>
            <strong>{region.name}</strong>
          </div>
          <div className="detail-row">
            <span>City</span>
            <strong>{region.city || "-"}</strong>
          </div>
          <div className="detail-row">
            <span>Neighborhood</span>
            <strong>{region.neighborhood || "-"}</strong>
          </div>
          <div className="detail-row">
            <span>Center</span>
            <strong>
              {region.latitude}, {region.longitude}
            </strong>
          </div>
          <div className="detail-row">
            <span>Radius</span>
            <strong>{region.radius} km</strong>
          </div>
          <div className="detail-row">
            <span>Status</span>
            <strong>{region.isActive ? "Active" : "Inactive"}</strong>
          </div>
          <div className="detail-row">
            <span>Assigned admins</span>
            <strong>
              {region.assignedAdmins && region.assignedAdmins.length > 0
                ? region.assignedAdmins
                    .map((admin) => admin?.name || admin?.email || "Unknown")
                    .join(", ")
                : "No assigned admins"}
            </strong>
          </div>
        </div>

        <div className="modal-actions">
          <button className="modal-button" type="button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegionDetailsModal;
