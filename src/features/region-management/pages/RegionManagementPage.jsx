import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import useRegionStore from "../store/regionStore";
import RegionSearch from "../components/RegionSearch";
import RegionFilters from "../components/RegionFilters";
import RegionTable from "../components/RegionTable";
import RegionFormModal from "../components/RegionFormModal";
import RegionDetailsModal from "../components/RegionDetailsModal";
import AssignAdminModal from "../components/AssignAdminModal";
import "../styles/region-management.css";

function RegionManagementPage() {
  const {
    regions,
    loading,
    error,
    fetchRegions,
    createRegion,
    updateRegion,
    toggleStatus,
    assignAdmin,
  } = useRegionStore();

  const [selectedRegion, setSelectedRegion] = useState(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) {
        return;
      }
      await fetchRegions();
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchRegions]);

  const filteredRegions = useMemo(() => {
    return regions.filter((region) => {
      const searchTerm = search.trim().toLowerCase();
      const matchesSearch =
        searchTerm.length === 0 ||
        region.name.toLowerCase().includes(searchTerm);

      const matchesFilter =
        filter === "all" ? true : region.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [regions, search, filter]);

  const openView = (region) => {
    setSelectedRegion(region);
    setViewOpen(true);
  };

  const openEdit = (region) => {
    setSelectedRegion(region);
    setEditOpen(true);
  };

  const openAssign = (region) => {
    setSelectedRegion(region);
    setAssignOpen(true);
  };

  const handleCreateRegion = async (data) => {
    await createRegion(data);
  };

  const handleUpdateRegion = async (data) => {
    if (!selectedRegion) {
      return;
    }
    await updateRegion(selectedRegion.id, data);
  };

  const handleToggleStatus = async (region) => {
    await toggleStatus(region.id, !region.isActive);
  };

  const handleAssignAdmin = async (regionId, adminIds) => {
    await assignAdmin(regionId, adminIds);
  };

  return (
    <motion.div
      className="regions-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="regions-header">
        <div>
          <h1>Region Management</h1>
          <p>Manage geographic regions and assign coverage to admins.</p>
        </div>

        <button
          className="region-add-btn"
          onClick={() => {
            setSelectedRegion(null);
            setEditOpen(true);
          }}
        >
          + Create Region
        </button>
      </div>

      <div className="regions-top">
        <RegionSearch search={search} setSearch={setSearch} />
        <RegionFilters filter={filter} setFilter={setFilter} />
      </div>

      {error && <div className="regions-alert">{error}</div>}

      <div className="regions-content">
        <div className="regions-table-shell">
          <RegionTable
            regions={filteredRegions}
            loading={loading}
            onEdit={openEdit}
            onToggleStatus={handleToggleStatus}
            onAssign={openAssign}
            onView={openView}
          />
        </div>
      </div>

      <RegionFormModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={selectedRegion ? handleUpdateRegion : handleCreateRegion}
        region={selectedRegion}
      />

      <RegionDetailsModal
        isOpen={viewOpen}
        onClose={() => setViewOpen(false)}
        region={selectedRegion}
      />

      <AssignAdminModal
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        region={selectedRegion}
        onAssign={handleAssignAdmin}
      />
    </motion.div>
  );
}

export default RegionManagementPage;
