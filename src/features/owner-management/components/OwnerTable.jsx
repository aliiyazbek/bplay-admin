function OwnerTable({ owners, loading, onView, onApprove, onReject, onToggleStatus, isSuperAdmin, onOpenProfilePage }) {
  if (loading) {
    return <div className="owners-empty">Loading owners…</div>;
  }

  if (!owners.length) {
    return <div className="owners-empty">No owners found for this selection.</div>;
  }

  return (
    <table className="owners-table">
      <thead>
        <tr>
          <th>Owner</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Verification</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {owners.map((owner) => (
          <tr key={owner.id}>
            <td>
              <div className="owners-name-cell">
                <strong>{owner.name}</strong>
                <span>{owner.region || "Unassigned region"}</span>
              </div>
            </td>
            <td>{owner.email}</td>
            <td>{owner.phone}</td>
            <td>
              <span className={`owners-status ${owner.status || "pending"}`}>{owner.status || "pending"}</span>
            </td>
            <td>
              <span className={`owners-status owners-status-outline ${owner.verificationStatus || "pending"}`}>
                {owner.verificationStatus || "pending"}
              </span>
            </td>
            <td>{owner.createdAt ? new Date(owner.createdAt).toLocaleDateString() : "—"}</td>
            <td>
              <div className="owners-actions">
                <button className="owners-action-btn" onClick={() => onView(owner)}>
                  View
                </button>
                <button className="owners-action-btn" onClick={() => onOpenProfilePage(owner)}>
                  Profile
                </button>
                {(owner.verificationStatus === "pending" || owner.verificationStatus === "review") && (
                  <>
                    <button className="owners-action-btn owners-action-approve" onClick={() => onApprove(owner)}>
                      Approve
                    </button>
                    <button className="owners-action-btn owners-action-reject" onClick={() => onReject(owner)}>
                      Reject
                    </button>
                  </>
                )}
                {isSuperAdmin && (
                  <>
                    {owner.status !== "active" && owner.status !== "blocked" && (
                      <button className="owners-action-btn owners-action-activate" onClick={() => onToggleStatus(owner, "activate")}>
                        Activate
                      </button>
                    )}
                    {owner.status !== "inactive" && owner.status !== "blocked" && (
                      <button className="owners-action-btn owners-action-disable" onClick={() => onToggleStatus(owner, "disable")}>
                        Disable
                      </button>
                    )}
                    {owner.status !== "blocked" && (
                      <button className="owners-action-btn owners-action-block" onClick={() => onToggleStatus(owner, "block")}>
                        Block
                      </button>
                    )}
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default OwnerTable;
