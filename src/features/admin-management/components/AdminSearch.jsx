function AdminSearch({ search, setSearch }) {
  return (
    <div className="admin-search-wrap">
      <input
        className="admin-search"
        type="text"
        placeholder="Search admins by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search admins"
      />
    </div>
  );
}

export default AdminSearch;