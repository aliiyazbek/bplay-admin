function AdminFilters({ filter, setFilter }) {
  return (
    <select
      className="admin-filter"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="suspended">Suspended</option>
    </select>
  );
}

export default AdminFilters;