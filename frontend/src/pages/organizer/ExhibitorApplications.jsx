import { useState, useEffect, useMemo } from "react";
import applicationService from "../../services/applicationService";
import "./ExhibitorApplications.css";

const STATUS_OPTIONS = ["All", "Pending", "Approved", "Rejected"];
const PAGE_SIZE = 5;

const STATUS_BADGE = {
  Approved: "org-badge org-badge--success",
  Pending:  "org-badge org-badge--warning",
  Rejected: "org-badge org-badge--danger",
};

export default function ExhibitorApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [detailId, setDetailId] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await applicationService.getAllApplications();
      setApplications(res.applications || []);
    } catch (err) {
      showToast("error", "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  const counts = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status?.toLowerCase() === "pending").length,
    approved: applications.filter((a) => a.status?.toLowerCase() === "approved").length,
    rejected: applications.filter((a) => a.status?.toLowerCase() === "rejected").length,
  }), [applications]);

  const filtered = useMemo(() => {
    let list = [...applications];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.exhibitor?.name || "").toLowerCase().includes(q) ||
          (a.expoId?.title || "").toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "All") {
      list = list.filter((a) => a.status?.toLowerCase() === statusFilter.toLowerCase());
    }
    return list;
  }, [applications, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const detail = detailId ? applications.find((a) => (a._id || a.id) === detailId) : null;

  const handleConfirm = async () => {
    if (!confirmAction) return;
    const { type, id } = confirmAction;
    
    try {
      const newStatus = type === "approve" ? "approved" : "rejected";
      await applicationService.updateStatus(id, newStatus);
      
      setApplications((list) =>
        list.map((a) => ((a._id || a.id) === id ? { ...a, status: newStatus } : a))
      );
      showToast(type === "approve" ? "success" : "error", `Application ${newStatus}.`);
    } catch (err) {
      showToast("error", "Failed to update status.");
    } finally {
      setConfirmAction(null);
    }
  };

  return (
    <div className="applications">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Exhibitor Applications</h1>
          <p className="org-page-header__subtitle">
            Review, approve, and reject exhibitor applications.
          </p>
        </div>
      </div>

      <div className="applications-stats">
        <div className="org-card applications-stat">
          <span className="applications-stat__label">Total</span>
          <span className="applications-stat__value">{counts.total}</span>
        </div>
        <div className="org-card applications-stat applications-stat--pending">
          <span className="applications-stat__label">Pending</span>
          <span className="applications-stat__value">{counts.pending}</span>
        </div>
        <div className="org-card applications-stat applications-stat--approved">
          <span className="applications-stat__label">Approved</span>
          <span className="applications-stat__value">{counts.approved}</span>
        </div>
        <div className="org-card applications-stat applications-stat--rejected">
          <span className="applications-stat__label">Rejected</span>
          <span className="applications-stat__value">{counts.rejected}</span>
        </div>
      </div>

      <div className="applications-filters org-card">
        <input
          type="search"
          className="org-input"
          placeholder="Search by company or expo…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="org-select"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="org-empty org-card">Loading applications...</div>
      ) : paged.length === 0 ? (
        <div className="org-empty org-card">
          <p className="org-empty__title">No applications found</p>
          <p className="org-empty__desc">When exhibitors apply, they will show up here.</p>
        </div>
      ) : (
        <div className="applications-table-wrap org-card">
          <table className="applications-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Expo</th>
                <th>Submitted</th>
                <th>Booth Req.</th>
                <th>Status</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a, index) => {
                const uniqueId = a._id || a.id || index; // ✅ SAFE KEY FIX
                const statusLower = a.status?.toLowerCase();
                const statusLabel = statusLower ? statusLower.charAt(0).toUpperCase() + statusLower.slice(1) : "Unknown";
                
                return (
                  <tr key={uniqueId}>
                    <td>
                      <div className="applications-company">
                        <span className="applications-company__name">{a.exhibitor?.name || "Unknown"}</span>
                        <span className="applications-company__email">{a.exhibitor?.email}</span>
                      </div>
                    </td>
                    <td>{a.expoId?.title || "Deleted Expo"}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>{a.boothSize || "—"}</td>
                    <td>
                      <span className={STATUS_BADGE[statusLabel] || "org-badge"}>
                        {statusLabel}
                      </span>
                    </td>
                    <td>
                      <div className="applications-actions">
                        <button
                          type="button"
                          className="org-btn org-btn--ghost org-btn--sm"
                          onClick={() => setDetailId(uniqueId)}
                        >
                          Review
                        </button>
                        {statusLower === "pending" && (
                          <>
                            <button
                              type="button"
                              className="org-btn org-btn--secondary org-btn--sm"
                              onClick={() => setConfirmAction({ type: "approve", id: uniqueId })}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="org-btn org-btn--danger org-btn--sm"
                              onClick={() => setConfirmAction({ type: "reject", id: uniqueId })}
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="applications-pagination">
          <span className="applications-pagination__info">
            Page {safePage} of {totalPages} · {filtered.length} total
          </span>
          <div className="applications-pagination__controls">
            <button className="org-btn org-btn--secondary org-btn--sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>← Prev</button>
            <button className="org-btn org-btn--secondary org-btn--sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>Next →</button>
          </div>
        </div>
      )}

      {detail && (
        <ApplicationDetail
          application={detail}
          onClose={() => setDetailId(null)}
          onApprove={() => setConfirmAction({ type: "approve", id: detail._id || detail.id })}
          onReject={() => setConfirmAction({ type: "reject", id: detail._id || detail.id })}
        />
      )}

      {confirmAction && (
        <div className="applications-modal-backdrop" onClick={() => setConfirmAction(null)}>
          <div className="applications-modal applications-modal--sm org-card" onClick={(ev) => ev.stopPropagation()}>
            <h2 className="applications-confirm__title">
              {confirmAction.type === "approve" ? "Approve application?" : "Reject application?"}
            </h2>
            <p className="applications-confirm__text">
              {confirmAction.type === "approve"
                ? "The exhibitor will be notified and become eligible for booth allocation."
                : "The exhibitor will be notified of the rejection."}
            </p>
            <footer className="applications-modal__actions">
              <button className="org-btn org-btn--secondary" onClick={() => setConfirmAction(null)}>Cancel</button>
              <button className={confirmAction.type === "approve" ? "org-btn org-btn--primary" : "org-btn org-btn--danger"} onClick={handleConfirm}>
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

function ApplicationDetail({ application, onClose, onApprove, onReject }) {
  const statusLower = application.status?.toLowerCase();
  const statusLabel = statusLower ? statusLower.charAt(0).toUpperCase() + statusLower.slice(1) : "Unknown";

  return (
    <div className="applications-modal-backdrop" onClick={onClose}>
      <div className="applications-modal applications-modal--lg org-card" onClick={(ev) => ev.stopPropagation()}>
        <header className="applications-modal__head">
          <div>
            <h2>{application.exhibitor?.name}</h2>
            <p className="applications-modal__sub">
              {application.expoId?.title} · Submitted {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button className="applications-modal__close" onClick={onClose}>×</button>
        </header>

        <div className="applications-modal__meta">
          <span className={STATUS_BADGE[statusLabel] || "org-badge"}>
            {statusLabel}
          </span>
          <span className="org-badge org-badge--info">Requested {application.boothSize || "—"}</span>
        </div>

        <section className="applications-modal__section">
          <h3>Applicant Details</h3>
          <div className="applications-kv">
            <div><span>Name</span><span>{application.exhibitor?.name}</span></div>
            <div><span>Email</span><a href={`mailto:${application.exhibitor?.email}`}>{application.exhibitor?.email}</a></div>
            <div><span>Phone</span><span>{application.exhibitor?.phone}</span></div>
          </div>
        </section>

        <section className="applications-modal__section">
          <h3>Application Details</h3>
          <div className="applications-kv">
            <div><span>Booth Type</span><span>{application.boothType || "—"}</span></div>
            <div><span>Booth Size</span><span>{application.boothSize || "—"}</span></div>
            <div><span>Staff Count</span><span>{application.staffCount || "—"}</span></div>
          </div>
        </section>

        <section className="applications-modal__section">
          <h3>Special Requirements / Notes</h3>
          <p className="applications-modal__text">{application.notes || "None."}</p>
        </section>

        <footer className="applications-modal__actions">
          <button className="org-btn org-btn--secondary" onClick={onClose}>Close</button>
          {statusLower === "pending" && (
            <>
              <button className="org-btn org-btn--danger" onClick={onReject}>Reject</button>
              <button className="org-btn org-btn--primary" onClick={onApprove}>Approve</button>
            </>
          )}
        </footer>
      </div>
    </div>
  );
}