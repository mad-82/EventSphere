import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, MapPin, CalendarDays, X, ArrowRight, Building2, Clock,
  Tag, Filter, Inbox, CheckCircle2, XCircle, RefreshCw, AlertCircle
} from "lucide-react";
import eventService from "../../services/eventService";
import applicationService from "../../services/applicationService";
import boothService from "../../services/boothService"; // ✅ Import kiya
import "./BrowseExpos.css";

// ✅ Images Import
import foodExpoImg from "../../assets/images/food-festival-advertising-square.jpg";
import autoTechImg from "../../assets/images/Automotive.jpg";
import expoTechImg from "../../assets/images/Expo tech world.jpg";

/* ---------- helpers ---------- */

const getImageUrl = (url) => {
  if (!url) return "";
  const lowerUrl = url.toLowerCase();
  if (lowerUrl.includes("food-festival")) return foodExpoImg;
  if (lowerUrl.includes("automotive")) return autoTechImg;
  if (lowerUrl.includes("expo tech world") || lowerUrl.includes("expo-tech-world")) return expoTechImg;
  if (url.startsWith("http")) return url;
  return `http://localhost:5000${url.startsWith("/") ? "" : "/"}${url}`; 
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysUntil = (d) =>
  d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

// ✅ NAYA: Status function ab booths aur applications dono check karega
const getExpoStatus = (expo, userApplications = [], allBooths = []) => {
  const now = Date.now();
  const start = expo.startDate ? new Date(expo.startDate).getTime() : 0;
  const end = expo.endDate ? new Date(expo.endDate).getTime() : 0;
  const expoId = expo._id || expo.id;

  // 1. Check karo kya is expo me koi booth reserved/occupied hai?
  const hasReservedBooth = allBooths.some(
    (b) => (b.expoId?._id || b.expoId) === expoId && 
    (b.status === "Reserved" || b.status === "Occupied" || b.status === "Booked")
  );

  // Agar booth reserved hai, to sabke liye "reserved" status
  if (hasReservedBooth) return "reserved";

  // 2. Check karo is user ki us expo ke liye koi application hai ya nahi
  const userApp = userApplications.find(
    (app) => (app.expoId?._id || app.expoId) === expoId
  );

  if (userApp && userApp.status === "approved") return "reserved"; // Khud ki approved
  if (userApp && userApp.status === "pending") return "applied";   // Khud ki pending

  // 3. Dates ke hisaab se
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "ongoing";
  return "completed";
};

export default function BrowseExpos() {
  const navigate = useNavigate();

  const [expos, setExpos] = useState([]);
  const [applications, setApplications] = useState([]);
  const [allBooths, setAllBooths] = useState([]); // ✅ New state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedExpo, setSelectedExpo] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [location, setLocation] = useState("all");
  const [timing, setTiming] = useState("all");
  const [sortBy, setSortBy] = useState("soonest");

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, appsRes, boothsRes] = await Promise.all([
        eventService.list({ limit: 100 }),
        applicationService.getMyApplications().catch(() => ({ applications: [] })),
        boothService.list({}).catch(() => ({ booths: [] })), // ✅ Saare booths fetch karo
      ]);
      setExpos(eventsRes.expos || []);
      setApplications(appsRes.applications || []);
      setAllBooths(boothsRes.booths || []);
    } catch (err) {
      setError(err?.message || "Failed to load expos.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const appByExpoId = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      if (a.status === "pending" || a.status === "approved" || !map[a.expoId?._id || a.expoId]) {
        map[a.expoId?._id || a.expoId] = a;
      }
    });
    return map;
  }, [applications]);

  const categories = useMemo(() => {
    const set = new Set(expos.map((e) => e.category).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [expos]);

  const locations = useMemo(() => {
    const set = new Set(expos.map((e) => e.city).filter(Boolean));
    return ["all", ...Array.from(set)];
  }, [expos]);

  const filtered = useMemo(() => {
    let list = [...expos];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (e) =>
          e.title?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q) ||
          e.venue?.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((e) => e.category === category);
    if (location !== "all") list = list.filter((e) => e.city === location);
    if (timing !== "all") list = list.filter((e) => getExpoStatus(e, applications, allBooths) === timing);
    
    if (sortBy === "soonest") list.sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    else if (sortBy === "latest") list.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    
    return list;
  }, [expos, search, category, location, timing, sortBy, applications, allBooths]);

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setLocation("all");
    setTiming("all");
    setSortBy("soonest");
  };

  const hasActiveFilters = search || category !== "all" || location !== "all" || timing !== "all";

  if (loading) return <div className="exb-browse"><div className="exb-dash__loading"><RefreshCw size={20} className="exb-spin" /> Loading expos…</div></div>;
  if (error) return <div className="exb-browse"><div className="exb-dash__error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="exb-browse">
      <header className="exb-browse__header">
        <div>
          <h1 className="exb-browse__title">Browse Expos</h1>
          <p className="exb-browse__subtitle">Discover expos, review requirements, and submit your participation application.</p>
        </div>
        <div className="exb-browse__count"><strong>{filtered.length}</strong> of {expos.length} expos</div>
      </header>

      <section className="exb-browse__filters">
        <div className="exb-browse__search">
          <Search size={16} />
          <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          {search && <button className="exb-browse__search-clear" onClick={() => setSearch("")}><X size={14} /></button>}
        </div>
        <div className="exb-browse__select-wrap">
          <Filter size={14} />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map((c) => <option key={c} value={c}>{c === "all" ? "All Categories" : c}</option>)}
          </select>
        </div>
        <div className="exb-browse__select-wrap">
          <MapPin size={14} />
          <select value={location} onChange={(e) => setLocation(e.target.value)}>
            {locations.map((l) => <option key={l} value={l}>{l === "all" ? "All Locations" : l}</option>)}
          </select>
        </div>
        <div className="exb-browse__select-wrap">
          <CalendarDays size={14} />
          <select value={timing} onChange={(e) => setTiming(e.target.value)}>
            <option value="all">All Dates</option>
            <option value="upcoming">Upcoming</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
            <option value="reserved">Reserved</option>
          </select>
        </div>
        <div className="exb-browse__select-wrap">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="soonest">Soonest First</option>
            <option value="latest">Latest First</option>
          </select>
        </div>
        {hasActiveFilters && <button className="exb-browse__reset" onClick={resetFilters}>Reset</button>}
      </section>

      {filtered.length === 0 ? (
        <div className="exb-browse__empty">
          <div className="exb-browse__empty-icon"><Inbox size={32} /></div>
          <h3>No expos match your filters</h3>
          <button className="exb-browse__btn exb-browse__btn--primary" onClick={resetFilters}>Clear Filters</button>
        </div>
      ) : (
        <div className="exb-browse__grid">
          {filtered.map((expo) => {
            const app = appByExpoId[expo._id || expo.id];
            const status = getExpoStatus(expo, applications, allBooths);
            return (
              <ExpoCard
                key={expo._id || expo.id}
                expo={expo}
                status={status}
                application={app}
                onViewDetails={() => setSelectedExpo(expo)}
                onApply={() => navigate(`/exhibitor/browse-expos/${expo._id || expo.id}/apply`)}
                onViewApplication={() => navigate("/exhibitor/my-applications")}
                onViewBooth={() => navigate("/exhibitor/my-booth")}
              />
            );
          })}
        </div>
      )}

      {selectedExpo && (
        <ExpoDetailModal
          expo={selectedExpo}
          application={appByExpoId[selectedExpo._id || selectedExpo.id]}
          allBooths={allBooths}
          onClose={() => setSelectedExpo(null)}
          onApply={() => {
            const id = selectedExpo._id || selectedExpo.id;
            setSelectedExpo(null);
            navigate(`/exhibitor/browse-expos/${id}/apply`);
          }}
          onViewApplication={() => {
            setSelectedExpo(null);
            navigate("/exhibitor/my-applications");
          }}
          onViewBooth={() => {
            setSelectedExpo(null);
            navigate("/exhibitor/my-booth");
          }}
        />
      )}
    </div>
  );
}

