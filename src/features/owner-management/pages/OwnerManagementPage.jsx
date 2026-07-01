import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import OwnerSearch from "../components/OwnerSearch";
import OwnerFilters from "../components/OwnerFilters";
import OwnerTable from "../components/OwnerTable";
import OwnerProfileModal from "../components/OwnerProfileModal";
import CreateOwnerModal from "../components/CreateOwnerModal";
import ApproveOwnerModal from "../components/ApproveOwnerModal";
import BlockOwnerModal from "../components/BlockOwnerModal";
import useOwnerStore from "../store/ownerStore";
import { getStoredRole } from "../../auth/utils/auth.storage";
import "../styles/owner-management.css";

function OwnerManagementPage() {
  const {
    owners,
    loading,
    error,
    fetchOwners,
    fetchOwnerDetails,
    createOwner,
    updateOwnerStatus,
    selectedOwner,
    setSelectedOwner,
  } = useOwnerStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [activeFilter, setActiveFilter] = useState("all");
  const [trustTier, setTrustTier] = useState("all");
  const [region, setRegion] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState("approve");
  const [activeOwner, setActiveOwner] = useState(null);
  const navigate = useNavigate();
  const role = getStoredRole();
  const isSuperAdmin = role === "super_admin";

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) {
        return;
      }

      await fetchOwners({ status: "pending", page: 1, limit: 10, sortBy: "created_at", order: "desc" });
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [fetchOwners]);

  const filteredOwners = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return owners.filter((owner) => {
      const matchesSearch =
        searchTerm.length === 0 ||
        (owner.name || "").toLowerCase().includes(searchTerm) ||
        (owner.email || "").toLowerCase().includes(searchTerm) ||
        (owner.phone || "").toLowerCase().includes(searchTerm);

      const matchesStatus =
        status === "all" || owner.status === status || owner.verificationStatus === status;

      const matchesActive =
        activeFilter === "all" || (activeFilter === "active" ? owner.isActive : !owner.isActive);

      const matchesTrustTier = trustTier === "all" || owner.trustTier === trustTier;
      const matchesRegion = region.trim().length === 0 || (owner.region || "").toLowerCase().includes(region.trim().toLowerCase());

      return matchesSearch && matchesStatus && matchesActive && matchesTrustTier && matchesRegion;
    });
  }, [activeFilter, owners, region, search, status, trustTier]);

  const openProfile = async (owner) => {
    setSelectedOwner(owner);
    setActiveOwner(owner);
    await fetchOwnerDetails(owner.id);
    setProfileOpen(true);
  };

  const openProfilePage = (owner) => {
    navigate(`/app/owner-management/${owner.id}`);
  };

  const openApproveModal = (owner, action = "approve") => {
    setPendingAction(action);
    setActiveOwner(owner);
    setApproveOpen(true);
  };

  const openBlockModal = (owner) => {
    setActiveOwner(owner);
    setBlockOpen(true);
  };

  const handleCreateOwner = async (data) => {
    const success = await createOwner(data);
    if (success) {
      setCreateOpen(false);
    }
    return success;
  };

  const handleApproveReject = async (owner) => {
    const success = await updateOwnerStatus(owner.id, pendingAction);
    if (success) {
      setApproveOpen(false);
    }
    return success;
  };

  const handleToggleStatus = async (owner, action) => {
    if (action === "block") {
      setActiveOwner(owner);
      setBlockOpen(true);
      return;
    }

    await updateOwnerStatus(owner.id, action);
  };

  const handleBlockConfirm = async (owner) => {
    const success = await updateOwnerStatus(owner.id, "block");
    if (success) {
      setBlockOpen(false);
    }
    return success;
  };

  return (
    <motion.div
      className="owners-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="owners-header">
        <div>
          <h1>Owner Management</h1>
          <p>Review owner requests, manage verification, and maintain owner access.</p>
        </div>

        <button className="owners-create-btn" onClick={() => setCreateOpen(true)}>
          + Create Owner
        </button>
      </div>

      <div className="owners-top">
        <OwnerSearch search={search} setSearch={setSearch} />
        <OwnerFilters
          status={status}
          setStatus={setStatus}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          trustTier={trustTier}
          setTrustTier={setTrustTier}
          region={region}
          setRegion={setRegion}
        />
      </div>

      {error && <div className="owners-alert">{error}</div>}

      <div className="owners-content">
        <div className="owners-table-shell">
          <OwnerTable
            owners={filteredOwners}
            loading={loading}
            onView={openProfile}
            onOpenProfilePage={openProfilePage}
            onApprove={(owner) => openApproveModal(owner, "approve")}
            onReject={(owner) => openApproveModal(owner, "reject")}
            onToggleStatus={handleToggleStatus}
            isSuperAdmin={isSuperAdmin}
          />
        </div>
      </div>

      <OwnerProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
        owner={selectedOwner}
      />

      <CreateOwnerModal
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateOwner}
      />

      <ApproveOwnerModal
        isOpen={approveOpen}
        onClose={() => setApproveOpen(false)}
        owner={activeOwner}
        onConfirm={handleApproveReject}
        action={pendingAction}
      />

      <BlockOwnerModal
        isOpen={blockOpen}
        onClose={() => setBlockOpen(false)}
        owner={activeOwner}
        onConfirm={handleBlockConfirm}
      />
    </motion.div>
  );
}

export default OwnerManagementPage;
