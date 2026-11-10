import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./EventDetails.css";
import eventService from "../../services/eventService";
import boothService from "../../services/boothService";
import scheduleService from "../../services/scheduleService";
import bookmarkService from "../../services/bookmarkService";
import FloorPlan from "../../components/booths/FloorPlan";
import { useAuth } from "../../hooks/useAuth"; 
import api from "../../services/api"; 

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [expo, setExpo] = useState(null);
  const [booths, setBooths] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeHall, setActiveHall] = useState("Main Hall"); 

  const [expandedExhibitor, setExpandedExhibitor] = useState(null);
  const [exhibitorDetails, setExhibitorDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    if (!id) return;

    Promise.all([
      eventService.getById(id),
      boothService.list(), // ✅ Saare booths fetch karo (filter frontend pe karenge)
      scheduleService.list().catch(() => ({ sessions: [] }))
    ]).then(([eventRes, boothRes, scheduleRes]) => {
      const currentExpo = eventRes.expo;
      setExpo(currentExpo);

      // ✅ EXPO ID nikalne ki koshish (kabhi id, _id ya object)
      const currentExpoId = currentExpo?.id || currentExpo?._id || id;
      
      // ✅ FRONTEND FILTER: Sirf is event ke booths
      const filteredBooths = (boothRes.booths || []).filter(b => {
        const bExpoId = b.expoId?._id || b.expoId;
        return String(bExpoId) === String(currentExpoId);
      });
      setBooths(filteredBooths);

      // ✅ FRONTEND FILTER: Sirf is event ke sessions
      const filteredSessions = (scheduleRes.sessions || []).filter(s => {
        const sExpoId = s.expoId?._id || s.expoId;
        return String(sExpoId) === String(currentExpoId);
      });
      setSessions(filteredSessions);
      
      const uniqueHalls = [...new Set(filteredBooths.map(b => b.hall).filter(Boolean))];
      if (uniqueHalls.length > 0) {
        setActiveHall(uniqueHalls[0]);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  const sessionDates = useMemo(() => {
    return [...new Set(sessions.map(s => s.date))];
  }, [sessions]);

  const handleExhibitorClick = async (exhibitorId) => {
    if (!exhibitorId) return;
    if (expandedExhibitor === exhibitorId) {
      setExpandedExhibitor(null); 
      return;
    }
    
    setExpandedExhibitor(exhibitorId);
    
    if (!exhibitorDetails[exhibitorId]) {
      setLoadingDetails(true);
      try {
        const res = await api.get(`/exhibitors/${exhibitorId}`);
        setExhibitorDetails(prev => ({ ...prev, [exhibitorId]: res.data.exhibitor }));
      } catch (err) {
        console.error("Failed to fetch details", err);
      } finally {
        setLoadingDetails(false);
      }
    }
  };

  if (loading) return <div className="text-center py-5 mt-5 text-white"><h3>Loading Event Details...</h3></div>;
  if (!expo) return <div className="text-center py-5 mt-5 text-white"><h3>Event not found.</h3></div>;

  const halls = [...new Set(booths.map(b => b.hall).filter(Boolean))];
  
  const floorPlanBooths = booths.map(b => ({
    ...b,
    id: b.id || b._id,
    number: b.boothNumber,
    status: b.status === "Booked" ? "Occupied" : b.status,
    exhibitorName: b.reservedBy?.companyName || b.reservedBy?.name || null
  }));

  const bookedBooths = booths.filter(b => {
    const isBooked = b.status === "Booked" || b.status === "Occupied";
    const hasExhibitor = b.reservedBy && (b.reservedBy.companyName || b.reservedBy.name);
    return isBooked && hasExhibitor;
  });

  return (
    <div className="event-details-page">
      
      {/* HERO SECTION */}
      <div className="event-hero-gradient">
        <div className="container h-100 d-flex flex-column justify-content-end pb-5 relative-z">
          <Link to="/events" className="hero-back-link mb-3">← Back to Events</Link>
          
          <div className="d-flex align-items-end justify-content-between flex-wrap gap-4">
            <div>
              <span className="hero-badge mb-3">{expo.category}</span>
              <h1 className="hero-title-black">{expo.title}</h1>
              <div className="hero-meta-black">
                <span><i className="bi bi-calendar-event me-2"></i> {expo.startDate} - {expo.endDate}</span>
                <span className="ms-4"><i className="bi bi-geo-alt-fill me-2"></i> {expo.venue}, {expo.location}</span>
              </div>
            </div>
            {expo.cover && (
              <img src={expo.cover} alt="cover" className="hero-thumbnail d-none d-md-block" />
            )}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="container py-5 mt-4">
        <div className="row g-5">
          
          <div className="col-lg-8">
            <div className="event-tabs mb-4">
              <button className={`event-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
              <button className={`event-tab ${activeTab === "exhibitors" ? "active" : ""}`} onClick={() => setActiveTab("exhibitors")}>Exhibitors</button>
              <button className={`event-tab ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>Floor Map</button>
              <button className={`event-tab ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>Schedule</button>
            </div>

            <div className="event-tab-content">
              
              {/* Overview */}
              {activeTab === "overview" && (
                <div className="animated-gradient-box">
                  <div className="content-card-inner">
                    <h3 className="section-title">About This Event</h3>
                    <p className="desc-text">{expo.description}</p>
                    <h4 className="section-subtitle mt-5">Event Details</h4>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <div className="info-box"><strong>Start Date</strong><span>{expo.startDate}</span></div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box"><strong>End Date</strong><span>{expo.endDate}</span></div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box"><strong>Location</strong><span>{expo.location}</span></div>
                      </div>
                      <div className="col-md-6">
                        <div className="info-box"><strong>Max Capacity</strong><span>{expo.maxAttendees} attendees</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ Exhibitors Tab (Accordion Style) */}
              {activeTab === "exhibitors" && (
                <div className="animated-gradient-box">
                  <div className="content-card-inner">
                    <h3 className="section-title">Participating Exhibitors ({bookedBooths.length})</h3>
                    {bookedBooths.length === 0 ? (
                      <p className="text-muted">Exhibitors will be announced soon.</p>
                    ) : (
                      <div className="d-flex flex-column gap-3">
                        {bookedBooths.map(b => {
                          const exhibitorId = b.reservedBy?._id || b.reservedBy?.id;
                          const isExpanded = expandedExhibitor === exhibitorId;
                          const details = exhibitorDetails[exhibitorId];

                          return (
                            <div 
                              key={b.id || b._id} 
                              className={`exhibitor-accordion-card ${isExpanded ? 'active' : ''}`}
                            >
                              <div 
                                className="exhibitor-accordion-header"
                                onClick={() => handleExhibitorClick(exhibitorId)}
                              >
                                <div className="exhibitor-icon">🏢</div>
                                <div className="flex-grow-1">
                                  <h5 className="fw-bold mb-1 text-white">
                                    {b.reservedBy?.companyName || b.reservedBy?.name || "Company Name"}
                                  </h5>
                                  <p className="small mb-0 text-light">
                                    Booth: {b.boothNumber} · {b.hall || "N/A"} | Industry: {b.reservedBy?.industry || "N/A"}
                                  </p>
                                </div>
                                <div className="text-secondary">
                                  {isExpanded ? "▲ Hide Details" : "▼ View Details"}
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="exhibitor-accordion-body">
                                  {loadingDetails && !details ? (
                                    <p className="text-light">Loading details...</p>
                                  ) : details ? (
                                    <div className="row g-4 mt-2">
                                      <div className="col-md-8">
                                        <h6 className="text-info">About Company</h6>
                                        <p className="text-light small mb-3">{details.description || "No description provided."}</p>
                                        
                                        {details.mission && (
                                          <>
                                            <h6 className="text-info">Mission</h6>
                                            <p className="text-light small mb-3">{details.mission}</p>
                                          </>
                                        )}
                                      </div>
                                      
                                      <div className="col-md-4">
                                        <h6 className="text-info">Contact Info</h6>
                                        <ul className="list-unstyled text-light small mb-0">
                                          <li className="mb-1"><strong>Rep:</strong> {details.user?.name || "N/A"}</li>
                                          <li className="mb-1"><strong>Email:</strong> {details.user?.email || "N/A"}</li>
                                          <li className="mb-1"><strong>Phone:</strong> {details.user?.phone || "N/A"}</li>
                                          {details.website && (
                                            <li className="mb-1">
                                              <strong>Web:</strong> <a href={details.website} target="_blank" rel="noreferrer" className="text-info">{details.website}</a>
                                            </li>
                                          )}
                                        </ul>
                                      </div>
                                    </div>
                                  ) : (
                                    <p className="text-danger small">Could not load details.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Floor Map */}
              {activeTab === "map" && (
                <div className="animated-gradient-box">
                  <div className="content-card-inner">
                    <h3 className="section-title">Interactive Floor Plan ({booths.length} booths)</h3>
                    {halls.length === 0 ? (
                      <p className="text-muted">Floor plan is not available yet.</p>
                    ) : (
                      <div className="floorplan-wrapper">
                        <FloorPlan 
                          halls={halls}
                          activeHall={activeHall}
                          onHallChange={setActiveHall}
                          booths={floorPlanBooths}
                          statusFilter="All"
                          showLegend={true}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Schedule */}
              {activeTab === "schedule" && (
                <div className="animated-gradient-box">
                  <div className="content-card-inner">
                    <h3 className="section-title mb-4">Event Schedule ({sessions.length} sessions)</h3>
                    {sessions.length === 0 ? (
                      <p className="text-muted">The schedule will be announced soon.</p>
                    ) : (
                      <div className="schedule-list">
                        {sessions.map(s => (
                          <div key={s.id || s._id} className="pro-schedule-card">
                            <div className="pro-schedule-header">
                              <span className="pro-schedule-title">{s.title}</span>
                              <button 
                                className="pro-btn-bookmark"
                                onClick={async () => {
                                  if(user?.role !== 'attendee') return alert("Only attendees can bookmark.");
                                  try {
                                    const res = await bookmarkService.toggle(s.id || s._id);
                                    alert(res.message);
                                  } catch (err) { alert("Error bookmarking."); }
                                }}
                              >
                                🔖 Save
                              </button>
                            </div>
                            
                            <div className="pro-schedule-body">
                              <div className="pro-detail-item">
                                <span className="pro-label">Start Time</span>
                                <span className="pro-value">{s.startTime}</span>
                              </div>
                              <div className="pro-detail-item">
                                <span className="pro-label">End Time</span>
                                <span className="pro-value">{s.endTime}</span>
                              </div>
                              <div className="pro-detail-item">
                                <span className="pro-label">Venue</span>
                                <span className="pro-value">{s.room}</span>
                              </div>
                              <div className="pro-detail-item">
                                <span className="pro-label">Speaker</span>
                                <span className="pro-value">{s.speaker}</span>
                              </div>
                            </div>
                            
                            <div className="pro-schedule-desc">
                              <span className="pro-label">Description</span>
                              <p>{s.description || "No description provided."}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - SIDEBAR */}
          <div className="col-lg-4">
            <div className="sidebar-sticky">
              <div className="animated-gradient-box mb-4">
                <div className="booking-card-inner">
                  <h4 className="sidebar-card-title">Get Your Pass</h4>
                  <p className="sidebar-card-subtitle">Secure your spot at this exclusive event.</p>
                  <button onClick={() => {
                    if (user) navigate(`/ticket/${expo.id || expo._id}`);
                    else navigate("/login", { state: { from: `/ticket/${expo.id || expo._id}` } });
                  }} className="btn-gradient w-100 py-3">
                    Book Ticket Now
                  </button>
                </div>
              </div>

              <div className="animated-gradient-box">
                <div className="calendar-card-inner">
                  <h5 className="calendar-title">Event Calendar</h5>
                  <div className="calendar-grid">
                    {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
                      <div key={i} className="calendar-day-header">{day}</div>
                    ))}
                    {Array.from({ length: 30 }).map((_, i) => {
                      const dayNum = i + 1;
                      const dateStr = `2026-11-${dayNum.toString().padStart(2, '0')}`; 
                      const hasSession = sessionDates.includes(dateStr);
                      return (
                        <div key={i} className={`calendar-day ${hasSession ? 'has-event' : ''}`}>
                          {dayNum}
                          {hasSession && <span className="event-dot"></span>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}