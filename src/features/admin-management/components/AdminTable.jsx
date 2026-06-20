function AdminTable({
  admins,
  loading,
  onEdit,
  onSuspend,
  onDelete,
}) {
  const hasRows = admins.length > 0;

  return (
    <table className="admin-table">

      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>

      <tbody>
        {loading ? (
          <tr>
            <td className="admin-empty" colSpan="5">
              Loading admins...
            </td>
          </tr>
        ) : !hasRows ? (
          <tr>
            <td className="admin-empty" colSpan="5">
              No admins found.
            </td>
          </tr>
        ) : (
          admins.map((admin) => (
            <tr key={admin.id}>

            <td>{admin.name}</td>
            <td>{admin.email}</td>
            <td>{admin.role}</td>

            <td>
              <span className={`status ${admin.status}`}>
                {admin.status}
              </span>
            </td>

            <td>

              <button
                onClick={() => onEdit(admin)}
              >
                Edit
              </button>

              <button
                onClick={() => onSuspend(admin)}
              >
                {admin.status === "active" ? "Suspend" : "Activate"}
              </button>

              <button
                onClick={() => onDelete(admin)}
              >
                Delete
              </button>

            </td>

            </tr>
          ))
        )}
      </tbody>

    </table>
  );
}

export default AdminTable;