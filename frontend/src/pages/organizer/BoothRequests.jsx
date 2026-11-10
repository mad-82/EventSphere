import { useState, useEffect } from "react";
import boothService from "../../services/boothService";
import "./BoothRequests.css";

export default function BoothRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    try {
      const res = await boothService.getBoothRequests();
      setRequests(res.requests || []);
    } catch (err) {
      showToast("error", "Failed to load booth requests.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleConfirm() {
    if (!confirmAction) return;
    const { id, type } = confirmAction;
    
    try {
      await boothService.handleBoothRequest(id, type);
      showToast("success", `Booth request ${type}d successfully.`);
      setRequests((list) => list.filter((r) => (r._id || r.id) !== id));
    } catch (err) {
      showToast("error", "Action failed.");
    } finally {
      setConfirmAction(null);
    }
  }

  if (loading) return <div className="org-empty">Loading booth requests...</div>;

  return (
    <div className="applications">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Booth Requests</h1>
          <p className="org-page-header__subtitle">
            Review and approve booth reservations from exhibitors.
          </p>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="org-empty org-card">
          <p className="org-empty__title">No pending booth requests</p>
          <p className="org-empty__desc">When exhibitors reserve a booth, it will show up here.</p>
        </div>
      ) : (
        <div className="applications-table-wrap org-card">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Expo</th>
                <th>Booth Details</th>
                <th>Price</th>
                <th>Requested On</th>
                <th style={{ width: 200 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r, index) => {
                const id = r._id || r.id || index;
                return (
                  <tr key={id}>
                    <td>
                      <div className="applications-company">
                        <span className="applications-company__name">
                          {r.reservedBy?.companyName || r.reservedBy?.name || "Unknown"}
                        </span>
                        <span className="applications-company__email">
                          {r.reservedBy?.email}
                        </span>
                      </div>
                    </td>
                    <td>{r.expoId?.title || "Deleted Expo"}</td>
                    <td>
                      <strong>{r.boothNumber}</strong> <br/>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>{r.size} · {r.hall}</span>
                    </td>
                    <td>PKR {r.price?.toLocaleString()}</td>
                    <td>{new Date(r.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <div className="applications-actions">
                        <button 
                          className="org-btn org-btn--primary org-btn--sm" 
                          onClick={() => setConfirmAction({ id, type: "approve" })}
                        >
                          Approve
                        </button>
                        <button 
                          className="org-btn org-btn--danger org-btn--sm" 
                          onClick={() => setConfirmAction({ id, type: "reject" })}
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="applications-modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="applications-modal applications-modal--sm org-card" onClick={(ev) => ev.stopPropagation()}>
            <h2 className="applications-confirm__title">
              {confirmAction.type === "approve" ? "Approve booth request?" : "Reject booth request?"}
            </h2>
            <p className="applications-confirm__text">
              {confirmAction.type === "approve"
                ? "The booth will be officially booked for this exhibitor."
                : "The booth will become available for others to request."}
            </p>
            <footer className="applications-modal__actions">
              <button className="org-btn org-btn--secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button 
                className={confirmAction.type === "approve" ? "org-btn org-btn--primary" : "org-btn org-btn--danger"} 
                onClick={handleConfirm}
              >
                Yes, {confirmAction.type}
              </button>
            </footer>
          </div>
        </div>
      )}

      {toast && <div className={`expo-toast expo-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}