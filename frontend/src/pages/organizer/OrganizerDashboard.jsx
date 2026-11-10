import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "./OrganizerDashboard.css";
import analyticsService from "../../services/analyticsService";

/* ============================================================
   ROUTES / QUICK ACTIONS
   ============================================================ */
const EXISTING_ROUTES = new Set([
  "/organizer/dashboard",
  "/organizer/expos",
  "/organizer/exhibitors",
  "/organizer/applications",
  "/organizer/booths",
  "/organizer/floor-plan",
  "/organizer/schedule",
  "/organizer/attendees",
  "/organizer/analytics",
  "/organizer/communication",
  "/organizer/notifications",
  "/organizer/feedback",
  "/organizer/profile",
]);

const QUICK_ACTIONS = [
  { id: "create-expo", label: "Create New Expo", to: "/organizer/expos" },
  {
    id: "review-apps",
    label: "Review Applications",
    to: "/organizer/applications",
  },
  {
    id: "manage-booths",
    label: "Manage Booths",
    to: "/organizer/booths",
  },
  {
    id: "add-session",
    label: "Add Schedule Session",
    to: "/organizer/schedule",
  },
];

/* ============================================================
   SUB-COMPONENTS
   ============================================================ */
function KpiCard({ label, value, change, trend, hint }) {
  const up = trend === "up";
  return (
    <div className="org-card dash-kpi">
      <span className="dash-kpi__label">{label}</span>
      <span className="dash-kpi__value">{(value ?? 0).toLocaleString()}</span>
      <div className="dash-kpi__meta">
        <span
          className={`dash-kpi__change dash-kpi__change--${
            up ? "up" : "down"
          }`}
        >
          {up ? "▲" : "▼"} {Math.abs(change ?? 0)}%
        </span>
        <span className="dash-kpi__hint">{hint}</span>
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`org-card dash-section ${className}`}>
      <header className="dash-section__head">
        <div>
          <h3 className="dash-section__title">{title}</h3>
          {subtitle && <p className="dash-section__subtitle">{subtitle}</p>}
        </div>
        {action}
      </header>
      <div className="dash-section__body">{children}</div>
    </section>
  );
}

const STATUS_BADGE = {
  Pending: "org-badge org-badge--warning",
  Approved: "org-badge org-badge--success",
  Rejected: "org-badge org-badge--danger",
  Draft: "org-badge org-badge--neutral",
  Published: "org-badge org-badge--success",
};

function ChartTooltipStyle() {
  return {
    contentStyle: {
      background: "#151D2B",
      border: "1px solid rgba(255,255,255,0.09)",
      borderRadius: 10,
      fontSize: 12,
      color: "#fff",
    },
    labelStyle: { color: "#A7B0C0", fontSize: 11, marginBottom: 4 },
    itemStyle: { color: "#fff", fontSize: 12 },
  };
}

const Empty = ({ text = "No data yet" }) => (
  <p style={{ color: "#6B7280", textAlign: "center", padding: 40 }}>{text}</p>
);

