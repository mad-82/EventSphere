import { useState, useEffect, useMemo } from "react";
import "./Events.css";
import eventService from "../../services/eventService";
import EventCard from "../../components/events/EventCard";

export default function Events() {
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [location, setLocation] = useState("All");

  useEffect(() => {
    eventService.list()
      .then(res => {
        const publishedExpos = (res.expos || []).filter(e => e.status === "Published");
        setExpos(publishedExpos);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Dynamic Categories aur Cities nikalne ke liye
  const categories = useMemo(() => ["All", ...new Set(expos.map(e => e.category))], [expos]);
  const locations = useMemo(() => ["All", ...new Set(expos.map(e => e.location))], [expos]);

  // Filter Logic
  const filteredExpos = useMemo(() => {
    let result = [...expos];
    if (search) result = result.filter(e => e.title.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") result = result.filter(e => e.category === category);
    if (location !== "All") result = result.filter(e => e.location === location);
    return result;
  }, [expos, search, category, location]);

  if (loading) return <div className="text-center py-5 mt-5 text-white"><h3>Loading Events...</h3></div>;

  return (
    <div className="events-page">
      
      {/* HERO SECTION (Gradient) */}
      <div className="events-hero-gradient">
        <div className="container text-center">
          <h1 className="events-hero-title">Upcoming Expos & Events</h1>
          <p className="events-hero-subtitle mx-auto">
            Discover, connect, and grow your business with our exclusive expos.
          </p>
        </div>
      </div>

      <div className="container pb-5">
        {/* FILTER BOX (Animated) */}
        <div className="filter-box-wrapper">
          <div className="filter-box-inner">
            <div className="row g-3">
              <div className="col-md-6">
                <input 
                  type="text" 
                  className="form-control form-control-lg" 
                  placeholder="Search event by name..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <select className="form-select form-select-lg" onChange={(e) => setCategory(e.target.value)}>
                  {categories.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
                </select>
              </div>
              <div className="col-md-3">
                <select className="form-select form-select-lg" onChange={(e) => setLocation(e.target.value)}>
                  {locations.map(l => <option key={l} value={l}>{l === "All" ? "All Cities" : l}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* EVENTS GRID */}
        {filteredExpos.length === 0 ? (
          <div className="no-events-found">
            <h3>No events found.</h3>
            <p>Try changing the filters.</p>
          </div>
        ) : (
          <div className="row g-4">
            {filteredExpos.map((expo) => (
              <div className="col-md-4 col-lg-4" key={expo.id}>
                <EventCard expo={expo} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}