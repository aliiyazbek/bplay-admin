import apiClient from "../../../shared/services/apiClient";

const OWNER_BASE = "/admin/owners-management";
const OWNERS_PATH = `${OWNER_BASE}/owners`;
const PENDING_PATH = `${OWNER_BASE}/pending-verification`;

const normalizeOwner = (owner) => {
  const isActive =
    typeof owner?.is_active === "boolean"
      ? owner.is_active
      : typeof owner?.isActive === "boolean"
        ? owner.isActive
        : owner?.status === "active" || owner?.verification_status === "approved";

  const verificationStatus =
    owner?.verification_status ||
    owner?.verificationStatus ||
    owner?.document_status ||
    owner?.status ||
    "pending";

  const trustTier = owner?.trust_tier || owner?.trustTier || "basic";
  const status = owner?.status || verificationStatus || "pending";
  const name =
    owner?.name ||
    owner?.full_name ||
    owner?.owner_name ||
    owner?.user?.name ||
    owner?.user?.fullName ||
    "";
  const email = owner?.email || owner?.email_address || owner?.user?.email || "";
  const phone = owner?.phone || owner?.phone_number || owner?.mobile || owner?.user?.phone || "";
  const region = owner?.region || owner?.region_name || owner?.assigned_region || "";
  const documents = Array.isArray(owner?.documents)
    ? owner.documents.map((document) => ({
        id: document?.id ?? document?._id ?? document?.document_id,
        name: document?.name || document?.document_name || "Document",
        status: document?.status || document?.verification_status || "pending",
        url: document?.url || document?.file_url || "",
      }))
    : [];
  const facilities = Array.isArray(owner?.facilities)
    ? owner.facilities
    : Array.isArray(owner?.owner_facilities)
      ? owner.owner_facilities
      : [];

  return {
    id: owner?.id ?? owner?._id ?? owner?.owner_id ?? owner?.ownerId,
    name,
    email,
    phone,
    status: status.toLowerCase(),
    verificationStatus: verificationStatus.toLowerCase(),
    trustTier: trustTier.toLowerCase(),
    isActive,
    region,
    documents,
    facilities,
    createdAt: owner?.created_at || owner?.createdAt || "",
    identityInfo: owner?.identity_info || owner?.identityInfo || owner?.identity || "",
    profile: owner?.profile || owner?.owner_profile || null,
    raw: owner,
  };
};

const extractList = (payload) => {
  if (Array.isArray(payload?.data?.data)) {
    return payload.data.data;
  }

  if (Array.isArray(payload?.data?.owners)) {
    return payload.data.owners;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  return [];
};

const extractItem = (payload) => {
  if (payload?.data?.data && !Array.isArray(payload.data.data)) {
    return payload.data.data;
  }

  if (payload?.data && !Array.isArray(payload.data)) {
    return payload.data;
  }

  return payload;
};

export const getOwners = async (params = {}) => {
  const query = new URLSearchParams();

  if (params.status) {
    query.set("status", params.status);
  }

  if (typeof params.isActive === "boolean") {
    query.set("is_active", String(params.isActive));
  }

  if (params.trustTier) {
    query.set("trust_tier", params.trustTier);
  }

  if (params.page) {
    query.set("page", String(params.page));
  }

  if (params.limit) {
    query.set("limit", String(params.limit));
  }

  if (params.sortBy) {
    query.set("sortBy", params.sortBy);
  }

  if (params.order) {
    query.set("order", params.order);
  }

  const response = await apiClient.get(`${OWNERS_PATH}${query.toString() ? `?${query.toString()}` : ""}`);
  return extractList(response).map(normalizeOwner);
};

export const getOwnerDetails = async (ownerId) => {
  const response = await apiClient.get(`${PENDING_PATH}/${ownerId}`);
  return normalizeOwner(extractItem(response));
};

export const approveOwner = async (ownerId, payload = {}) => {
  const response = await apiClient.patch(`${PENDING_PATH}/${ownerId}`, {
    action: "approve",
    ...payload,
  });
  return response.data;
};

export const rejectOwner = async (ownerId, payload = {}) => {
  const response = await apiClient.patch(`${PENDING_PATH}/${ownerId}`, {
    action: "reject",
    ...payload,
  });
  return response.data;
};

export const verifyDocument = async (documentId, payload = {}) => {
  const response = await apiClient.patch(`${PENDING_PATH}/documents/${documentId}`, payload);
  return response.data;
};

export const createOwner = async (ownerData) => {
  const payload = {
    name: ownerData?.name || "",
    email: ownerData?.email || "",
    phone: ownerData?.phone || "",
    password: ownerData?.password || "",
  };

  const response = await apiClient.post(`${OWNER_BASE}/create`, payload);
  return response.data;
};

export const activateOwner = async (ownerId) => {
  const response = await apiClient.patch(`${PENDING_PATH}/${ownerId}`, {
    action: "activate",
  });
  return response.data;
};

export const disableOwner = async (ownerId) => {
  const response = await apiClient.patch(`${PENDING_PATH}/${ownerId}`, {
    action: "disable",
  });
  return response.data;
};

export const blockOwner = async (ownerId) => {
  const response = await apiClient.patch(`${PENDING_PATH}/${ownerId}`, {
    action: "block",
  });
  return response.data;
};
