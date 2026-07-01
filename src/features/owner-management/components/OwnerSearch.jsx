function OwnerSearch({ search, setSearch }) {
  return (
    <div className="owners-search-wrap">
      <input
        className="owners-search"
        type="text"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search by owner name, email, or phone"
      />
    </div>
  );
}

export default OwnerSearch;
