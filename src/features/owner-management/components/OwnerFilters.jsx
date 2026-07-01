function OwnerFilters({
  status,
  setStatus,
  activeFilter,
  setActiveFilter,
  trustTier,
  setTrustTier,
  region,
  setRegion,
}) {
  return (
    <div className="owners-filters">
      <select className="owners-filter" value={status} onChange={(event) => setStatus(event.target.value)}>
        <option value="all">All statuses</option>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
        <option value="blocked">Blocked</option>
      </select>

      <select className="owners-filter" value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)}>
        <option value="all">All activity</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <select className="owners-filter" value={trustTier} onChange={(event) => setTrustTier(event.target.value)}>
        <option value="all">All trust tiers</option>
        <option value="basic">Basic</option>
        <option value="standard">Standard</option>
        <option value="premium">Premium</option>
      </select>

      <input
        className="owners-filter owners-region-input"
        type="text"
        value={region}
        onChange={(event) => setRegion(event.target.value)}
        placeholder="Filter by region"
      />
    </div>
  );
}

export default OwnerFilters;
