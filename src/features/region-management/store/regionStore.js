import { create } from "zustand";
import {
  getRegions,
  createRegion as createRegionApi,
  updateRegion as updateRegionApi,
  toggleRegionStatus as toggleRegionStatusApi,
  assignRegionToAdmin,
} from "../services/region.service";

const useRegionStore = create((set, get) => ({
  regions: [],
  selectedRegion: null,
  loading: false,
  error: "",
  fetchRegions: async () => {
    set({ loading: true, error: "" });

    try {
      // Regions listing endpoint is not available in the API set.
      // Return empty list to avoid 404 errors.
      set({ regions: [] });
    } catch (err) {
      set({ error: "Failed to load regions. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  createRegion: async (regionData) => {
    set({ loading: true, error: "" });

    try {
      // Creation of regions via API is not supported in current backend.
      throw new Error("Create region API not available.");
    } catch (err) {
      set({ error: "Failed to create region. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  updateRegion: async (id, regionData) => {
    set({ loading: true, error: "" });

    try {
      throw new Error("Update region API not available.");
    } catch (err) {
      set({ error: "Failed to update region. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  toggleStatus: async (id, isActive) => {
    set({ loading: true, error: "" });

    try {
      throw new Error("Toggle region status API not available.");
    } catch (err) {
      set({ error: "Failed to update region status. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  assignAdmin: async (regionId, adminIds) => {
    set({ loading: true, error: "" });

    try {
      throw new Error("Assign region API not available.");
    } catch (err) {
      set({ error: "Failed to assign admins. Please try again." });
    } finally {
      set({ loading: false });
    }
  },
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setError: (error) => set({ error }),
}));

export default useRegionStore;
