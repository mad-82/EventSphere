import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, Ticket, Bookmark, Bell, ArrowRight,
  MapPin, Clock, Star, RefreshCw, AlertCircle, Users
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import attendeeService from "../../services/attendeeService";
import "./AttendeeDashboard.css";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const daysUntil = (d) =>
  d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

export default function AttendeeDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);

  // 🔥 Load Data Function
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await attendeeService.getDashboard();
      
      // 🔥 DEBUG LOG - F12 Console Mein Dikhega
      console.log("✅ FULL DATA:", res); 

      // Direct response set karo (Koi extra check nahi)
      setDashboardData(res);
    } catch (err) {
      console.error("❌ API ERROR:", err);
      setError(err?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="att-dash">
        <div className="att-dash__loading">
          <RefreshCw size={20} className="att-spin" />
          <span>Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="att-dash">
        <div className="att-dash__error">
          <AlertCircle size={32} />
          <h2>Couldn't load dashboard</h2>
          <p>{error}</p>
          <button className="att-btn att-btn--primary" onClick={loadData}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Data Extract karo
  const stats = dashboardData?.stats || {};
  const registrations = dashboardData?.registrations || [];
  const upcomingSessions = dashboardData?.upcomingSessions || [];
  const upcomingExposList = dashboardData?.upcomingExposList || [];
  const notifications = dashboardData?.notifications || [];

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="att-dash">
      {/* Welcome */}
      <section className="att-dash__welcome">
        <div>
          <p className="att-dash__eyebrow">{today}</p>
          <h1 className="att-dash__title">
            Welcome{user?.name ? `, ${user.name.split(" ")[0]}` : ""} 👋
          </h1>
          <p className="att-dash__subtitle">Here's your expo journey overview.</p>
        </div>
        <div className="att-dash__welcome-actions">
          <button className="att-btn att-btn--ghost" onClick={loadData}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="att-btn att-btn--primary" onClick={() => navigate("/events")}>
            <Ticket size={16} /> Browse Events
          </button>
        </div>
      </section>

      {/* KPI Cards */}
      <section className="att-dash__kpis">
        <KpiCard icon={<Ticket size={20} />} label="Registered Events" value={stats?.registeredEvents ?? 0} tone="primary" onClick={() => navigate("/attendee/registrations")} />
        <KpiCard icon={<CalendarDays size={20} />} label="Upcoming Expos" value={stats?.upcomingExpos ?? 0} tone="info" onClick={() => navigate("/events")} />
        <KpiCard icon={<Bell size={20} />} label="Unread Notifications" value={stats?.unreadNotifications ?? 0} tone="warning" onClick={() => navigate("/attendee/notifications")} />
      </section>

      {/* Main Grid */}
      <section className="att-dash__grid">
        
        {/* Upcoming Expos */}
        <div className="att-card att-dash__expos">
          <header className="att-card__header">
            <div>
              <h2 className="att-card__title">Upcoming Expos</h2>
              <p className="att-card__sub">Don't miss these events</p>
            </div>
            <button className="att-link" onClick={() => navigate("/events")}>
              Browse <ArrowRight size={14} />
            </button>
          </header>
          {upcomingExposList.length === 0 ? (
            <EmptyState icon={<CalendarDays size={26} />} title="No upcoming expos" message="Check back soon for new events." />
          ) : (
            <div className="att-expo-list">
              {upcomingExposList.map((expo) => {
                const days = daysUntil(expo.startDate);
                return (
                  <div key={expo._id || expo.id} className="att-expo-item" onClick={() => navigate(`/events/${expo._id || expo.id}`)}>
                    <div className="att-expo-item__img">
                      {expo.cover ? (
                        <img src={expo.cover.startsWith('http') ? expo.cover : `http://localhost:5000${expo.cover}`} alt={expo.title} />
                      ) : (
                        <div className="att-expo-item__img-fallback">
                          <CalendarDays size={20} />
                        </div>
                      )}
                    </div>
                    <div className="att-expo-item__info">
                      <p className="att-expo-item__title">{expo.title}</p>
                      <p className="att-expo-item__meta">
                        <MapPin size={12} /> {expo.venue || expo.location || "—"}
                      </p>
                      <p className="att-expo-item__date">
                        <CalendarDays size={12} /> {fmtDate(expo.startDate)}
                        {days !== null && days >= 0 && (
                          <span className="att-expo-item__countdown">in {days}d</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Registered Events */}
        <div className="att-card att-dash__events">
          <header className="att-card__header">
            <div>
              <h2 className="att-card__title">Registered Events</h2>
              <p className="att-card__sub">Expos you've signed up for</p>
            </div>
            <button className="att-link" onClick={() => navigate("/attendee/registrations")}>
              View All <ArrowRight size={14} />
            </button>
          </header>
          {registrations.length === 0 ? (
            <EmptyState icon={<Ticket size={26} />} title="No registrations yet" message="Browse expos and register for your first event." actionLabel="Browse Events" onAction={() => navigate("/events")} />
          ) : (
            <ul className="att-list">
              {registrations.slice(0, 4).map((reg) => (
                <li key={reg._id || reg.id} className="att-list__item">
                  <div className="att-list__img-wrap">
                    {reg.expoId?.cover ? <img src={reg.expoId.cover} alt={reg.expoId.title} /> : <CalendarDays size={20} />}
                  </div>
                  <div className="att-list__body">
                    <span className="att-list__title">{reg.expoId?.title || "Expo"}</span>
                    <span className="att-list__meta">
                      <MapPin size={12} /> {reg.expoId?.location || "TBD"}
                    </span>
                    <span className="att-list__date">
                      <Clock size={12} /> {fmtDate(reg.expoId?.startDate)}
                    </span>
                  </div>
                  <button className="att-link att-link--sm" onClick={() => navigate(`/events/${reg.expoId?._id || reg.expoId}`)}>
                    View
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Upcoming Sessions */}
        <div className="att-card att-dash__sessions">
          <header className="att-card__header">
            <div>
              <h2 className="att-card__title">Upcoming Sessions</h2>
              <p className="att-card__sub">Don't miss these talks</p>
            </div>
            <button className="att-link" onClick={() => navigate("/attendee/schedule")}>
              View All <ArrowRight size={14} />
            </button>
          </header>
          {upcomingSessions.length === 0 ? (
            <EmptyState icon={<CalendarDays size={26} />} title="No upcoming sessions" message="Check back soon for new sessions." />
          ) : (
            <ul className="att-list">
              {upcomingSessions.slice(0, 4).map((s) => (
                <li key={s._id || s.id} className="att-list__item">
                  <div className="att-list__icon"><Star size={18} /></div>
                  <div className="att-list__body">
                    <span className="att-list__title">{s.title}</span>
                    <span className="att-list__meta"><Users size={12} /> {s.speaker}</span>
                    <span className="att-list__date"><Clock size={12} /> {fmtDate(s.date)} · {s.startTime} – {s.endTime}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Notifications */}
        <div className="att-card att-dash__notifs">
          <header className="att-card__header">
            <div>
              <h2 className="att-card__title">Recent Notifications</h2>
              <p className="att-card__sub">Latest updates</p>
            </div>
            <button className="att-link" onClick={() => navigate("/attendee/notifications")}>
              View All <ArrowRight size={14} />
            </button>
          </header>
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell size={26} />} title="No notifications" message="You're all caught up!" />
          ) : (
            <ul className="att-notif-list">
              {notifications.slice(0, 4).map((n) => (
                <li key={n._id || n.id} className={`att-notif-list__item ${!n.read ? "is-unread" : ""}`}>
                  <span className="att-notif-list__dot" />
                  <div className="att-notif-list__body">
                    <span className="att-notif-list__title">{n.title}</span>
                    <span className="att-notif-list__msg">{n.message}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Actions */}
        <div className="att-card att-dash__quick">
          <header className="att-card__header">
            <h2 className="att-card__title">Quick Actions</h2>
          </header>
          <div className="att-quick-grid">
            <QuickAction icon={<CalendarDays size={20} />} label="Browse Events" onClick={() => navigate("/events")} />
            <QuickAction icon={<Users size={20} />} label="Find Exhibitors" onClick={() => navigate("/attendee/exhibitors")} />
            <QuickAction icon={<Bookmark size={20} />} label="My Bookmarks" onClick={() => navigate("/attendee/bookmarks")} />
            <QuickAction icon={<Bell size={20} />} label="Notifications" onClick={() => navigate("/attendee/notifications")} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- Sub components ---------- */
function KpiCard({ icon, label, value, tone = "primary", onClick }) {
  return (
    <button className={`att-kpi att-kpi--${tone}`} onClick={onClick} type="button">
      <span className="att-kpi__icon">{icon}</span>
      <span className="att-kpi__body">
        <span className="att-kpi__value">{value}</span>
        <span className="att-kpi__label">{label}</span>
      </span>
    </button>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button className="att-quick-action" onClick={onClick} type="button">
      <span className="att-quick-action__icon">{icon}</span>
      <span className="att-quick-action__label">{label}</span>
    </button>
  );
}

function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="att-empty">
      <div className="att-empty__icon">{icon}</div>
      <p className="att-empty__title">{title}</p>
      <p className="att-empty__msg">{message}</p>
      {actionLabel && (
        <button className="att-btn att-btn--primary att-btn--sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}