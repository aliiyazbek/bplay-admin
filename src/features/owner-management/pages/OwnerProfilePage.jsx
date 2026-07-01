import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import OwnerDocuments from "../components/OwnerDocuments";
import useOwnerStore from "../store/ownerStore";
import "../styles/owner-management.css";

function OwnerProfilePage() {
  const { ownerId } = useParams();
  const navigate = useNavigate();
  const { selectedOwner, loading, error, fetchOwnerDetails, verifyDocument, setSelectedOwner } = useOwnerStore();

  useEffect(() => {
    if (ownerId) {
      fetchOwnerDetails(ownerId);
    }

    return () => {
      setSelectedOwner(null);
    };
  }, [fetchOwnerDetails, ownerId, setSelectedOwner]);

  const handleVerifyDocument = async (documentId, status) => {
    await verifyDocument(ownerId, documentId, status);
  };

  if (!selectedOwner && !loading) {
    return <div className="owners-alert">Owner profile not found.</div>;
  }

  return (
    <motion.div
      className="owners-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="owners-header">
        <div>
          <h1>Owner Profile</h1>
          <p>Review registration details, documents, and facility assignments.</p>
        </div>
        <button className="owners-cancel-btn" onClick={() => navigate(-1)}>
          Back
        </button>
      </div>

      {error && <div className="owners-alert">{error}</div>}

      {loading && <div className="owners-empty">Loading profile…</div>}

      {selectedOwner && (
        <>
          <div className="owners-profile-grid">
            <div className="owners-profile-card">
              <h4>Personal information</h4>
              <p><strong>Name:</strong> {selectedOwner.name}</p>
              <p><strong>Email:</strong> {selectedOwner.email}</p>
              <p><strong>Phone:</strong> {selectedOwner.phone}</p>
              <p><strong>Status:</strong> {selectedOwner.status}</p>
              <p><strong>Verification:</strong> {selectedOwner.verificationStatus}</p>
              <p><strong>Trust tier:</strong> {selectedOwner.trustTier}</p>
            </div>

            <div className="owners-profile-card">
              <h4>Region and facilities</h4>
              <p><strong>Region:</strong> {selectedOwner.region || "Not assigned"}</p>
              <p><strong>Facilities:</strong> {selectedOwner.facilities?.length || 0}</p>
              <p><strong>Documents:</strong> {selectedOwner.documents?.length || 0}</p>
            </div>
          </div>

          <div className="owners-profile-card">
            <h4>Verification documents</h4>
            <OwnerDocuments owner={selectedOwner} onVerifyDocument={handleVerifyDocument} />
          </div>
        </>
      )}
    </motion.div>
  );
}

export default OwnerProfilePage;
