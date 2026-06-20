import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

import AdminSearch from "../components/AdminSearch";
import AdminFilters from "../components/AdminFilters";
import AdminTable from "../components/AdminTable";

import InviteAdminModal from "../components/InviteAdminModal";
import EditAdminModal from "../components/EditAdminModal";
import SuspendAdminModal from "../components/SuspendAdminModal";
import DeleteAdminModal from "../components/DeleteAdminModal";

import {
  createAdmin,
  deleteAdmin,
  getAdmins,
  toggleAdminActiveStatus,
  updateAdmin,
} from "../services/admin.service";

import "../styles/admin-management.css";

function AdminManagementPage() {
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [inviteOpen, setInviteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadAdmins = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAdmins();
      setAdmins(data);
    } catch {
      setError("Failed to load admins. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!isMounted) {
        return;
      }

      await loadAdmins();
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredAdmins = useMemo(() => {
    return admins.filter((admin) => {
      const searchTerm = search.trim().toLowerCase();
      const matchesSearch =
        searchTerm.length === 0 ||
        admin.name.toLowerCase().includes(searchTerm) ||
        admin.email.toLowerCase().includes(searchTerm);

      const matchesFilter =
        filter === "all" ? true : admin.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [admins, search, filter]);

  const openEditModal = (admin) => {
    setSelectedAdmin(admin);
    setEditOpen(true);
  };

  const openSuspendModal = (admin) => {
    setSelectedAdmin(admin);
    setSuspendOpen(true);
  };

  const openDeleteModal = (admin) => {
    setSelectedAdmin(admin);
    setDeleteOpen(true);
  };

  const handleInviteAdmin = async (data) => {
    await createAdmin(data);
    await loadAdmins();
  };

  const handleEditAdmin = async (data) => {
    if (!selectedAdmin) {
      return;
    }

    await updateAdmin(selectedAdmin.id, data);
    await loadAdmins();
  };

  const handleSuspendAdmin = async () => {
    if (!selectedAdmin) {
      return;
    }

    await toggleAdminActiveStatus(selectedAdmin.id, !selectedAdmin.isActive);
    await loadAdmins();
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) {
      return;
    }

    await deleteAdmin(selectedAdmin.id);
    await loadAdmins();
  };

  return (
    <motion.div
      className="admins-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >

      <div className="admins-header">
        <div>
          <h1>Admin Management</h1>
          <p>Clean admin CRUD with real API integration</p>
        </div>

        <button
          className="invite-btn"
          onClick={() => {
            setSelectedAdmin(null);
            setInviteOpen(true);
          }}
        >
          + Invite Admin
        </button>
      </div>

      <div className="admins-top">
        <AdminSearch search={search} setSearch={setSearch} />

        <AdminFilters filter={filter} setFilter={setFilter} />
      </div>

      {error && <div className="admins-alert">{error}</div>}

      <div className="admins-content">
        <div className="admins-table-shell">
          <AdminTable
            admins={filteredAdmins}
            loading={loading}
            onEdit={openEditModal}
            onSuspend={openSuspendModal}
            onDelete={openDeleteModal}
          />
        </div>
      </div>

      <InviteAdminModal
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={handleInviteAdmin}
      />

      <EditAdminModal
        isOpen={editOpen}
        admin={selectedAdmin}
        onClose={() => setEditOpen(false)}
        onSave={handleEditAdmin}
      />

      <SuspendAdminModal
        isOpen={suspendOpen}
        admin={selectedAdmin}
        onClose={() => setSuspendOpen(false)}
        onConfirm={handleSuspendAdmin}
      />

      <DeleteAdminModal
        isOpen={deleteOpen}
        admin={selectedAdmin}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDeleteAdmin}
      />

    </motion.div>
  );
}

export default AdminManagementPage;