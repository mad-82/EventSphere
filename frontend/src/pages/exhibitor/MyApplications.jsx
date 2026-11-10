import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  MapPin,
  CalendarDays,
  Trash2,
} from "lucide-react";
import applicationService from "../../services/applicationService";
import "./MyApplications.css";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function MyApplications() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    loadApplications();
  }, []);

  async function loadApplications() {
    setLoading(true);
    try {
      const res = await applicationService.getMyApplications();
      setApplications(res.applications || []);
    } catch (err) {
      setError(err?.message || "Failed to load applications.");
    } finally {
      setLoading(false);
    }
  }

  // ✅ Withdraw Application
  const handleWithdraw = async (id) => {
    if (!window.confirm("Are you sure you want to withdraw this application?")) return;
    try {
      await applicationService.withdraw(id);
      setApplications(applications.filter((a) => (a._id || a.id) !== id));
      setSelectedApp(null);
    } catch (err) {
      alert("Failed to withdraw application.");
    }
  };

  if (loading) return <div className="exb-apps"><div className="exb-apps__loading"><RefreshCw className="exb-spin" /> Loading applications...</div></div>;
  if (error) return <div className="exb-apps"><div className="exb-apps__error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="exb-apps">
      <header className="exb-apps__header">
        <div>
          <h1 className="exb-apps__title">My Applications</h1>
          <p className="exb-apps__subtitle">Track the status of your expo participation applications.</p>
        </div>
        <button className="exb-btn exb-btn--primary" onClick={() => navigate("/exhibitor/browse-expos")}>
          Browse Expos <ArrowRight size={16} />
        </button>
      </header>

      {applications.length === 0 ? (
        <div className="exb-apps__empty">
          <FileText size={48} />
          <h3>No applications yet</h3>
          <p>You haven't applied to any expos. Browse available expos to get started.</p>
          <button className="exb-btn exb-btn--primary" onClick={() => navigate("/exhibitor/browse-expos")}>Browse Expos</button>
        </div>
      ) : (
        <div className="exb-apps__grid">
          {applications.map((app, index) => {
            // ✅ SAFE KEY: Agar _id nahi hai to id, warna index use karo
            const uniqueId = app._id || app.id || index; 
            
            return (
              <div key={uniqueId} className="exb-apps__card">
                <div className="exb-apps__card-header">
                  <h3>{app.expoId?.title || "Unknown Expo"}</h3>
                  <span className={`exb-badge exb-badge--${app.status}`}>
                    {app.status === "approved" && <CheckCircle2 size={14} />}
                    {app.status === "pending" && <Clock size={14} />}
                    {app.status === "rejected" && <XCircle size={14} />}
                    {app.status}
                  </span>
                </div>

                <div className="exb-apps__card-info">
                  <div><MapPin size={14} /> <span>{app.expoId?.location || "TBD"}</span></div>
                  <div><CalendarDays size={14} /> <span>{fmtDate(app.expoId?.startDate)} - {fmtDate(app.expoId?.endDate)}</span></div>
                  <div><Clock size={14} /> <span>Applied on {fmtDate(app.createdAt)}</span></div>
                </div>

                <div className="exb-apps__card-actions">
                  <button className="exb-btn exb-btn--ghost" onClick={() => setSelectedApp(app)}>View Details</button>
                  {app.status === "pending" && (
                    <button className="exb-btn exb-btn--danger-ghost" onClick={() => handleWithdraw(uniqueId)}>
                      <Trash2 size={14} /> Withdraw
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Details */}
      {selectedApp && (
        <div className="exb-modal-backdrop" onClick={() => setSelectedApp(null)}>
          <div className="exb-modal" onClick={(e) => e.stopPropagation()}>
            <header className="exb-modal__head">
              <h2>{selectedApp.expoId?.title}</h2>
              <button onClick={() => setSelectedApp(null)} className="exb-modal__close">×</button>
            </header>
            
            <div className="exb-modal__body">
              <div className="exb-modal__status">
                <span className={`exb-badge exb-badge--${selectedApp.status}`}>
                  {selectedApp.status?.toUpperCase()}
                </span>
                {/* ✅ SAFE SLICE: _id undefined ho to crash na ho */}
                <span className="exb-apps__id">
                  ID: {(selectedApp._id || selectedApp.id || "APP-XXXX").slice(-6)}
                </span>
              </div>

              <div className="exb-modal__section">
                <h3>Application Details</h3>
                <div className="exb-kv">
                  <div><span>Booth Type</span><span>{selectedApp.boothType || "—"}</span></div>
                  <div><span>Booth Size</span><span>{selectedApp.boothSize || "—"}</span></div>
                  <div><span>Staff Count</span><span>{selectedApp.staffCount || "—"}</span></div>
                </div>
              </div>

              <div className="exb-modal__section">
                <h3>Notes / Requirements</h3>
                <p>{selectedApp.notes || "No special requirements mentioned."}</p>
              </div>

              {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                <div className="exb-modal__alert">
                  <strong>Reason for Rejection:</strong> {selectedApp.rejectionReason}
                </div>
              )}
            </div>

            <footer className="exb-modal__foot">
              <button className="exb-btn exb-btn--ghost" onClick={() => setSelectedApp(null)}>Close</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}