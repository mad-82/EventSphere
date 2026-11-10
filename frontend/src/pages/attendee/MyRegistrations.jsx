import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ticket, MapPin, CalendarDays, RefreshCw, AlertCircle, X } from "lucide-react";
import registrationService from "../../services/registrationService";
import "./MyRegistrations.css";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

export default function MyRegistrations() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Naya State: Event Modal ke liye
  const [selectedExpo, setSelectedExpo] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const res = await registrationService.getMyRegistrations();
      setTickets(res.tickets || []);
    } catch (err) {
      setError(err.message || "Failed to load.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  if (loading) return <div className="myreg-page"><div className="myreg-loading"><RefreshCw className="att-spin" /> Loading...</div></div>;
  if (error) return <div className="myreg-page"><div className="myreg-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="myreg-page">
      <header className="myreg-header">
        <div>
          <h1>My Registrations</h1>
          <p>Events you've registered for.</p>
        </div>
        <button className="myreg-btn myreg-btn--primary" onClick={() => navigate("/events")}>
          <Ticket size={16} /> Browse Events
        </button>
      </header>

      {tickets.length === 0 ? (
        <div className="myreg-empty">
          <Ticket size={48} />
          <h3>No registrations yet</h3>
          <p>Browse upcoming expos and register to attend.</p>
          <button className="myreg-btn myreg-btn--primary" onClick={() => navigate("/events")}>
            Browse Events
          </button>
        </div>
      ) : (
        <div className="myreg-grid">
          {tickets.map((reg) => (
            <div key={reg._id} className="myreg-card">
              <div className="myreg-card__cover">
                {reg.expoId?.cover ? (
                  <img src={reg.expoId.cover} alt={reg.expoId.title} />
                ) : (
                  <CalendarDays size={32} />
                )}
              </div>
              <div className="myreg-card__body">
                <h3>{reg.expoId?.title || "Unknown Expo"}</h3>
                <p><MapPin size={13} /> {reg.expoId?.location || "TBD"}</p>
                <p><CalendarDays size={13} /> {fmtDate(reg.expoId?.startDate)} – {fmtDate(reg.expoId?.endDate)}</p>
                
                <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                  <span className="myreg-badge">{reg.ticketType || "Standard"}</span>
                  <span className={`myreg-badge ${reg.bookingStatus === 'Confirmed' ? '' : 'myreg-badge--pending'}`}>
                    {reg.bookingStatus || "Confirmed"}
                  </span>
                </div>

                <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                  Ticket ID: <strong>{reg.ticketId || "—"}</strong>
                </p>

                <div className="myreg-card__actions">
                  {/* ✅ Button ab Modal open karega */}
                  <button
                    className="myreg-btn myreg-btn--ghost"
                    onClick={() => setSelectedExpo(reg.expoId)}
                  >
                    View Event
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ✅ EVENT DETAILS MODAL */}
      {selectedExpo && (
        <div className="event-modal-backdrop" onClick={() => setSelectedExpo(null)}>
          <div className="event-modal-content" onClick={(e) => e.stopPropagation()}>
            
            <button className="event-modal-close" onClick={() => setSelectedExpo(null)}>
              <X size={20} />
            </button>

            <div className="event-modal-hero">
              {selectedExpo.cover ? (
                <img src={selectedExpo.cover} alt={selectedExpo.title} />
              ) : (
                <div className="event-modal-no-img"><CalendarDays size={40} /></div>
              )}
            </div>

            <div className="event-modal-body">
              <span className="event-modal-category">{selectedExpo.category || "Expo"}</span>
              <h2>{selectedExpo.title || "Unknown Expo"}</h2>
              
              <div className="event-modal-info-grid">
                <div className="event-modal-info-item">
                  <MapPin size={18} className="text-blue" />
                  <div>
                    <span>Location</span>
                    <strong>{selectedExpo.location || "TBD"}{selectedExpo.venue ? `, ${selectedExpo.venue}` : ""}</strong>
                  </div>
                </div>
                <div className="event-modal-info-item">
                  <CalendarDays size={18} className="text-blue" />
                  <div>
                    <span>Dates</span>
                    <strong>{fmtDate(selectedExpo.startDate)} – {fmtDate(selectedExpo.endDate)}</strong>
                  </div>
                </div>
              </div>

              <div className="event-modal-desc">
                <h4>About Event</h4>
                <p>{selectedExpo.description || "No description available for this event."}</p>
              </div>

              <div className="event-modal-actions">
                <button 
                  className="myreg-btn myreg-btn--primary" 
                  onClick={() => {
                    setSelectedExpo(null);
                    navigate(`/events/${selectedExpo._id || selectedExpo.id}`);
                  }}
                >
                  Go to Full Event Page
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}