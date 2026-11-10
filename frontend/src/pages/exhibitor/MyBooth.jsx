import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, CheckCircle2, AlertCircle, RefreshCw, LayoutDashboard, ArrowRight, Package, CalendarDays } from "lucide-react";
import boothService from "../../services/boothService";
import "./MyBooth.css";

export default function MyBooth() {
  const navigate = useNavigate();
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadMyBooths() {
      try {
        const res = await boothService.getMyBooth();
        
        // 🔥 FIX: Backend se "booth" (singular object) aa raha hai, usko array mein wrap karo
        if (res.booth) {
          setBooths([res.booth]); 
        } else {
          setBooths([]);
        }

      } catch (err) {
        // 🔥 FIX: Agar user ne booth book nahi kiya (404), toh usko error na dikhao
        if (err?.response?.status === 404) {
          setBooths([]);
        } else {
          setError(err?.response?.data?.message || err?.message || "Failed to load booth details.");
        }
      } finally {
        setLoading(false);
      }
    }
    loadMyBooths();
  }, []);

  if (loading) {
    return (
      <div className="my-booth-page">
        <div className="booth-loading">
          <RefreshCw className="exb-spin" /> Loading your booth details...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-booth-page">
        <div className="booth-error">
          <AlertCircle size={32} /> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="my-booth-page">
      <header className="my-booth-header">
        <div>
          <h1>My Booth</h1>
          <p>Your official booth allocation details for approved expos.</p>
        </div>
      </header>

      {booths.length === 0 ? (
        <div className="booth-empty">
          <LayoutDashboard size={48} />
          <h3>No Booth Allocated Yet</h3>
          <p>You haven't been assigned a booth yet. If your application is approved, the organizer will allocate a booth to you.</p>
          <button className="btn-primary" onClick={() => navigate("/exhibitor/booth-selection")}>
            Go to Booth Selection <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="booth-list">
          {booths.map((booth) => (
            <div key={booth._id || booth.id} className="booth-ticket">
              
              {/* Ticket Header */}
              <div className="booth-ticket__header">
                <div className="booth-ticket__title">
                  <span className="booth-ticket__label">Official Allocation</span>
                  <h2>{booth.expoId?.title || "Unknown Expo"}</h2>
                </div>
                <div className="booth-ticket__badge">
                  <CheckCircle2 size={16} /> Confirmed
                </div>
              </div>

              {/* Ticket Body */}
              <div className="booth-ticket__body">
                
                {/* Big Booth Number */}
                <div className="booth-ticket__number-block">
                  <span>Booth Number</span>
                  <h1>{booth.boothNumber}</h1>
                  <div className="booth-ticket__status">
                    Status: {booth.status}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="booth-ticket__details">
                  <div className="detail-item">
                    <span className="detail-label">Venue</span>
                    <span className="detail-value"><MapPin size={14} /> {booth.expoId?.venue || "TBD"}, {booth.expoId?.location || "TBD"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Event Dates</span>
                    <span className="detail-value"><CalendarDays size={14} /> {new Date(booth.expoId?.startDate).toLocaleDateString()} - {new Date(booth.expoId?.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value"><LayoutDashboard size={14} /> {booth.hall} · {booth.floor}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booth Size</span>
                    <span className="detail-value">{booth.size}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Booth Type</span>
                    <span className="detail-value">{booth.type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Total Area</span>
                    <span className="detail-value">{booth.totalArea || "—"}</span>
                  </div>
                </div>

                {/* Facilities */}
                {booth.facilities && booth.facilities.length > 0 && (
                  <div className="booth-ticket__facilities">
                    <h4><Package size={16} /> Included Facilities</h4>
                    <div className="facility-chips">
                      {booth.facilities.map((facility, index) => (
                        <span key={index} className="facility-chip">{facility}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instructions */}
                <div className="booth-ticket__instructions">
                  <h4>Important Instructions</h4>
                  <ul>
                    <li>Please bring your own display stands and branding materials.</li>
                    <li>Power (220V) will be provided at the booth. Bring your own extension cords.</li>
                    <li>Check-in at the main reception before setup. Setup time: 08:00 AM - 02:00 PM a day prior.</li>
                  </ul>
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="booth-ticket__footer">
                <span>Allocated on: {new Date(booth.updatedAt || booth.createdAt).toLocaleDateString()}</span>
                <span>Ref ID: {(booth._id || booth.id).slice(-6).toUpperCase()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}