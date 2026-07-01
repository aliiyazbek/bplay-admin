import { create } from "zustand";
import {
  activateOwner as activateOwnerApi,
  approveOwner as approveOwnerApi,
  blockOwner as blockOwnerApi,
  createOwner as createOwnerApi,
  disableOwner as disableOwnerApi,
  getOwnerDetails as getOwnerDetailsApi,
  getOwners as getOwnersApi,
  rejectOwner as rejectOwnerApi,
  verifyDocument as verifyDocumentApi,
} from "../services/owner.service";

const useOwnerStore = create((set, get) => ({
  owners: [],
  selectedOwner: null,
  loading: false,
  error: "",
  fetchOwners: async (params = {}) => {
    set({ loading: true, error: "" });

    try {
      const data = await getOwnersApi(params);
      set({ owners: data });
      return data;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to load owners. Please try again." });
      return [];
    } finally {
      set({ loading: false });
    }
  },
  fetchOwnerDetails: async (ownerId) => {
    set({ loading: true, error: "" });

    try {
      const owner = await getOwnerDetailsApi(ownerId);
      set({ selectedOwner: owner });
      return owner;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to load owner details. Please try again." });
      return null;
    } finally {
      set({ loading: false });
    }
  },
  createOwner: async (ownerData) => {
    set({ loading: true, error: "" });

    try {
      await createOwnerApi(ownerData);
      await get().fetchOwners({ status: "pending", page: 1, limit: 10, sortBy: "created_at", order: "desc" });
      return true;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to create owner. Please try again." });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  verifyDocument: async (ownerId, documentId, status) => {
    set({ loading: true, error: "" });

    try {
      await verifyDocumentApi(documentId, { status });
      await get().fetchOwnerDetails(ownerId);
      return true;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update document status. Please try again." });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  updateOwnerStatus: async (ownerId, action) => {
    set({ loading: true, error: "" });

    try {
      switch (action) {
        case "approve":
          await approveOwnerApi(ownerId);
          break;
        case "reject":
          await rejectOwnerApi(ownerId);
          break;
        case "activate":
          await activateOwnerApi(ownerId);
          break;
        case "disable":
          await disableOwnerApi(ownerId);
          break;
        case "block":
          await blockOwnerApi(ownerId);
          break;
        default:
          break;
      }

      await get().fetchOwners({ status: "pending", page: 1, limit: 10, sortBy: "created_at", order: "desc" });
      return true;
    } catch (err) {
      set({ error: err?.response?.data?.message || "Failed to update owner status. Please try again." });
      return false;
    } finally {
      set({ loading: false });
    }
  },
  setSelectedOwner: (owner) => set({ selectedOwner: owner }),
  setError: (error) => set({ error }),
}));

export default useOwnerStore;