const Loader = ({ h = 260 }) => (
  <div
    style={{
      height: h,
      background:
        "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.03) 75%)",
      backgroundSize: "200% 100%",
      animation: "shimmer 1.4s infinite",
      borderRadius: 8,
    }}
  />
);

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function OrganizerDashboard() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboard();
      setData(res.data.dashboard);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err?.response?.data?.message || "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const boothStats = data?.boothStats || {
    total: 0,
    occupied: 0,
    reserved: 0,
    available: 0,
  };
  const occupancyPct =
    boothStats.total === 0
      ? 0
      : Math.round((boothStats.occupied / boothStats.total) * 100);

  return (
    <div className="dash">
      {/* Page header */}
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Dashboard</h1>
          <p className="org-page-header__subtitle">
            Overview of expos, exhibitors, attendees and live operations.
          </p>
        </div>
        <div className="org-page-header__actions">
          <button
            className="org-btn org-btn--secondary org-btn--sm"
            onClick={fetchDashboard}
            disabled={loading}
          >
            {loading ? "Loading..." : "↻ Refresh"}
          </button>
          <button
            className="org-btn org-btn--secondary org-btn--sm"
            onClick={() => navigate("/organizer/analytics")}
          >
            View Full Analytics
          </button>
          <button
            className="org-btn org-btn--primary org-btn--sm"
            onClick={() => navigate("/organizer/expos")}
          >
            + Create Expo
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div
          className="org-card"
          style={{ padding: 16, color: "#F87171", borderColor: "#F87171" }}
        >
          ⚠ {error} —{" "}
          <button
            onClick={fetchDashboard}
            style={{ textDecoration: "underline", color: "inherit" }}
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI grid */}
      <div className="dash-kpis">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="org-card dash-kpi">
                <Loader h={80} />
              </div>
            ))
          : (data?.kpis || []).map((k) => <KpiCard key={k.id} {...k} />)}
      </div>

      {/* Registration Trend + Application Status */}
      <div className="dash-grid dash-grid--2-1">
        <SectionCard
          title="Event Registration Trend"
          subtitle="Attendee registrations vs exhibitor signups, last 7 months"
        >
          {loading ? (
            <Loader />
          ) : !data?.registrationTrend?.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.registrationTrend}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="#6B7280"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip {...ChartTooltipStyle()} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#A7B0C0" }} />
                <Line
                  type="monotone"
                  dataKey="registrations"
                  stroke="#97BFD9"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="exhibitors"
                  stroke="#34D399"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Application Status" subtitle="Current distribution">
          {loading ? (
            <Loader />
          ) : !data?.applicationStatus?.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={data.applicationStatus}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  stroke="none"
                >
                  {data.applicationStatus.map((s) => (
                    <Cell key={s.name} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip {...ChartTooltipStyle()} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#A7B0C0" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Applications Overview + Booth Occupancy */}
      <div className="dash-grid dash-grid--2-1">
        <SectionCard
          title="Exhibitor Applications"
          subtitle="Weekly applications received, approved and rejected"
        >
          {loading ? (
            <Loader />
          ) : !data?.applicationOverview?.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.applicationOverview}>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="week"
                  stroke="#6B7280"
                  tick={{ fontSize: 11 }}
                />
                <YAxis stroke="#6B7280" tick={{ fontSize: 11 }} />
                <Tooltip {...ChartTooltipStyle()} />
                <Legend wrapperStyle={{ fontSize: 12, color: "#A7B0C0" }} />
                <Bar
                  dataKey="applications"
                  fill="#97BFD9"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="approved"
                  fill="#34D399"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="rejected"
                  fill="#F87171"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          title="Booth Occupancy"
          subtitle={`${boothStats.total} total booths`}
        >
          {loading ? (
            <Loader />
          ) : (
            <div className="dash-occupancy">
              <div className="dash-occupancy__bar">
                <div
                  className="dash-occupancy__bar-fill"
                  style={{ width: `${occupancyPct}%` }}
                />
              </div>
              <div className="dash-occupancy__pct">{occupancyPct}%</div>
              <ul className="dash-occupancy__legend">
                <li>
                  <span className="dot dot--occupied" />
                  Occupied · {boothStats.occupied}
                </li>
                <li>
                  <span className="dot dot--reserved" />
                  Reserved · {boothStats.reserved}
                </li>
                <li>
                  <span className="dot dot--available" />
                  Available · {boothStats.available}
                </li>
              </ul>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Attendee Categories + Upcoming Sessions */}
      <div className="dash-grid dash-grid--2-1">
        <SectionCard
          title="Attendee Registration by Category"
          subtitle="Distribution across attendee types"
        >
          {loading ? (
            <Loader />
          ) : !data?.attendeeCategory?.length ? (
            <Empty />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={data.attendeeCategory}
                layout="vertical"
                margin={{ left: 24 }}
              >
                <CartesianGrid
                  stroke="rgba(255,255,255,0.06)"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#6B7280"
                  tick={{ fontSize: 11 }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#6B7280"
                  tick={{ fontSize: 11 }}
                  width={140}
                />
                <Tooltip {...ChartTooltipStyle()} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {data.attendeeCategory.map((c) => (
                    <Cell key={c.name} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Upcoming Sessions" subtitle="Next 4 scheduled">
          {loading ? (
            <Loader />
          ) : !data?.upcomingSessions?.length ? (
            <Empty text="No upcoming sessions" />
          ) : (
            <ul className="dash-sessions">
              {data.upcomingSessions.map((s) => (
                <li key={s.id} className="dash-sessions__item">
                  <div className="dash-sessions__meta">
                    <span className="dash-sessions__title">{s.title}</span>
                    <span className="dash-sessions__sub">
                      {s.speaker} · {s.room}
                    </span>
                  </div>
                  <span className="dash-sessions__time">{s.when}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Recent Applications + Activity */}
      <div className="dash-grid dash-grid--2-1">
        <SectionCard
          title="Recent Exhibitor Applications"
          subtitle="Latest submissions"
          action={
            <button
              className="org-btn org-btn--ghost org-btn--sm"
              onClick={() => navigate("/organizer/applications")}
            >
              View all
            </button>
          }
        >
          {loading ? (
            <Loader />
          ) : !data?.recentApplications?.length ? (
            <Empty />
          ) : (
            <div className="dash-table-wrap">
              <table className="dash-table">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Contact</th>
                    <th>Industry</th>
                    <th>Booth</th>
                    <th>Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((a) => (
                    <tr key={a.id}>
                      <td>{a.company}</td>
                      <td>{a.contact}</td>
                      <td>{a.industry}</td>
                      <td>{a.size}</td>
                      <td>{a.submitted}</td>
                      <td>
                        <span
                          className={STATUS_BADGE[a.status] || "org-badge"}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Recent Activity" subtitle="Live feed">
          {loading ? (
            <Loader />
          ) : !data?.recentActivities?.length ? (
            <Empty />
          ) : (
            <ul className="dash-activity">
              {data.recentActivities.map((a) => (
                <li
                  key={a.id}
                  className={`dash-activity__item dash-activity__item--${a.type}`}
                >
                  <span className="dash-activity__dot" />
                  <span className="dash-activity__text">{a.text}</span>
                  <span className="dash-activity__time">{a.time}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Upcoming Events + Recent Registrations */}
      <div className="dash-grid dash-grid--1-1">
        <SectionCard
          title="Upcoming Events"
          subtitle="Next published and draft expos"
          action={
            <button
              className="org-btn org-btn--ghost org-btn--sm"
              onClick={() => navigate("/organizer/expos")}
            >
              View all
            </button>
          }
        >
          {loading ? (
            <Loader />
          ) : !data?.upcomingEvents?.length ? (
            <Empty />
          ) : (
            <ul className="dash-events">
              {data.upcomingEvents.map((e) => (
                <li key={e.id} className="dash-events__item">
                  <div className="dash-events__meta">
                    <span className="dash-events__name">{e.name}</span>
                    <span className="dash-events__sub">
                      {e.date} · {e.location}
                    </span>
                  </div>
                  <span className={STATUS_BADGE[e.status] || "org-badge"}>
                    {e.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Recent Registrations"
          subtitle="Newest attendee sign-ups"
        >
          {loading ? (
            <Loader />
          ) : !data?.recentRegistrations?.length ? (
            <Empty text="No recent registrations" />
          ) : (
            <ul className="dash-registrations">
              {data.recentRegistrations.map((r) => (
                <li key={r.id} className="dash-registrations__item">
                  <div className="dash-registrations__meta">
                    <span className="dash-registrations__name">{r.name}</span>
                    <span className="dash-registrations__sub">
                      {r.type} · {r.event}
                    </span>
                  </div>
                  <span className="dash-registrations__time">{r.time}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Pending Tasks + Quick Actions */}
      <div className="dash-grid dash-grid--1-1">
        <SectionCard
          title="Pending Tasks"
          subtitle="Items that need your attention"
        >
          {loading ? (
            <Loader h={140} />
          ) : !data?.pendingTasks?.length ? (
            <p style={{ color: "#34D399", padding: 20 }}>✓ All caught up!</p>
          ) : (
            <ul className="dash-tasks">
              {data.pendingTasks.map((t) => {
                const enabled = EXISTING_ROUTES.has(t.cta);
                return (
                  <li key={t.id} className="dash-tasks__item">
                    <span className="dash-tasks__text">{t.text}</span>
                    <button
                      className="org-btn org-btn--secondary org-btn--sm"
                      disabled={!enabled}
                      onClick={() => enabled && navigate(t.cta)}
                    >
                      {t.action}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="Quick Actions" subtitle="Common operations">
          <div className="dash-quick">
            {QUICK_ACTIONS.map((q) => {
              const enabled = EXISTING_ROUTES.has(q.to);
              return (
                <button
                  key={q.id}
                  className="dash-quick__btn"
                  disabled={!enabled}
                  onClick={() => enabled && navigate(q.to)}
                >
                  {q.label}
                </button>
              );
            })}
          </div>
          <p className="dash-quick__note">
            Actions become available as each module is implemented.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}