import { useState, useEffect, useMemo } from "react";
import attendeeService from "../../services/attendeeService";
import "./AttendeeManagement.css";

const TYPE_OPTIONS = ["All", "Professional", "Press", "Student", "Exhibitor Guest"];
const ATTENDANCE_OPTIONS = ["All", "Confirmed", "Pending", "Checked-In", "Cancelled"];

const ATTENDANCE_BADGE = {
  Confirmed:    "org-badge org-badge--info",
  Pending:      "org-badge org-badge--warning",
  "Checked-In": "org-badge org-badge--success",
  Cancelled:    "org-badge org-badge--danger",
};

const PAGE_SIZE = 8;

/* Helpers */
function getInitials(name = "") {
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

function getAvatarGradient(name = "") {
  const palettes = [
    "linear-gradient(135deg, #97BFD9 0%, #6FA8CB 100%)",
    "linear-gradient(135deg, #6FA8CB 0%, #4A7C9B 100%)",
    "linear-gradient(135deg, #B5D7EA 0%, #97BFD9 100%)",
    "linear-gradient(135deg, #97BFD9 0%, #4A7C9B 100%)",
    "linear-gradient(135deg, #6FA8CB 0%, #B5D7EA 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}

export default function AttendeeManagement() {
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [expoFilter, setExpoFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [attendanceFilter, setAttendanceFilter] = useState("All");
  const [page, setPage] = useState(1);

  const [detailId, setDetailId] = useState(null);
  const [confirmCancelId, setConfirmCancelId] = useState(null);
  const [toast, setToast] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  /* Fetch on mount */
  useEffect(() => {
    loadAttendees();
  }, []);

  async function loadAttendees() {
    setLoading(true);
    try {
      const res = await attendeeService.getAll();
      setAttendees(res.data.attendees || []);
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || "Failed to load attendees.",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* Unique expos list from data */
  const exposList = useMemo(() => {
    const map = new Map();
    attendees.forEach((a) => {
      if (a.expoId && a.expoName && !map.has(a.expoId)) {
        map.set(a.expoId, a.expoName);
      }
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [attendees]);

  const expoName = (id) => {
    const found = exposList.find((e) => e.id === id);
    return found?.name || "—";
  };

  /* Stats */
  const stats = useMemo(() => {
    const scoped =
      expoFilter === "All"
        ? attendees
        : attendees.filter((a) => a.expoId === expoFilter);
    return {
      total: scoped.length,
      confirmed: scoped.filter((a) => a.attendance === "Confirmed").length,
      checkedIn: scoped.filter((a) => a.attendance === "Checked-In").length,
      pending: scoped.filter((a) => a.attendance === "Pending").length,
    };
  }, [attendees, expoFilter]);

  /* Filtered */
  const filtered = useMemo(() => {
    let list = [...attendees];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q) ||
          (a.registrationId || "").toLowerCase().includes(q)
      );
    }
    if (expoFilter !== "All") list = list.filter((a) => a.expoId === expoFilter);
    if (typeFilter !== "All") list = list.filter((a) => a.type === typeFilter);
    if (attendanceFilter !== "All") list = list.filter((a) => a.attendance === attendanceFilter);
    list.sort((a, b) =>
      a.registeredDate < b.registeredDate ? 1 : -1
    );
    return list;
  }, [attendees, search, expoFilter, typeFilter, attendanceFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const detail = detailId ? attendees.find((a) => a.id === detailId) : null;

  /* Actions */
  const handleCheckIn = async (id) => {
    setActionLoadingId(id);
    try {
      await attendeeService.checkIn(id);
      setAttendees((list) =>
        list.map((a) =>
          a.id === id
            ? { ...a, attendance: "Checked-In", checkedInAt: new Date().toISOString() }
            : a
        )
      );
      const target = attendees.find((a) => a.id === id);
      setToast({ type: "success", text: `${target?.name || "Attendee"} checked in.` });
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || "Check-in failed.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUndoCheckIn = async (id) => {
    setActionLoadingId(id);
    try {
      await attendeeService.undoCheckIn(id);
      setAttendees((list) =>
        list.map((a) =>
          a.id === id ? { ...a, attendance: "Confirmed", checkedInAt: null } : a
        )
      );
      const target = attendees.find((a) => a.id === id);
      setToast({ type: "success", text: `Check-in undone for ${target?.name || "attendee"}.` });
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || "Failed to undo check-in.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const requestCancel = (id) => setConfirmCancelId(id);

  const confirmCancel = async () => {
    const id = confirmCancelId;
    const target = attendees.find((a) => a.id === id);
    setConfirmCancelId(null);
    setActionLoadingId(id);
    try {
      await attendeeService.cancel(id);
      setAttendees((list) =>
        list.map((a) =>
          a.id === id ? { ...a, attendance: "Cancelled", checkedInAt: null } : a
        )
      );
      if (target) setToast({ type: "success", text: `Registration cancelled for ${target.name}.` });
    } catch (err) {
      setToast({
        type: "error",
        text: err?.response?.data?.message || "Cancel failed.",
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleExportCsv = () => {
    const csv = [
      ["Name", "Email", "Registration ID", "Expo", "Type", "Registered", "Attendance", "Company"],
      ...filtered.map((a) => [
        a.name, a.email, a.registrationId, expoName(a.expoId), a.type,
        a.registeredDate, a.attendance, a.company,
      ]),
    ]
      .map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attendees.csv";
    a.click();
    URL.revokeObjectURL(url);
    setToast({ type: "success", text: `Exported ${filtered.length} attendee(s).` });
  };

  /* Render */
  return (
    <div className="attendees">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Attendee Management</h1>
          <p className="org-page-header__subtitle">
            Browse registrations, check attendees in, and manage their status.
          </p>
        </div>
        <div className="org-page-header__actions">
          <button className="org-btn org-btn--secondary org-btn--sm" onClick={loadAttendees}>
            ↻ Refresh
          </button>
          <button className="org-btn org-btn--secondary org-btn--sm" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="attendees-stats">
        <div className="org-card attendees-stat">
          <span className="attendees-stat__label">Total Registered</span>
          <span className="attendees-stat__value">{loading ? "—" : stats.total}</span>
        </div>
        <div className="org-card attendees-stat attendees-stat--confirmed">
          <span className="attendees-stat__label">Confirmed</span>
          <span className="attendees-stat__value">{loading ? "—" : stats.confirmed}</span>
        </div>
        <div className="org-card attendees-stat attendees-stat--checked-in">
          <span className="attendees-stat__label">Checked-In</span>
          <span className="attendees-stat__value">{loading ? "—" : stats.checkedIn}</span>
        </div>
        <div className="org-card attendees-stat attendees-stat--pending">
          <span className="attendees-stat__label">Pending</span>
          <span className="attendees-stat__value">{loading ? "—" : stats.pending}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="attendees-filters org-card">
        <input
          type="search"
          className="org-input"
          placeholder="Search by name, email or registration ID…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <select
          className="org-select"
          value={expoFilter}
          onChange={(e) => { setExpoFilter(e.target.value); setPage(1); }}
        >
          <option value="All">All expos</option>
          {exposList.map((e) => (
            <option key={e.id} value={e.id}>{e.name}</option>
          ))}
        </select>
        <select
          className="org-select"
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All types" : t}</option>
          ))}
        </select>
        <select
          className="org-select"
          value={attendanceFilter}
          onChange={(e) => { setAttendanceFilter(e.target.value); setPage(1); }}
        >
          {ATTENDANCE_OPTIONS.map((o) => (
            <option key={o} value={o}>{o === "All" ? "All statuses" : o}</option>
          ))}
        </select>
      </div>

      {/* Table / states */}
      {loading ? (
        <div className="org-empty org-card">Loading attendees...</div>
      ) : paged.length === 0 ? (
        <div className="attendees-empty org-card">
          <div className="attendees-empty__icon">👥</div>
          <p className="attendees-empty__title">No attendees found</p>
          <p className="attendees-empty__desc">
            Try adjusting the search or filters.
          </p>
        </div>
      ) : (
        <div className="attendees-table-wrap org-card">
          <table className="attendees-table">
            <thead>
              <tr>
                <th>Attendee</th>
                <th>Registration ID</th>
                <th>Expo</th>
                <th>Type</th>
                <th>Registered</th>
                <th>Attendance</th>
                <th style={{ width: 210 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((a) => {
                const busy = actionLoadingId === a.id;
                return (
                  <tr key={a.id}>
                    <td>
                      <div className="attendees-name-cell">
                        <div
                          className="attendees-avatar"
                          style={{ background: getAvatarGradient(a.name) }}
                        >
                          {getInitials(a.name)}
                        </div>
                        <div className="attendees-name-text">
                          <span className="attendees-name">{a.name}</span>
                          <span className="attendees-email">{a.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><code className="attendees-reg-id">{a.registrationId}</code></td>
                    <td>{expoName(a.expoId)}</td>
                    <td>{a.type}</td>
                    <td>{a.registeredDate}</td>
                    <td>
                      <span className={ATTENDANCE_BADGE[a.attendance] || "org-badge"}>
                        {a.attendance}
                      </span>
                    </td>
                    <td>
                      <div className="attendees-actions">
                        <button
                          className="org-btn org-btn--ghost org-btn--sm"
                          onClick={() => setDetailId(a.id)}
                          disabled={busy}
                        >
                          View
                        </button>
                        {(a.attendance === "Confirmed" || a.attendance === "Pending") && (
                          <button
                            className="org-btn org-btn--primary org-btn--sm"
                            onClick={() => handleCheckIn(a.id)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Check In"}
                          </button>
                        )}
                        {a.attendance === "Checked-In" && (
                          <button
                            className="org-btn org-btn--secondary org-btn--sm"
                            onClick={() => handleUndoCheckIn(a.id)}
                            disabled={busy}
                          >
                            {busy ? "..." : "Undo"}
                          </button>
                        )}
                        {a.attendance !== "Cancelled" && (
                          <button
                            className="org-btn org-btn--danger org-btn--sm"
                            onClick={() => requestCancel(a.id)}
                            disabled={busy}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="attendees-pagination">
          <span className="attendees-pagination__info">
            Page {safePage} of {totalPages} · {filtered.length} total
          </span>
          <div className="attendees-pagination__controls">
            <button
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
            >
              ← Prev
            </button>
            <button
              className="org-btn org-btn--secondary org-btn--sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="attendees-modal-backdrop" onClick={() => setDetailId(null)}>
          <div className="attendees-modal" onClick={(ev) => ev.stopPropagation()}>
            <header className="attendees-modal__head">
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div
                  className="attendees-avatar attendees-avatar--lg"
                  style={{ background: getAvatarGradient(detail.name) }}
                >
                  {getInitials(detail.name)}
                </div>
                <div>
                  <h2>{detail.name}</h2>
                  <p className="attendees-modal__sub">{detail.email}</p>
                </div>
              </div>
              <button className="attendees-modal__close" onClick={() => setDetailId(null)}>×</button>
            </header>

            <div className="attendees-modal__meta">
              <span className={ATTENDANCE_BADGE[detail.attendance] || "org-badge"}>
                {detail.attendance}
              </span>
              <span className="org-badge org-badge--neutral">{detail.type}</span>
              <span className="org-badge org-badge--info">{detail.registrationId}</span>
            </div>

            <section className="attendees-modal__section">
              <h3>Registration Details</h3>
              <dl className="attendees-kv">
                <div><dt>Expo</dt><dd>{expoName(detail.expoId)}</dd></div>
                <div><dt>Registered</dt><dd>{detail.registeredDate}</dd></div>
                <div><dt>Company</dt><dd>{detail.company}</dd></div>
                <div><dt>Phone</dt><dd>{detail.phone}</dd></div>
                <div><dt>Sessions</dt><dd>{detail.sessionsRegistered}</dd></div>
                {detail.checkedInAt && (
                  <div><dt>Checked in</dt><dd>{new Date(detail.checkedInAt).toLocaleString()}</dd></div>
                )}
              </dl>
            </section>

            <footer className="attendees-modal__actions">
              <button className="org-btn org-btn--secondary" onClick={() => setDetailId(null)}>
                Close
              </button>
              {(detail.attendance === "Confirmed" || detail.attendance === "Pending") && (
                <button
                  className="org-btn org-btn--primary"
                  onClick={() => { handleCheckIn(detail.id); setDetailId(null); }}
                >
                  Check In
                </button>
              )}
              {detail.attendance === "Checked-In" && (
                <button
                  className="org-btn org-btn--secondary"
                  onClick={() => { handleUndoCheckIn(detail.id); setDetailId(null); }}
                >
                  Undo Check-In
                </button>
              )}
            </footer>
          </div>
        </div>
      )}

      {/* Cancel confirmation */}
      {confirmCancelId && (
        <div className="attendees-modal-backdrop" onClick={() => setConfirmCancelId(null)}>
          <div className="attendees-modal attendees-modal--sm" onClick={(ev) => ev.stopPropagation()}>
            <header className="attendees-modal__head">
              <h2 className="attendees-confirm__title">Cancel registration?</h2>
              <button className="attendees-modal__close" onClick={() => setConfirmCancelId(null)}>×</button>
            </header>
            <p className="attendees-confirm__text">
              The attendee will be marked as cancelled and any check-in will be revoked. This action cannot be undone from this screen.
            </p>
            <footer className="attendees-modal__actions">
              <button
                className="org-btn org-btn--secondary"
                onClick={() => setConfirmCancelId(null)}
              >
                Keep registration
              </button>
              <button
                className="org-btn org-btn--danger"
                onClick={confirmCancel}
              >
                Yes, cancel
              </button>
            </footer>
          </div>
        </div>
      )}

      {toast && (
        <div className={`expo-toast expo-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}