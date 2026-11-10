import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  CalendarDays,
  ArrowRight,
  Building2,
  Package,
  Users,
  Bell,
  PlusCircle,
  Sparkles,
  LayoutDashboard,
  RefreshCw,
  AlertCircle,
  TrendingUp
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "../../hooks/useAuth";
import exhibitorService from "../../services/exhibitorService";
import eventService from "../../services/eventService";
import notificationService from "../../services/notificationService";
import { useExhibitorData } from "../../context/ExhibitorDataContext";
import "./ExhibitorDashboard.css";

/* ---------- helpers ---------- */
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const daysUntil = (d) =>
  d ? Math.ceil((new Date(d) - new Date()) / (1000 * 60 * 60 * 24)) : null;

const computeCompletion = (c) => {
  if (!c) return 0;
  const fields = [
    c.companyName, c.industry, c.registrationNumber, c.establishedYear,
    c.companySize, c.website, c.description, c.mission, c.category,
    c.email, c.phone, c.country, c.city, c.address,
  ];
  const filled = fields.filter((v) => v != null && String(v).trim() !== "").length;
  return Math.round((filled / fields.length) * 100);
};

const statusLabel = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "approved") return "Approved";
  if (v === "rejected") return "Rejected";
  if (v === "pending") return "Pending";
  return s || "—";
};

