import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  AlertCircle,
  RefreshCw,
  LayoutDashboard,
  ArrowRight,
  Maximize,
  Info,
} from "lucide-react";
import applicationService from "../../services/applicationService";
import boothService from "../../services/boothService";
import "./BoothSelection.css";

export default function BoothSelection() {
  const navigate = useNavigate();
  
  const [approvedApps, setApprovedApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [booths, setBooths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBooths, setLoadingBooths] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // 1. Approved Applications
  useEffect(() => {
    async function loadApprovedApps() {
      try {
        const res = await applicationService.getMyApplications();
        const approved = (res.applications || []).filter((a) => a.status === "approved");
        setApprovedApps(approved);
        if (approved.length > 0) setSelectedApp(approved[0]);
      } catch (err) {
        setError("Failed to load applications.");
      } finally {
        setLoading(false);
      }
    }
    loadApprovedApps();
  }, []);

  // 2. Load Booths
  useEffect(() => {
    if (!selectedApp) return;

    async function loadBooths() {
      setLoadingBooths(true);
      try {
        const expoId = selectedApp.expoId?._id || selectedApp.expoId;
        const res = await boothService.list({ expoId });
        setBooths(res.booths || []);
      } catch (err) {
        showToast("error", "Failed to load booths.");
      } finally {
        setLoadingBooths(false);
      }
    }
    loadBooths();
  }, [selectedApp]);

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  // 3. Request Booth
  const handleRequestBooth = async (boothId, boothNumber) => {
    if (!window.confirm(`Are you sure you want to request Booth ${boothNumber}?`)) return;
    
    try {
      await boothService.reserve(boothId);
      showToast("success", `Booth ${boothNumber} requested! Awaiting admin approval.`);
      
      setBooths((list) =>
        list.map((b) => ((b._id || b.id) === boothId ? { ...b, status: "Reserved" } : b))
      );
    } catch (err) {
      showToast("error", err.message || "Failed to request booth.");
    }
  };

  if (loading) return <div className="booth-page"><div className="booth-page__loading"><RefreshCw className="exb-spin" /> Loading...</div></div>;

  return (
    <div className="booth-page">
      {/* Top Banner (Expo Info) */}
      {selectedApp && (
        <div className="booth-banner">
          <div className="booth-banner__content">
            <h1>{selectedApp.expoId?.title}</h1>
            <div className="booth-banner__meta">
              <span><MapPin size={16} /> {selectedApp.expoId?.location}</span>
              <span><Info size={16} /> {selectedApp.expoId?.venue}</span>
            </div>
          </div>
          <div className="booth-banner__badge">
            Application Approved
          </div>
        </div>
      )}

      {approvedApps.length === 0 ? (
        <div className="booth-page__empty">
          <AlertCircle size={48} />
          <h3>No Approved Applications</h3>
          <p>You can only select a booth after the organizer approves your application.</p>
          <button className="booth-btn booth-btn--primary" onClick={() => navigate("/exhibitor/my-applications")}>
            View My Applications <ArrowRight size={16} />
          </button>
        </div>
      ) : (
        <div className="booth-content">
          
          {/* INTERACTIVE FLOOR MAP (DARK MODE) */}
          <div className="floor-map-container">
            <div className="floor-map__header">
              <h3><LayoutDashboard size={18} /> Interactive Floor Plan</h3>
              <span className="floor-map__legend-hint"><Maximize size={14} /> Click a booth to request</span>
            </div>
            
            {loadingBooths ? (
              <div className="booth-page__loading"><RefreshCw className="exb-spin" /> Loading map...</div>
            ) : booths.length === 0 ? (
              <div className="booth-page__empty">
                <LayoutDashboard size={48} />
                <h3>No booths available yet</h3>
                <p>The organizer hasn't added any booths for this expo.</p>
              </div>
            ) : (
              <div className="floor-map-wrapper">
                <div className="floor-map-dark">
                  <div className="floor-map__entrance floor-map__entrance--top">Main Entrance</div>
                  
                  <div className="floor-map__grid">
                    {booths.map((b) => {
                      const boothId = b._id || b.id;
                      const isAvailable = b.status === "Available";
                      const isReserved = b.status === "Reserved";
                      const isOccupied = b.status === "Occupied" || b.status === "Booked";

                      return (
                        <button
                          key={boothId}
                          className={`floor-booth-dark ${isAvailable ? "is-available" : ""} ${isReserved ? "is-reserved" : ""} ${isOccupied ? "is-occupied" : ""}`}
                          onClick={() => isAvailable && handleRequestBooth(boothId, b.boothNumber)}
                          disabled={!isAvailable}
                        >
                          <span className="floor-booth-dark__number">{b.boothNumber}</span>
                          <span className="floor-booth-dark__size">{b.size}</span>
                          {isAvailable && <span className="floor-booth-dark__action">Select</span>}
                        </button>
                      );
                    })}
                  </div>

                  <div className="floor-map__entrance floor-map__entrance--bottom">Exit</div>
                </div>
                
                {/* Legend */}
                <div className="floor-map__legend-dark">
                  <div className="legend-item"><span className="legend-color legend-color--available" /> Available</div>
                  <div className="legend-item"><span className="legend-color legend-color--reserved" /> Reserved</div>
                  <div className="legend-item"><span className="legend-color legend-color--occupied" /> Occupied</div>
                </div>
              </div>
            )}
          </div>

          {/* BOOTH LIST (Cards) */}
          {!loadingBooths && booths.length > 0 && (
            <div className="booth-list">
              <h3>All Booths</h3>
              <div className="booth-grid">
                {booths.map((b) => {
                  const boothId = b._id || b.id;
                  const isAvailable = b.status === "Available";
                  return (
                    <div key={boothId} className={`booth-card booth-card--${b.status.toLowerCase()}`}>
                      <div className="booth-card__header">
                        <span className="booth-card__number">{b.boothNumber}</span>
                        <span className={`booth-card__status booth-card__status--${b.status.toLowerCase()}`}>
                          {b.status}
                        </span>
                      </div>
                      <div className="booth-card__info">
                        <p><MapPin size={14} /> {b.hall} · {b.floor}</p>
                        <p><strong>Size:</strong> {b.size}</p>
                        <p><strong>Type:</strong> {b.type}</p>
                        <p><strong>Price:</strong> PKR {b.price?.toLocaleString()}</p>
                      </div>
                      <div className="booth-card__actions">
                        {isAvailable ? (
                          <button className="booth-btn booth-btn--primary" onClick={() => handleRequestBooth(boothId, b.boothNumber)}>
                            Request This Booth
                          </button>
                        ) : (
                          <button className="booth-btn booth-btn--disabled" disabled>
                            {b.status === "Reserved" ? "Already Reserved" : "Unavailable"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {toast && <div className={`expo-toast expo-toast--${toast.type}`}>{toast.text}</div>}
    </div>
  );
}