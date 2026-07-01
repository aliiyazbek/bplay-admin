import apiClient from "../../../shared/services/apiClient";

const ADMIN_MANAGEMENT_PATH = "/admin/admin-management";

const normalizeStatus = (admin) => {
  const isActive =
    typeof admin?.is_active === "boolean"
      ? admin.is_active
      : typeof admin?.isActive === "boolean"
        ? admin.isActive
        : admin?.status
          ? admin.status !== "suspended"
          : true;

  // Robustly map possible name/email locations from backend
  const name = admin?.name || admin?.full_name || admin?.user?.name || admin?.user?.fullName || "";
  const email = admin?.email || admin?.email_address || admin?.user?.email || admin?.contact?.email || admin?.account?.email || "";
  const role = admin?.role || admin?.user?.role || "admin";

  return {
    id: admin?.id ?? admin?._id ?? admin?.admin_id,
    name,
    email,
    role,
    isActive,
    status: isActive ? "active" : "suspended",
  };
};

const extractList = (payload) => {
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data?.admins)) {
    return payload.data.admins;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

export const getAdmins = async () => {
  const response = await apiClient.get(ADMIN_MANAGEMENT_PATH);
  return extractList(response).map(normalizeStatus);
};

export const createAdmin = async (adminData) => {
  const payload = {
    name: adminData?.name || "",
    email: adminData?.email || "",
    role: adminData?.role || "admin",
    password: adminData?.password || "",
  };

  const response = await apiClient.post(ADMIN_MANAGEMENT_PATH, payload);
  return response.data;
};

export const updateAdmin = async (id, adminData) => {
  const response = await apiClient.patch(
    `${ADMIN_MANAGEMENT_PATH}/${id}`,
    adminData
  );
  return response.data;
};

export const toggleAdminActiveStatus = async (id, isActive) => {
  const response = await apiClient.post(
    `${ADMIN_MANAGEMENT_PATH}/is_active/${id}`,
    {
      is_active: isActive,
    }
  );
  return response.data;
};

export const deleteAdmin = async (id) => {
  const response = await apiClient.delete(`${ADMIN_MANAGEMENT_PATH}/${id}`);
  return response.data;
};