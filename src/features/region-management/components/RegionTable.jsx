function RegionTable({ regions, loading, onEdit, onToggleStatus, onAssign, onView }) {
  const hasRows = regions.length > 0;

  const renderAssignedAdmins = (assignedAdmins) => {
    if (!assignedAdmins || assignedAdmins.length === 0) {
      return "No admins";
    }

    return assignedAdmins
      .map((admin) => admin?.name || admin?.email || admin?.id || "Unknown")
      .join(", ");
  };

  return (
    <table className="region-table">
      <thead>
        <tr>
          <th>Region</th>
          <th>Center</th>
          <th>Radius</th>
          <th>Status</th>
          <th>Assigned admins</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          <tr>
            <td className="region-empty" colSpan="6">
              Loading regions...
            </td>
          </tr>
        ) : !hasRows ? (
          <tr>
            <td className="region-empty" colSpan="6">
              No regions found.
            </td>
          </tr>
        ) : (
          regions.map((region) => (
            <tr key={region.id}>
              <td>{region.name}</td>
              <td>
                {region.latitude}, {region.longitude}
              </td>
              <td>{region.radius} km</td>
              <td>
                <span className={`status ${region.isActive ? "active" : "inactive"}`}>
                  {region.isActive ? "active" : "inactive"}
                </span>
              </td>
              <td>{renderAssignedAdmins(region.assignedAdmins)}</td>
              <td>
                <button type="button" onClick={() => onView(region)}>
                  Details
                </button>
                <button type="button" onClick={() => onEdit(region)}>
                  Edit
                </button>
                <button type="button" onClick={() => onToggleStatus(region)}>
                  {region.isActive ? "Deactivate" : "Activate"}
                </button>
                <button type="button" onClick={() => onAssign(region)}>
                  Assign
                </button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

export default RegionTable;
