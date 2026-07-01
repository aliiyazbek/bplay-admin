import apiClient from "../../../shared/services/apiClient";

const REGION_BASE = "/admin/regions";
const CITY_PATH = "/admin/regions/cities";
const NEIGHBORHOOD_PATH = "/admin/regions/neighborhoods";

const normalizeRegion = (region) => {
  const isActive =
    typeof region?.is_active === "boolean"
      ? region.is_active
      : typeof region?.active === "boolean"
      ? region.active
      : region?.status
      ? region.status === "active"
      : true;

  const assignedAdmins = Array.isArray(region?.assigned_admins)
    ? region.assigned_admins
    : Array.isArray(region?.admins)
    ? region.admins
    : [];

  return {
    id: region?.id ?? region?._id ?? region?.region_id,
    name: region?.name || "",
    city: region?.city || region?.city_name || "",
    cityId: region?.city_id || region?.cityId || null,
    neighborhood: region?.neighborhood || region?.neighborhood_name || "",
    latitude:
      typeof region?.latitude === "number"
        ? region.latitude
        : typeof region?.lat === "number"
        ? region.lat
        : region?.latitude || 0,
    longitude:
      typeof region?.longitude === "number"
        ? region.longitude
        : typeof region?.lng === "number"
        ? region.lng
        : typeof region?.lon === "number"
        ? region.lon
        : region?.longitude || 0,
    radius: region?.radius ?? region?.radius_km ?? 0,
    isActive,
    status: isActive ? "active" : "inactive",
    assignedAdmins,
    createdAt: region?.created_at || region?.createdAt || "",
  };
};

const extractPayload = (response) => {
  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response)) {
    return response;
  }

  return [];
};

const extractItem = (response) => {
  if (response?.data?.data && !Array.isArray(response.data.data)) {
    return response.data.data;
  }

  if (response?.data && !Array.isArray(response.data)) {
    return response.data;
  }

  return response;
};

export const getCities = async (search = "") => {
  const response = await apiClient.get(`${CITY_PATH}?search=${encodeURIComponent(search)}`);
  return extractPayload(response).map((city) => ({
    id: city?.id ?? city?._id,
    name: city?.name || city?.city_name || "",
  }));
};

export const createCity = async (cityData) => {
  const response = await apiClient.post("/admin/regions/city", cityData);
  return extractItem(response);
};

export const getCityById = async (id) => {
  const response = await apiClient.get(`${CITY_PATH}/${id}`);
  return extractItem(response);
};

export const createNeighborhood = async (neighborhoodData) => {
  const response = await apiClient.post("/admin/regions/neighborhood", neighborhoodData);
  return extractItem(response);
};

export const getNeighborhoods = async (search = "", cityName = "") => {
  const query = new URLSearchParams();
  if (search) {
    query.set("search", search);
  }
  if (cityName) {
    query.set("cityName", cityName);
  }

  const response = await apiClient.get(`${NEIGHBORHOOD_PATH}?${query.toString()}`);
  return extractPayload(response).map((neighborhood) => ({
    id: neighborhood?.id ?? neighborhood?._id,
    name: neighborhood?.name || neighborhood?.neighborhood_name || "",
  }));
};
// Note: full region CRUD endpoints are not available in this API set.
// Keep only city/neighborhood related functions. Provide safe fallbacks
// for region CRUD functions so callers don't trigger 404s.

export const getRegions = async () => {
  // No endpoint to list regions in the provided API. Return an empty list.
  return [];
};

export const createRegion = async () => {
  throw new Error("Create region API is not available. Use city/neighborhood endpoints.");
};

export const updateRegion = async () => {
  throw new Error("Update region API is not available. Use city/neighborhood endpoints.");
};

export const toggleRegionStatus = async () => {
  throw new Error("Toggle region status API is not available.");
};

export const assignRegionToAdmin = async () => {
  throw new Error("Assign region to admin API is not available.");
};
