function RegionFilters({ filter, setFilter }) {
  return (
    <select
      className="region-filter"
      value={filter}
      onChange={(e) => setFilter(e.target.value)}
    >
      <option value="all">All</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  );
}

export default RegionFilters;