export default function ExhibitorDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshUnread, unreadCount } = useExhibitorData();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    stats: null,
    exhibitor: null,
    myBooths: [],
    recentApplications: [],
  });
  const [upcomingExpos, setUpcomingExpos] = useState([]);
  const [notifications, setNotifications] = useState([]);

  /* ---------- load everything ---------- */
  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [dashRes, eventsRes, notifRes] = await Promise.all([
        exhibitorService.getMyDashboard(),
        eventService.list({ limit: 100 }).catch(() => ({ expos: [] })),
        notificationService.getMyNotifications().catch(() => ({ notifications: [] })),
      ]);

      setData({
        stats: dashRes.stats || null,
        exhibitor: dashRes.exhibitor || null,
        myBooths: dashRes.myBooths || [],
        recentApplications: dashRes.recentApplications || [],
      });

      // Upcoming expos (future only, first 3)
      const allExpos = eventsRes.expos || [];
      const now = Date.now();
      const upcoming = allExpos
        .filter((e) => e.startDate && new Date(e.startDate).getTime() >= now)
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3);
      setUpcomingExpos(upcoming);

      // Latest 4 notifications
      const notifs = (notifRes.notifications || [])
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 4);
      setNotifications(notifs);

      // refresh sidebar unread
      refreshUnread();
    } catch (err) {
      setError(err?.message || "Failed to load dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mock Chart Data (Isko aap backend se dynamically bhi le sakte hain)
  const chartData = useMemo(() => [
    { name: 'Jun', apps: 0 },
    { name: 'Jul', apps: 1 },
    { name: 'Aug', apps: 1 },
    { name: 'Sep', apps: 2 },
    { name: 'Oct', apps: 3 },
    { name: 'Nov', apps: data.recentApplications.length },
  ], [data.recentApplications]);

  /* ---------- loading state ---------- */
  if (loading) {
    return (
      <div className="exb-dash">
        <div className="exb-dash__loading">
          <RefreshCw size={20} className="exb-spin" />
          <span>Loading dashboard…</span>
        </div>
      </div>
    );
  }

  /* ---------- error state ---------- */
  if (error) {
    return (
      <div className="exb-dash">
        <div className="exb-dash__error">
          <AlertCircle size={32} />
          <h2>Couldn't load dashboard</h2>
          <p>{error}</p>
          <button className="exb-btn exb-btn--primary" onClick={loadAll}>
            <RefreshCw size={14} /> Try Again
          </button>
        </div>
      </div>
    );
  }

  const { stats, exhibitor, myBooths, recentApplications } = data;
  const completion = computeCompletion(exhibitor);
  const myAllocation = myBooths[0] || null;
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="exb-dash">
      {/* ============ WELCOME ============ */}
      <section className="exb-dash__welcome">
        <div>
          <p className="exb-dash__eyebrow">{today}</p>
          <h1 className="exb-dash__title">
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </h1>
          <p className="exb-dash__subtitle">
            Here's your expo participation overview.
          </p>
        </div>
        <div className="exb-dash__welcome-actions">
          <button className="exb-btn exb-btn--ghost" onClick={loadAll} title="Refresh">
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="exb-btn exb-btn--primary" onClick={() => navigate("/exhibitor/browse-expos")}>
            <PlusCircle size={16} /> Browse Expos
          </button>
        </div>
      </section>

      {/* ============ KPI CARDS ============ */}
      <section className="exb-dash__kpis">
        <KpiCard icon={<FileText size={20} />} label="Applications" value={stats?.totalApplications ?? 0} onClick={() => navigate("/exhibitor/my-applications")} />
        <KpiCard icon={<Clock size={20} />} label="Pending" value={stats?.pendingApplications ?? 0} tone="warning" onClick={() => navigate("/exhibitor/my-applications")} />
        <KpiCard icon={<CheckCircle2 size={20} />} label="Approved" value={stats?.approvedApplications ?? 0} tone="success" onClick={() => navigate("/exhibitor/my-applications")} />
        <KpiCard icon={<XCircle size={20} />} label="Rejected" value={stats?.rejectedApplications ?? 0} tone="danger" onClick={() => navigate("/exhibitor/my-applications")} />
        <KpiCard icon={<LayoutDashboard size={20} />} label="Assigned Booths" value={stats?.assignedBooths ?? 0} tone="info" onClick={() => navigate("/exhibitor/my-booth")} />
      </section>

      {/* ============ CHART SECTION ============ */}
      <section className="exb-card exb-dash__chart-card">
        <header className="exb-card__header">
          <div>
            <h2 className="exb-card__title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <TrendingUp size={18} color="#0e8a5f" /> Application Activity
            </h2>
            <p className="exb-card__sub">Your application submissions over time</p>
          </div>
        </header>
        <div style={{ width: "100%", height: 280, marginTop: 10 }}>
          <ResponsiveContainer>
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0e8a5f" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0e8a5f" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} allowDecimals={false} />
              <Tooltip 
                contentStyle={{ borderRadius: 8, border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} 
                itemStyle={{ color: '#0e8a5f', fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="apps" stroke="#0e8a5f" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ============ MAIN GRID ============ */}
      <section className="exb-dash__grid">
        {/* --- Application Activity --- */}
        <div className="exb-card exb-dash__activity">
          <header className="exb-card__header">
            <div>
              <h2 className="exb-card__title">Recent Applications</h2>
              <p className="exb-card__sub">Your most recent submissions</p>
            </div>
            <button className="exb-link" onClick={() => navigate("/exhibitor/my-applications")}>
              View all <ArrowRight size={14} />
            </button>
          </header>
          {recentApplications.length === 0 ? (
            <EmptyState
              icon={<FileText size={26} />}
              title="No applications yet"
              message="Browse expos and submit your first application."
              actionLabel="Browse Expos"
              onAction={() => navigate("/exhibitor/browse-expos")}
            />
          ) : (
            <ul className="exb-activity-list">
              {recentApplications.map((app) => (
                <li key={app._id || app.id} className="exb-activity-list__item">
                  <div className="exb-activity-list__left">
                    <span className="exb-activity-list__expo">
                      {app.expoId?.title || "Expo"}
                    </span>
                    <span className="exb-activity-list__date">
                      Submitted {fmtDate(app.createdAt)}
                    </span>
                  </div>
                  <div className="exb-activity-list__right">
                    <StatusBadge status={app.status} />
                    <button className="exb-link exb-link--sm" onClick={() => navigate("/exhibitor/my-applications")}>
                      View
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Booth Overview --- */}
        <div className="exb-card exb-dash__booth">
          <header className="exb-card__header">
            <div>
              <h2 className="exb-card__title">Booth Overview</h2>
              <p className="exb-card__sub">
                {myAllocation ? "Your allocated space" : "Request a booth"}
              </p>
            </div>
            <button className="exb-link" onClick={() => navigate("/exhibitor/my-booth")}>
              Details <ArrowRight size={14} />
            </button>
          </header>
          {myAllocation ? (
            <div className="exb-booth-panel">
              <div className="exb-booth-panel__badge">
                <MapPin size={16} /> {myAllocation.boothNumber}
              </div>
              <div className="exb-booth-panel__rows">
                <BoothRow label="Expo" value={myAllocation.expoId?.title} />
                <BoothRow label="Hall" value={myAllocation.hall} />
                <BoothRow label="Size" value={myAllocation.size} />
                <BoothRow label="Status" value={myAllocation.status} highlight />
              </div>
            </div>
          ) : (
            <EmptyState
              icon={<LayoutDashboard size={26} />}
              title="No booth allocated yet"
              message="Once your application is approved, request a preferred booth."
              actionLabel="Go to Booth Selection"
              onAction={() => navigate("/exhibitor/booth-selection")}
            />
          )}
        </div>

        {/* --- Upcoming Expos --- */}
        <div className="exb-card exb-dash__expos">
          <header className="exb-card__header">
            <div>
              <h2 className="exb-card__title">Upcoming Expos</h2>
              <p className="exb-card__sub">Don't miss these opportunities</p>
            </div>
            <button className="exb-link" onClick={() => navigate("/exhibitor/browse-expos")}>
              Browse <ArrowRight size={14} />
            </button>
          </header>
          {upcomingExpos.length === 0 ? (
            <EmptyState icon={<CalendarDays size={26} />} title="No upcoming expos" message="Check back soon." />
          ) : (
            <div className="exb-expo-list">
              {upcomingExpos.map((expo) => {
                const days = daysUntil(expo.startDate);
                return (
                  <div key={expo._id || expo.id} className="exb-expo-item">
                    <div className="exb-expo-item__img">
                      {expo.cover ? (
                        <img src={expo.cover.startsWith('http') ? expo.cover : `http://localhost:5000${expo.cover}`} alt={expo.title} />
                      ) : (
                        <div className="exb-expo-item__img-fallback">
                          <CalendarDays size={20} />
                        </div>
                      )}
                    </div>
                    <div className="exb-expo-item__info">
                      <p className="exb-expo-item__title">{expo.title}</p>
                      <p className="exb-expo-item__meta">
                        <MapPin size={12} /> {expo.venue || expo.city || "—"}
                      </p>
                      <p className="exb-expo-item__date">
                        <CalendarDays size={12} /> {fmtDate(expo.startDate)}
                        {days !== null && days >= 0 && (
                          <span className="exb-expo-item__countdown">in {days}d</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- Profile Completion --- */}
        <div className="exb-card exb-dash__profile">
          <header className="exb-card__header">
            <div>
              <h2 className="exb-card__title">Company Profile</h2>
              <p className="exb-card__sub">Complete your profile to stand out</p>
            </div>
            <button className="exb-link" onClick={() => navigate("/exhibitor/profile")}>
              Edit <ArrowRight size={14} />
            </button>
          </header>
          <div className="exb-progress">
            <div className="exb-progress__head">
              <span className="exb-progress__label">Completion</span>
              <span className="exb-progress__value">{completion}%</span>
            </div>
            <div className="exb-progress__track">
              <div className="exb-progress__fill" style={{ width: `${completion}%` }} />
            </div>
            {completion < 100 && (
              <p className="exb-progress__hint">
                <Sparkles size={14} /> Complete your profile for higher visibility.
              </p>
            )}
          </div>
          <div className="exb-profile-quick">
            <QuickStat icon={<Package size={16} />} label="Products" onClick={() => navigate("/exhibitor/products-services")} />
            <QuickStat icon={<Users size={16} />} label="Staff" onClick={() => navigate("/exhibitor/staff")} />
            <QuickStat icon={<Bell size={16} />} label={`${unreadCount} unread`} onClick={() => navigate("/exhibitor/notifications")} />
          </div>
        </div>

        {/* --- Recent Notifications --- */}
        <div className="exb-card exb-dash__notifs">
          <header className="exb-card__header">
            <div>
              <h2 className="exb-card__title">Recent Notifications</h2>
              <p className="exb-card__sub">Latest updates & announcements</p>
            </div>
            <button className="exb-link" onClick={() => navigate("/exhibitor/notifications")}>
              View all <ArrowRight size={14} />
            </button>
          </header>
          {notifications.length === 0 ? (
            <EmptyState icon={<Bell size={26} />} title="No notifications" message="You're all caught up." />
          ) : (
            <ul className="exb-notif-list">
              {notifications.map((n) => (
                <li key={n._id || n.id} className={`exb-notif-list__item ${!n.read ? "is-unread" : ""}`}>
                  <div className="exb-notif-list__dot" />
                  <div className="exb-notif-list__body">
                    <p className="exb-notif-list__title">{n.title}</p>
                    <p className="exb-notif-list__msg">{n.message}</p>
                    <span className="exb-notif-list__time">{fmtDate(n.createdAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* --- Quick Actions --- */}
        <div className="exb-card exb-dash__quick">
          <header className="exb-card__header">
            <h2 className="exb-card__title">Quick Actions</h2>
          </header>
          <div className="exb-quick-grid">
            <QuickAction icon={<CalendarDays size={20} />} label="Browse Expos" onClick={() => navigate("/exhibitor/browse-expos")} />
            <QuickAction icon={<Building2 size={20} />} label="Complete Profile" onClick={() => navigate("/exhibitor/profile")} />
            <QuickAction icon={<Package size={20} />} label="Manage Products" onClick={() => navigate("/exhibitor/products-services")} />
            <QuickAction icon={<FileText size={20} />} label="My Applications" onClick={() => navigate("/exhibitor/my-applications")} />
            <QuickAction icon={<Users size={20} />} label="Staff" onClick={() => navigate("/exhibitor/staff")} />
            <QuickAction icon={<Bell size={20} />} label="Contact Organizer" onClick={() => navigate("/exhibitor/communication")} />
          </div>
        </div>
      </section>
    </div>
  );
}

/* ---------- sub-components ---------- */
function KpiCard({ icon, label, value, tone = "neutral", onClick }) {
  return (
    <button className={`exb-kpi exb-kpi--${tone}`} onClick={onClick} type="button">
      <span className="exb-kpi__icon">{icon}</span>
      <span className="exb-kpi__body">
        <span className="exb-kpi__value">{value}</span>
        <span className="exb-kpi__label">{label}</span>
      </span>
    </button>
  );
}

function StatusBadge({ status }) {
  const s = String(status || "").toLowerCase();
  return <span className={`exb-badge exb-badge--${s || "neutral"}`}>{statusLabel(status)}</span>;
}

function BoothRow({ label, value, highlight }) {
  return (
    <div className="exb-booth-row">
      <span className="exb-booth-row__label">{label}</span>
      <span className={`exb-booth-row__value ${highlight ? "exb-booth-row__value--highlight" : ""}`}>{value || "—"}</span>
    </div>
  );
}

function QuickStat({ icon, label, onClick }) {
  return (
    <button className="exb-quick-stat" onClick={onClick} type="button">
      {icon}<span>{label}</span>
    </button>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button className="exb-quick-action" onClick={onClick} type="button">
      <span className="exb-quick-action__icon">{icon}</span>
      <span className="exb-quick-action__label">{label}</span>
    </button>
  );
}

function EmptyState({ icon, title, message, actionLabel, onAction }) {
  return (
    <div className="exb-empty">
      <div className="exb-empty__icon">{icon}</div>
      <p className="exb-empty__title">{title}</p>
      <p className="exb-empty__msg">{message}</p>
      {actionLabel && (
        <button className="exb-btn exb-btn--primary exb-btn--sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}