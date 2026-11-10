import { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { RefreshCw, AlertCircle } from "lucide-react";
import analyticsService from "../../services/analyticsService";
import "./AnalyticsReports.css";

const TOOLTIP_STYLE = {
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
const LEGEND_STYLE = { fontSize: 12, color: "#A7B0C0" };
const AXIS_STYLE = { fill: "#6B7280", fontSize: 11 };

export default function AnalyticsReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getAll();
      setData(res.data); // ✅ res.data, not res
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load analytics."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const handleExportCsv = () => {
    if (!data) return;
    const lines = [
      ["Analytics Export"],
      ["Generated", new Date().toLocaleString()],
      [],
      ["Event-wise Comparison"],
      ["Expo", "Exhibitors", "Attendees", "Sessions", "Satisfaction"],
      ...(data.eventComparison || []).map((e) => [
        e.name,
        e.exhibitors,
        e.attendees,
        e.sessions,
        e.satisfaction,
      ]),
    ];
    const csv = lines
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: "success", text: "Analytics exported as CSV." });
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="org-empty org-card">
          <RefreshCw className="att-spin" /> Loading analytics...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="analytics">
        <div
          className="org-empty org-card"
          style={{ color: "#b03a3a" }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  const {
    stats,
    registrationTrend,
    applicationAnalytics,
    boothOccupancy,
    sessionPopularity,
    eventComparison,
  } = data;

  return (
    <div className="analytics">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Analytics & Reports</h1>
          <p className="org-page-header__subtitle">
            Real-time metrics from your database.
          </p>
        </div>
        <div className="org-page-header__actions">
          <button
            className="org-btn org-btn--secondary org-btn--sm"
            onClick={loadData}
          >
            <RefreshCw size={14} /> Refresh
          </button>
          <button
            className="org-btn org-btn--secondary org-btn--sm"
            onClick={handleExportCsv}
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className="analytics-summary">
        <SummaryCard
          label="Total Expos"
          value={stats?.totalExpos?.toLocaleString() || 0}
        />
        <SummaryCard
          label="Total Attendees"
          value={stats?.totalAttendees?.toLocaleString() || 0}
        />
        <SummaryCard
          label="Total Exhibitors"
          value={stats?.totalExhibitors?.toLocaleString() || 0}
        />
        <SummaryCard
          label="Total Revenue"
          value={`PKR ${stats?.totalRevenue?.toLocaleString() || 0}`}
        />
      </div>

      {/* Charts grid */}
      <div className="analytics-grid analytics-grid--2-1">
        <ChartCard
          title="Overall Event Performance"
          subtitle="Revenue vs registrations (last 7 months)"
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={registrationTrend || []}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#97BFD9" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#97BFD9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="month" tick={AXIS_STYLE} stroke="#6B7280" />
              <YAxis tick={AXIS_STYLE} stroke="#6B7280" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Legend wrapperStyle={LEGEND_STYLE} />
              <Area
                type="monotone"
                dataKey="registrations"
                stroke="#97BFD9"
                strokeWidth={2}
                fill="url(#revenueGrad)"
              />
              <Line
                type="monotone"
                dataKey="exhibitors"
                stroke="#34D399"
                strokeWidth={2.5}
                dot={{ r: 3 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Application Analytics"
          subtitle="Submitted, approved, rejected"
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={[
                {
                  name: "Submitted",
                  value: applicationAnalytics?.submitted || 0,
                  fill: "#97BFD9",
                },
                {
                  name: "Approved",
                  value: applicationAnalytics?.approved || 0,
                  fill: "#34D399",
                },
                {
                  name: "Rejected",
                  value: applicationAnalytics?.rejected || 0,
                  fill: "#F87171",
                },
              ]}
            >
              <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis dataKey="name" tick={AXIS_STYLE} stroke="#6B7280" />
              <YAxis tick={AXIS_STYLE} stroke="#6B7280" />
              <Tooltip {...TOOLTIP_STYLE} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {[
                  { fill: "#97BFD9" },
                  { fill: "#34D399" },
                  { fill: "#F87171" },
                ].map((c, i) => (
                  <Cell key={i} fill={c.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Booth Occupancy */}
      <ChartCard
        title="Booth Occupancy by Expo"
        subtitle="Occupied vs reserved vs available"
        full
      >
        <div className="analytics-occupancy">
          {(boothOccupancy || []).length === 0 ? (
            <p style={{ color: "#A7B0C0", padding: 20 }}>
              No booth data available.
            </p>
          ) : (
            boothOccupancy.map((b) => {
              const occPct =
                b.total > 0 ? Math.round((b.occupied / b.total) * 100) : 0;
              return (
                <div key={b.expo} className="analytics-occupancy__row">
                  <div className="analytics-occupancy__meta">
                    <span className="analytics-occupancy__name">
                      {b.expo}
                    </span>
                    <span className="analytics-occupancy__count">
                      {b.occupied} / {b.total} ({occPct}%)
                    </span>
                  </div>
                  <div className="analytics-occupancy__bar">
                    <div
                      className="analytics-occupancy__fill analytics-occupancy__fill--occupied"
                      style={{
                        width: `${
                          b.total ? (b.occupied / b.total) * 100 : 0
                        }%`,
                      }}
                    />
                    <div
                      className="analytics-occupancy__fill analytics-occupancy__fill--reserved"
                      style={{
                        width: `${
                          b.total ? (b.reserved / b.total) * 100 : 0
                        }%`,
                      }}
                    />
                    <div
                      className="analytics-occupancy__fill analytics-occupancy__fill--available"
                      style={{
                        width: `${
                          b.total ? (b.available / b.total) * 100 : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ChartCard>

      {/* Session Popularity */}
      <ChartCard
        title="Session Popularity"
        subtitle="Registered vs capacity"
        full
      >
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={sessionPopularity || []}
            layout="vertical"
            margin={{ left: 24 }}
          >
            <CartesianGrid stroke="rgba(255,255,255,0.06)" horizontal={false} />
            <XAxis type="number" tick={AXIS_STYLE} stroke="#6B7280" />
            <YAxis
              type="category"
              dataKey="title"
              tick={AXIS_STYLE}
              stroke="#6B7280"
              width={140}
            />
            <Tooltip {...TOOLTIP_STYLE} />
            <Legend wrapperStyle={LEGEND_STYLE} />
            <Bar
              dataKey="capacity"
              fill="rgba(151,191,217,0.2)"
              radius={[0, 6, 6, 0]}
            />
            <Bar dataKey="registered" fill="#97BFD9" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Event-wise Comparison Table */}
      <ChartCard
        title="Event-wise Comparison"
        subtitle="Side-by-side metrics across expos"
        full
      >
        <div className="analytics-table-wrap">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>Expo</th>
                <th>Exhibitors</th>
                <th>Attendees</th>
                <th>Sessions</th>
                <th>Satisfaction</th>
              </tr>
            </thead>
            <tbody>
              {(eventComparison || []).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    style={{
                      textAlign: "center",
                      padding: 20,
                      color: "#A7B0C0",
                    }}
                  >
                    No data available.
                  </td>
                </tr>
              ) : (
                eventComparison.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <strong>{e.name}</strong>
                    </td>
                    <td>{e.exhibitors}</td>
                    <td>{e.attendees.toLocaleString()}</td>
                    <td>{e.sessions}</td>
                    <td>
                      <span className="analytics-satisfaction">
                        ★ {e.satisfaction.toFixed(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </ChartCard>

      {toast && (
        <div
          className={`expo-toast expo-toast--${toast.type}`}
          role="status"
        >
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ---------- Sub components ---------- */
function SummaryCard({ label, value }) {
  return (
    <div className="org-card analytics-summary__card">
      <span className="analytics-summary__label">{label}</span>
      <span className="analytics-summary__value">{value}</span>
    </div>
  );
}

function ChartCard({ title, subtitle, children, full }) {
  return (
    <section
      className={`org-card analytics-card ${
        full ? "analytics-card--full" : ""
      }`}
    >
      <header className="analytics-card__head">
        <h3 className="analytics-card__title">{title}</h3>
        <p className="analytics-card__subtitle">{subtitle}</p>
      </header>
      {children}
    </section>
  );
}