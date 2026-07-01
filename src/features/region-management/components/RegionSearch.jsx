function RegionSearch({ search, setSearch }) {
  return (
    <div className="region-search-wrap">
      <input
        className="region-search"
        type="text"
        placeholder="Search regions by name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        aria-label="Search regions"
      />
    </div>
  );
}

export default RegionSearch;