function ExpoCard({ expo, status, application, onViewDetails, onApply, onViewApplication, onViewBooth }) {
  const daysToStart = daysUntil(expo.startDate);
  const imageSrc = getImageUrl(expo.cover || expo.coverImage);
  const isReserved = status === "reserved";
  const isApplied = status === "applied";

  return (
    <article className="exb-expo-card">
      <div className="exb-expo-card__cover">
        {imageSrc ? (
          <img 
            src={imageSrc} 
            alt={expo.title} 
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        <div className="exb-expo-card__cover-fallback" style={{ display: imageSrc ? 'none' : 'flex' }}>
          <Building2 size={32} />
        </div>
        <span className={`exb-expo-card__status exb-expo-card__status--${status}`}>
          {status === "upcoming" && <Clock size={12} />}
          {status === "ongoing" && <CheckCircle2 size={12} />}
          {status === "completed" && <XCircle size={12} />}
          {status === "reserved" && <CheckCircle2 size={12} />}
          {status === "applied" && <Clock size={12} />}
          {isReserved ? "Reserved" : isApplied ? "Applied" : status}
        </span>
      </div>

      <div className="exb-expo-card__body">
        <div className="exb-expo-card__meta-row">
          <span className="exb-expo-card__category"><Tag size={11} /> {expo.category || "General"}</span>
          {daysToStart !== null && daysToStart >= 0 && status === "upcoming" && (
            <span className="exb-expo-card__countdown">in {daysToStart}d</span>
          )}
        </div>
        <h3 className="exb-expo-card__title">{expo.title}</h3>
        <p className="exb-expo-card__desc">{expo.description}</p>
        <div className="exb-expo-card__info">
          <div><MapPin size={13} /> <span>{expo.venue || "TBD"}, {expo.location || expo.city || "TBD"}</span></div>
          <div><CalendarDays size={13} /> <span>{fmtDate(expo.startDate)} – {fmtDate(expo.endDate)}</span></div>
        </div>
        
        {application && !isReserved && (
          <div className={`exb-expo-card__app exb-expo-card__app--${application.status}`}>
            <span className="exb-expo-card__app-label">
              {application.status === "approved" && <CheckCircle2 size={13} />}
              {application.status === "pending" && <Clock size={13} />}
              {application.status === "rejected" && <XCircle size={13} />}
              Application {application.status}
            </span>
          </div>
        )}

        <div className="exb-expo-card__actions">
          <button className="exb-browse__btn exb-browse__btn--ghost" onClick={onViewDetails}>View Details</button>
          
          {isReserved ? (
            <button className="exb-browse__btn exb-browse__btn--disabled" disabled>
              Reserved
            </button>
          ) : isApplied ? (
            <button className="exb-browse__btn exb-browse__btn--primary" onClick={onViewApplication}>
              View Application <ArrowRight size={14} />
            </button>
          ) : status === "upcoming" ? (
            <button className="exb-browse__btn exb-browse__btn--primary" onClick={onApply}>
              Apply Now <ArrowRight size={14} />
            </button>
          ) : (
            <button className="exb-browse__btn exb-browse__btn--disabled" disabled>
              {status === "completed" ? "Closed" : "Not Available"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function ExpoDetailModal({ expo, application, allBooths, onClose, onApply, onViewApplication, onViewBooth }) {
  const status = getExpoStatus(expo, application ? [application] : [], allBooths);
  const imageSrc = getImageUrl(expo.cover || expo.coverImage);
  const isReserved = status === "reserved";
  const isApplied = status === "applied";

  return (
    <div className="exb-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="exb-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="exb-modal__close" onClick={onClose}><X size={18} /></button>
        <div className="exb-modal__cover">
          {imageSrc ? (
            <img src={imageSrc} alt={expo.title} onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
          ) : null}
          <div className="exb-modal__cover-fallback" style={{ display: imageSrc ? 'none' : 'flex' }}>
            <Building2 size={40} />
          </div>
        </div>
        <div className="exb-modal__body">
          <div className="exb-modal__meta-row">
            <span className="exb-expo-card__category"><Tag size={11} /> {expo.category || "General"}</span>
            <span className={`exb-expo-card__status exb-expo-card__status--${status}`}>{isReserved ? "Reserved" : isApplied ? "Applied" : status}</span>
          </div>
          <h2 className="exb-modal__title">{expo.title}</h2>
          <p className="exb-modal__desc">{expo.description}</p>
          <div className="exb-modal__grid">
            <InfoBlock icon={<MapPin size={14} />} label="Venue" value={`${expo.venue || "TBD"}, ${expo.location || expo.city || "TBD"}`} />
            <InfoBlock icon={<CalendarDays size={14} />} label="Event Dates" value={`${fmtDate(expo.startDate)} – ${fmtDate(expo.endDate)}`} />
          </div>
          <div className="exb-modal__actions">
            <button className="exb-browse__btn exb-browse__btn--ghost" onClick={onClose}>Close</button>
            {isReserved ? (
              <button className="exb-browse__btn exb-browse__btn--disabled" disabled>Reserved</button>
            ) : isApplied ? (
              <button className="exb-browse__btn exb-browse__btn--primary" onClick={onViewApplication}>
                View Application <ArrowRight size={14} />
              </button>
            ) : status === "upcoming" ? (
              <button className="exb-browse__btn exb-browse__btn--primary" onClick={onApply}>
                Apply Now <ArrowRight size={14} />
              </button>
            ) : (
              <button className="exb-browse__btn exb-browse__btn--disabled" disabled>Closed</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoBlock({ icon, label, value }) {
  return (
    <div className="exb-info-block">
      <span className="exb-info-block__icon">{icon}</span>
      <div>
        <span className="exb-info-block__label">{label}</span>
        <span className="exb-info-block__value">{value}</span>
      </div>
    </div>
  );
}