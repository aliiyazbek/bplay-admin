import { useEffect, useState } from "react";
import { getAdmins } from "../../admin-management/services/admin.service";

function AssignAdminModal({ isOpen, onClose, region, onAssign }) {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmins, setSelectedAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAdmins = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getAdmins();
        setAdmins(data);
      } catch {
        setError("Failed to load admin list.");
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadAdmins();
    }
  }, [isOpen]);

  useEffect(() => {
    if (region) {
      const ids = region.assignedAdmins?.map((admin) => admin.id) || [];
      setSelectedAdmins(ids);
    } else {
      setSelectedAdmins([]);
    }
  }, [region]);

  if (!isOpen) {
    return null;
  }

  const handleSelection = (adminId) => {
    setSelectedAdmins((prev) =>
      prev.includes(adminId)
        ? prev.filter((id) => id !== adminId)
        : [...prev, adminId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!region) {
      return;
    }

    await onAssign(region.id, selectedAdmins);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="region-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Assign admins</h2>
          <button className="modal-close" type="button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="assign-content">
          {loading ? (
            <div className="region-empty">Loading admins...</div>
          ) : error ? (
            <div className="modal-error">{error}</div>
          ) : (
            <form onSubmit={handleSubmit} className="assign-form">
              <div className="assign-list">
                {admins.map((admin) => (
                  <label key={admin.id} className="assign-row">
                    <input
                      type="checkbox"
                      checked={selectedAdmins.includes(admin.id)}
                      onChange={() => handleSelection(admin.id)}
                    />
                    <span>{admin.name} ({admin.email})</span>
                  </label>
                ))}
              </div>

              <div className="modal-actions">
                <button className="modal-button" type="submit">
                  Save assignment
                </button>
                <button
                  className="modal-button secondary"
                  type="button"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AssignAdminModal;
