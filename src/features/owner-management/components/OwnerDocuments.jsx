function OwnerDocuments({ owner, onVerifyDocument }) {
  if (!owner?.documents?.length) {
    return <p className="owners-empty">No verification documents uploaded.</p>;
  }

  return (
    <div className="owners-documents-list">
      {owner.documents.map((document) => (
        <div className="owners-document-item" key={document.id}>
          <div>
            <strong>{document.name}</strong>
            <p>{document.status}</p>
          </div>
          <div className="owners-document-actions">
            {document.url && (
              <a className="owners-link-btn" href={document.url} target="_blank" rel="noreferrer">
                Preview
              </a>
            )}
            <button className="owners-action-btn" onClick={() => onVerifyDocument(document.id, "approved")}>
              Approve
            </button>
            <button className="owners-action-btn owners-action-reject" onClick={() => onVerifyDocument(document.id, "rejected")}>
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default OwnerDocuments;
