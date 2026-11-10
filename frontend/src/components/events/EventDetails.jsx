import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import "./EventDetails.css";
import eventService from "../../services/eventService";
import boothService from "../../services/boothService";
import scheduleService from "../../services/scheduleService"; // <-- Add kiya
import FloorPlan from "../../components/booths/FloorPlan";
import { useAuth } from "../../hooks/useAuth"; 
import bookmarkService from "../../services/bookmarkService";

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); 
  
  const [expo, setExpo] = useState(null);
  const [booths, setBooths] = useState([]);
  const [sessions, setSessions] = useState([]); // <-- Sessions state add ki
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activeHall, setActiveHall] = useState("Main Hall"); 

  useEffect(() => {
    Promise.all([
      eventService.getById(id),
      boothService.list({ expoId: id }),
      scheduleService.list({ expoId: id }).catch(() => ({ sessions: [] })) // <-- Schedule fetch kiya
    ]).then(([eventRes, boothRes, scheduleRes]) => {
      setExpo(eventRes.expo);
      setBooths(boothRes.booths || []);
      setSessions(scheduleRes.sessions || []); // <-- Data save kiya
      
      const uniqueHalls = [...new Set((boothRes.booths || []).map(b => b.hall))];
      if (uniqueHalls.length > 0) {
        setActiveHall(uniqueHalls[0]);
      }
    }).catch(err => {
      console.error(err);
    }).finally(() => {
      setLoading(false);
    });
  }, [id]);

  if (loading) return <div className="text-center py-5 mt-5"><h3>Loading Event Details...</h3></div>;
  if (!expo) return <div className="text-center py-5 mt-5"><h3>Event not found.</h3></div>;

  const halls = [...new Set(booths.map(b => b.hall))];

  const floorPlanBooths = booths.map(b => ({
    ...b,
    number: b.boothNumber,
    status: b.status === "Booked" ? "Occupied" : b.status
  }));

  return (
    <div className="event-details-page">
      {/* Hero Banner */}
      <div 
        className="event-hero" 
        style={{ backgroundImage: `url(${expo.cover || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'})` }}
      >
        <div className="event-hero__overlay">
          <div className="container h-100 d-flex flex-column justify-content-end pb-4">
            <Link to="/events" className="text-white mb-3 text-decoration-none">← Back to Events</Link>
            <span className="badge bg-info text-dark mb-2 w-auto align-self-start px-3 py-2">{expo.category}</span>
            <h1 className="display-4 fw-bold text-white">{expo.title}</h1>
            <div className="d-flex gap-4 text-white mt-2">
              <span><i className="bi bi-calendar-event"></i> {expo.startDate} - {expo.endDate}</span>
              <span><i className="bi bi-geo-alt-fill"></i> {expo.venue}, {expo.location}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <div className="row">
          {/* Main Content (Left) */}
          <div className="col-lg-8">
            
            {/* 4 Tabs */}
            <div className="event-tabs mb-4">
              <button className={`event-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}>Overview</button>
              <button className={`event-tab ${activeTab === "exhibitors" ? "active" : ""}`} onClick={() => setActiveTab("exhibitors")}>Exhibitors</button>
              <button className={`event-tab ${activeTab === "map" ? "active" : ""}`} onClick={() => setActiveTab("map")}>Floor Map</button>
              <button className={`event-tab ${activeTab === "schedule" ? "active" : ""}`} onClick={() => setActiveTab("schedule")}>Schedule</button>
            </div>

            {/* Tab Content */}
            <div className="event-tab-content bg-white p-4 rounded shadow-sm">
              
              {/* 1. Overview */}
              {activeTab === "overview" && (
                <div>
                  <h3 className="mb-3">About This Event</h3>
                  <p className="text-muted" style={{ lineHeight: 1.8 }}>{expo.description}</p>
                  <h4 className="mt-4 mb-3">Event Details</h4>
                  <ul className="list-unstyled">
                    <li className="mb-2"><strong>Dates:</strong> {expo.startDate} to {expo.endDate}</li>
                    <li className="mb-2"><strong>Location:</strong> {expo.venue}, {expo.location}</li>
                    <li className="mb-2"><strong>Max Capacity:</strong> {expo.maxAttendees} attendees</li>
                    <li className="mb-2"><strong>Registration:</strong> {expo.registrationStart} to {expo.registrationEnd}</li>
                  </ul>
                </div>
              )}

              {/* 2. Exhibitors */}
              {activeTab === "exhibitors" && (
                <div>
                  <h3 className="mb-3">Participating Exhibitors</h3>
                  {booths.length === 0 ? (
                    <p className="text-muted">Exhibitors will be announced soon.</p>
                  ) : (
                    <div className="row g-3">
                      {booths.map(b => (
                        <div className="col-md-6" key={b.id}>
                          <div className="exhibitor-card p-3 border rounded">
                            <h5 className="fw-bold mb-1">{b.reservedBy?.companyName || b.reservedBy?.name || "Company Name"}</h5>
                            <p className="text-muted small mb-1">Booth: {b.boothNumber} · {b.hall}</p>
                            <p className="small mb-0 text-secondary">{b.reservedBy?.industry || "Industry N/A"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Floor Map */}
              {activeTab === "map" && (
                <div>
                  <h3 className="mb-3">Interactive Floor Plan</h3>
                  {halls.length === 0 ? (
                    <p className="text-muted">Floor plan is not available yet.</p>
                  ) : (
                    <FloorPlan 
                      halls={halls}
                      activeHall={activeHall}
                      onHallChange={setActiveHall}
                      booths={floorPlanBooths}
                      statusFilter="All"
                      showLegend={true}
                    />
                  )}
                </div>
              )}

              {/* 4. Schedule (Yahan humne sessions ko map kiya hai) */}
              {activeTab === "schedule" && (
                <div>
                  <h3 className="mb-3">Event Schedule</h3>
                  {sessions.length === 0 ? (
                    <p className="text-muted">The schedule will be announced soon.</p>
                  ) : (
                    <div className="timeline">
                      {sessions.map(s => (
                        <div key={s.id} className="schedule-item border-start border-3 border-info ps-3 mb-4 position-relative">
                          <div className="d-flex justify-content-between align-items-start">
                            <div>
                              <span className="badge bg-dark mb-2">{s.startTime} - {s.endTime}</span>
                              <h5 className="fw-bold mb-1">{s.title}</h5>
                              <p className="text-muted small mb-1">Speaker: {s.speaker} | Room: {s.room}</p>
                              <p className="small text-secondary mb-0">{s.description}</p>
                            </div>
                            
                            {/* Bookmark Button */}
                            {user && user.role === "attendee" && (
                              <button 
                                className="btn btn-sm btn-outline-dark"
                                onClick={async () => {
                                  try {
                                    const res = await bookmarkService.toggle(s.id);
                                    alert(res.message);
                                  } catch (err) {
                                    alert("Please login to bookmark.");
                                  }
                                }}
                              >
                                🔖 Bookmark
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sticky Booking Card (Right) */}
          <div className="col-lg-4">
            <div className="booking-card bg-white p-4 rounded shadow-sm sticky-top" style={{ top: "100px" }}>
              <h4 className="fw-bold mb-3">Interested in attending?</h4>
              <p className="text-muted mb-4">Secure your spot at {expo.title}.</p>
              <button onClick={() => {
                if (user) navigate(`/ticket/${expo.id}`);
                else navigate("/login", { state: { from: `/ticket/${expo.id}` } });
              }} className="btn btn-dark w-100 py-3 fw-bold">
                Book Your Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}