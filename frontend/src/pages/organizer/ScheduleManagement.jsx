import { useState, useEffect, useMemo, useRef } from "react";
import "./ScheduleManagement.css";
import scheduleService from "../../services/scheduleService";
import eventService from "../../services/eventService";

const TYPE_OPTIONS = ["Keynote", "Panel", "Workshop", "Networking", "Break"];
const STATUS_OPTIONS = ["Scheduled", "Cancelled"];

const TYPE_BADGE = {
  Keynote:    "org-badge org-badge--info",
  Panel:      "org-badge org-badge--neutral",
  Workshop:   "org-badge org-badge--warning",
  Networking: "org-badge org-badge--success",
  Break:      "org-badge",
};

const STATUS_BADGE = {
  Scheduled: "org-badge org-badge--info",
  Cancelled: "org-badge org-badge--danger",
};

const EMPTY_FORM = {
  title: "",
  description: "",
  type: "Keynote",
  speaker: "",
  expoId: "",
  date: "",
  startTime: "",
  endTime: "",
  room: "",
  capacity: "",
  status: "Scheduled",
};

/* ---------- Helpers ---------- */
function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(a, b) {
  const aStart = toMinutes(a.startTime);
  const aEnd = toMinutes(a.endTime);
  const bStart = toMinutes(b.startTime);
  const bEnd = toMinutes(b.endTime);
  if (aStart === null || aEnd === null || bStart === null || bEnd === null) return false;
  return aStart < bEnd && bStart < aEnd;
}

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime12(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/* ============================================================
   LIVE CLOCK COMPONENT
   ============================================================ */
function LiveClock({ nextSession }) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hours = now.getHours();
  const h12 = hours % 12 || 12;
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";

  const dateStr = now.toLocaleDateString(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="live-clock">
      <div className="live-clock__header">
        <span className="live-clock__icon">🕐</span>
        <span className="live-clock__label">Live Time</span>
      </div>

      <div className="live-clock__time">
        {h12}:{minutes}
        <span className="live-clock__seconds">:{seconds}</span>
        <span className="live-clock__ampm">{ampm}</span>
      </div>

      <div className="live-clock__date">{dateStr}</div>

      {nextSession && (
        <div className="live-clock__next">
          <span className="live-clock__next-label">⏭ Next Up</span>
          <span className="live-clock__next-title">{nextSession.title}</span>
          <span className="live-clock__next-time">
            {formatDate(nextSession.date)} · {formatTime12(nextSession.startTime)}
          </span>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   MINI CALENDAR COMPONENT
   ============================================================ */
function MiniCalendar({ sessions, selectedDate, onSelectDate }) {
  const [viewDate, setViewDate] = useState(() => {
    return selectedDate ? new Date(selectedDate + "T00:00:00") : new Date();
  });
  const [tooltip, setTooltip] = useState(null);
  const tooltipTimeout = useRef(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const monthName = viewDate.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  /* Map: "YYYY-MM-DD" -> [sessions] */
  const sessionsByDate = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    map.forEach((list) =>
      list.sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    );
    return map;
  }, [sessions]);

  /* Build the calendar grid */
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay(); // 0 = Sun
    const totalDays = lastDay.getDate();

    const arr = [];
    for (let i = 0; i < startOffset; i++) arr.push(null);
    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      arr.push({
        day: d,
        dateStr,
        sessions: sessionsByDate.get(dateStr) || [],
      });
    }
    return arr;
  }, [year, month, sessionsByDate]);

  const todayStr = new Date().toISOString().slice(0, 10);

  const prevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const nextMonth = () => setViewDate(new Date(year, month + 1, 1));

  const handleEnter = (e, cell) => {
    if (!cell || cell.sessions.length === 0) return;
    clearTimeout(tooltipTimeout.current);
    const rect = e.currentTarget.getBoundingClientRect();
    tooltipTimeout.current = setTimeout(() => {
      setTooltip({
        x: rect.left - 140,
        y: rect.top,
        date: cell.dateStr,
        sessions: cell.sessions,
      });
    }, 150);
  };

  const handleLeave = () => {
    clearTimeout(tooltipTimeout.current);
    setTooltip(null);
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar__head">
        <span className="mini-calendar__month">{monthName}</span>
        <div className="mini-calendar__nav">
          <button
            className="mini-calendar__nav-btn"
            onClick={prevMonth}
            aria-label="Previous month"
          >
            ‹
          </button>
          <button
            className="mini-calendar__nav-btn"
            onClick={nextMonth}
            aria-label="Next month"
          >
            ›
          </button>
        </div>
      </div>

      <div className="mini-calendar__weekdays">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div key={i} className="mini-calendar__weekday">{d}</div>
        ))}
      </div>

      <div className="mini-calendar__grid">
        {cells.map((cell, i) => {
          if (!cell) {
            return <div key={`e-${i}`} className="mini-calendar__cell mini-calendar__cell--empty" />;
          }
          const isToday = cell.dateStr === todayStr;
          const isSelected = cell.dateStr === selectedDate;
          const hasEvents = cell.sessions.length > 0;

          const classes = [
            "mini-calendar__cell",
            isToday && "mini-calendar__cell--today",
            isSelected && !isToday && "mini-calendar__cell--selected",
            hasEvents && "mini-calendar__cell--has-events",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <button
              key={cell.dateStr}
              type="button"
              className={classes}
              style={{ animationDelay: `${i * 8}ms` }}
              onClick={() => onSelectDate(selectedDate === cell.dateStr ? "" : cell.dateStr)}
              onMouseEnter={(e) => handleEnter(e, cell)}
              onMouseLeave={handleLeave}
            >
              {cell.day}
              {hasEvents && (
                <>
                  <span className="mini-calendar__cell-dot" />
                  {cell.sessions.length > 1 && (
                    <span className="mini-calendar__cell-count">
                      {cell.sessions.length}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </div>

      {/* Hover tooltip */}
      {tooltip && (
        <div
          className="calendar-tooltip"
          style={{ top: tooltip.y + 44, left: Math.max(10, tooltip.x) }}
        >
          <div className="calendar-tooltip__title">
            {new Date(tooltip.date + "T00:00:00").toLocaleDateString(undefined, {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </div>
          {tooltip.sessions.map((s) => (
            <div key={s.id} className="calendar-tooltip__item">
              <span className="calendar-tooltip__name">{s.title}</span>
              <span className="calendar-tooltip__meta">
                <span className="calendar-tooltip__badge">{s.type}</span>
                {formatTime12(s.startTime)} · {s.room}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SCHEDULE CARD
   ============================================================ */
function ScheduleCard({ session, onView, onEdit, onDelete, hasConflict }) {
  return (
    <div
      className={`schedule-card ${hasConflict ? "schedule-card--conflict" : ""}`}
      onClick={() => onView(session)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onView(session)}
    >
      <div className="schedule-card__time">
        <span className="schedule-card__time-start">{session.startTime}</span>
        <span className="schedule-card__time-end">{session.endTime}</span>
      </div>

      <div className="schedule-card__main">
        <span className="schedule-card__title">{session.title}</span>
        <div className="schedule-card__meta">
          <span className="schedule-card__meta-item">
            <span className="schedule-card__meta-icon">👤</span>
            {session.speaker}
          </span>
          <span className="schedule-card__meta-item">
            <span className="schedule-card__meta-icon">📍</span>
            {session.room}
          </span>
          <span className="schedule-card__meta-item">
            <span className="schedule-card__meta-icon">👥</span>
            {session.capacity}
          </span>
        </div>
        <div className="schedule-card__badges">
          <span className={TYPE_BADGE[session.type] || "org-badge"}>
            {session.type}
          </span>
          <span className={STATUS_BADGE[session.status] || "org-badge"}>
            {session.status}
          </span>
          {hasConflict && (
            <span className="org-badge org-badge--danger">Conflict</span>
          )}
        </div>
      </div>

      <div className="schedule-card__actions" onClick={(e) => e.stopPropagation()}>
        <button
          className="org-btn org-btn--ghost org-btn--sm"
          onClick={() => onView(session)}
        >
          View
        </button>
        <button
          className="org-btn org-btn--secondary org-btn--sm"
          onClick={() => onEdit(session)}
        >
          Edit
        </button>
        <button
          className="org-btn org-btn--danger org-btn--sm"
          onClick={() => onDelete(session)}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
export default function ScheduleManagement() {
  const [sessions, setSessions] = useState([]);
  const [expos, setExpos] = useState([]);
  const [loading, setLoading] = useState(true);

  const [view, setView] = useState("list");
  const [search, setSearch] = useState("");
  const [expoFilter, setExpoFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");

  const [modalMode, setModalMode] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [sessRes, expoRes] = await Promise.all([
        scheduleService.list(),
        eventService.list(),
      ]);
      setSessions(sessRes.sessions || []);
      setExpos(expoRes.expos || []);
    } catch (err) {
      showToast("error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  function showToast(type, text) {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3000);
  }

  /* Conflict detection */
  const conflictIds = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < sessions.length; i++) {
      for (let j = i + 1; j < sessions.length; j++) {
        const a = sessions[i];
        const b = sessions[j];
        if (
          a.expoId === b.expoId &&
          a.date === b.date &&
          a.room === b.room &&
          overlaps(a, b) &&
          a.status === "Scheduled" &&
          b.status === "Scheduled"
        ) {
          set.add(a.id);
          set.add(b.id);
        }
      }
    }
    return set;
  }, [sessions]);

  /* Filtered list */
  const filtered = useMemo(() => {
    let list = [...sessions];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.speaker.toLowerCase().includes(q)
      );
    }
    if (expoFilter !== "All") list = list.filter((s) => s.expoId === expoFilter);
    if (typeFilter !== "All") list = list.filter((s) => s.type === typeFilter);
    if (dateFilter) list = list.filter((s) => s.date === dateFilter);
    list.sort((a, b) => {
      const aKey = `${a.date}T${a.startTime}`;
      const bKey = `${b.date}T${b.startTime}`;
      return aKey < bKey ? -1 : aKey > bKey ? 1 : 0;
    });
    return list;
  }, [sessions, search, expoFilter, typeFilter, dateFilter]);

  /* Grouped by date for card view */
  const groupedByDate = useMemo(() => {
    const map = new Map();
    filtered.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    return Array.from(map.entries()).sort(([a], [b]) => (a < b ? -1 : 1));
  }, [filtered]);

  /* Stats */
  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const scoped =
      expoFilter === "All"
        ? sessions
        : sessions.filter((s) => s.expoId === expoFilter);
    return {
      total: scoped.length,
      today: scoped.filter((s) => s.date === today).length,
      upcoming: scoped.filter((s) => s.date > today).length,
      conflicts: scoped.filter((s) => conflictIds.has(s.id)).length,
    };
  }, [sessions, expoFilter, conflictIds]);

  /* Next upcoming session for clock widget */
  const nextSession = useMemo(() => {
    const now = new Date();
    const nowStr = now.toISOString().slice(0, 10);
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const upcoming = sessions
      .filter((s) => {
        if (s.status !== "Scheduled") return false;
        if (s.date > nowStr) return true;
        if (s.date === nowStr) {
          const sMin = toMinutes(s.startTime);
          return sMin !== null && sMin > nowMin;
        }
        return false;
      })
      .sort((a, b) => `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`));
    return upcoming[0] || null;
  }, [sessions]);

  const expoName = (id) => {
    const expo = expos.find((e) => e.id === id);
    return expo ? expo.title : "—";
  };

  const activeSession = activeId ? sessions.find((s) => s.id === activeId) : null;

  /* Handlers */
  const openCreate = () => {
    setModalMode("create");
    setActiveId(null);
    setForm({
      ...EMPTY_FORM,
      expoId: expoFilter !== "All" ? expoFilter : expos[0]?.id || "",
      date: dateFilter || new Date().toISOString().slice(0, 10),
    });
    setFormErrors({});
  };

  const openEdit = (session) => {
    setModalMode("edit");
    setActiveId(session.id);
    setForm({
      title: session.title,
      description: session.description || "",
      type: session.type,
      speaker: session.speaker,
      expoId: session.expoId,
      date: session.date,
      startTime: session.startTime,
      endTime: session.endTime,
      room: session.room,
      capacity: String(session.capacity || ""),
      status: session.status || "Scheduled",
    });
    setFormErrors({});
  };

  const openView = (session) => {
    setModalMode("view");
    setActiveId(session.id);
  };

  const closeModal = () => {
    setModalMode(null);
    setActiveId(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const validateForm = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = "Session title is required.";
    if (!form.speaker.trim()) errs.speaker = "Speaker is required.";
    if (!form.expoId) errs.expoId = "Expo is required.";
    if (!form.date) errs.date = "Date is required.";
    if (!form.startTime) errs.startTime = "Start time is required.";
    if (!form.endTime) errs.endTime = "End time is required.";
    if (!form.room.trim()) errs.room = "Room / venue is required.";
    if (!form.capacity || Number(form.capacity) <= 0)
      errs.capacity = "Capacity must be greater than 0.";

    if (form.startTime && form.endTime) {
      const start = toMinutes(form.startTime);
      const end = toMinutes(form.endTime);
      if (end <= start) errs.endTime = "End time must be after start time.";
    }

    if (
      form.expoId &&
      form.date &&
      form.room.trim() &&
      form.startTime &&
      form.endTime &&
      !errs.endTime
    ) {
      const clash = sessions.find(
        (s) =>
          s.id !== activeId &&
          s.expoId === form.expoId &&
          s.date === form.date &&
          s.room.trim() === form.room.trim() &&
          s.status === "Scheduled" &&
          form.status === "Scheduled" &&
          overlaps({ startTime: form.startTime, endTime: form.endTime }, s)
      );
      if (clash)
        errs.room = `Room conflicts with "${clash.title}" (${clash.startTime}–${clash.endTime}).`;
    }
    return errs;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFormErrors(errs);
      return;
    }

    setSaving(true);
    try {
      if (modalMode === "create") {
        await scheduleService.create(form);
        showToast("success", `"${form.title}" scheduled.`);
      } else if (modalMode === "edit" && activeSession) {
        await scheduleService.update(activeSession.id, form);
        showToast("success", `"${form.title}" updated.`);
      }
      closeModal();
      loadData();
    } catch (err) {
      showToast("error", err.message || "Failed to save session.");
    } finally {
      setSaving(false);
    }
  };

  const requestDelete = (session) => setConfirmDeleteId(session.id);

  const confirmDelete = async () => {
    const target = sessions.find((s) => s.id === confirmDeleteId);
    if (!target) return;
    try {
      await scheduleService.remove(confirmDeleteId);
      showToast("success", `"${target.title}" deleted.`);
      setConfirmDeleteId(null);
      loadData();
    } catch (err) {
      showToast("error", err.message || "Delete failed.");
    }
  };

  if (loading) {
    return <div className="org-empty org-card">Loading schedule from database...</div>;
  }

  return (
    <div className="schedule">
      {/* Page header */}
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Schedule Management</h1>
          <p className="org-page-header__subtitle">
            Plan sessions, manage speakers and rooms, and resolve scheduling conflicts.
          </p>
        </div>
        <div className="org-page-header__actions">
          <div className="schedule-view-toggle">
            <button
              type="button"
              className={`schedule-view-toggle__btn ${view === "list" ? "is-active" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
            <button
              type="button"
              className={`schedule-view-toggle__btn ${view === "calendar" ? "is-active" : ""}`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
          </div>
          <button className="org-btn org-btn--primary org-btn--sm" onClick={openCreate}>
            + Add Session
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="schedule-stats">
        <div className="org-card schedule-stat">
          <span className="schedule-stat__label">Total Sessions</span>
          <span className="schedule-stat__value">{stats.total}</span>
        </div>
        <div className="org-card schedule-stat schedule-stat--today">
          <span className="schedule-stat__label">Today</span>
          <span className="schedule-stat__value">{stats.today}</span>
        </div>
        <div className="org-card schedule-stat schedule-stat--upcoming">
          <span className="schedule-stat__label">Upcoming</span>
          <span className="schedule-stat__value">{stats.upcoming}</span>
        </div>
        <div className="org-card schedule-stat schedule-stat--conflicts">
          <span className="schedule-stat__label">Conflicts</span>
          <span className="schedule-stat__value">{stats.conflicts}</span>
        </div>
      </div>

      {/* Two-column layout: left = filters + cards, right = clock + calendar */}
      <div className="schedule-layout">
        {/* LEFT */}
        <div className="schedule-left">
          <div className="schedule-filters">
            <input
              type="search"
              className="org-input"
              placeholder="Search by title or speaker…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="org-select"
              value={expoFilter}
              onChange={(e) => setExpoFilter(e.target.value)}
            >
              <option value="All">All expos</option>
              {expos.map((e) => (
                <option key={e.id} value={e.id}>{e.title}</option>
              ))}
            </select>
            <select
              className="org-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All types</option>
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <input
              type="date"
              className="org-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {filtered.length === 0 ? (
            <div className="org-empty">
              <p className="org-empty__title">No sessions found</p>
              <p className="org-empty__desc">Add your first session to the schedule.</p>
              <button className="org-btn org-btn--primary org-btn--sm" onClick={openCreate}>
                + Add Session
              </button>
            </div>
          ) : view === "list" ? (
            <div className="schedule-cards">
              {groupedByDate.map(([date, list], idx) => (
                <div
                  key={date}
                  className="schedule-day-group"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <header className="schedule-day-group__head">
                    <span className="schedule-day-group__date">{formatDate(date)}</span>
                    <span className="schedule-day-group__count">
                      {list.length} session{list.length !== 1 ? "s" : ""}
                    </span>
                  </header>
                  <div className="schedule-day-group__body">
                    {list.map((s) => (
                      <ScheduleCard
                        key={s.id}
                        session={s}
                        hasConflict={conflictIds.has(s.id)}
                        onView={openView}
                        onEdit={openEdit}
                        onDelete={requestDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <ScheduleCalendarView
              sessions={filtered}
              conflictIds={conflictIds}
              onView={openView}
            />
          )}
        </div>

        {/* RIGHT RAIL — Clock + Calendar */}
        <aside className="schedule-right-rail">
          <LiveClock nextSession={nextSession} />
          <MiniCalendar
            sessions={sessions}
            selectedDate={dateFilter}
            onSelectDate={setDateFilter}
          />
        </aside>
      </div>

      {/* View modal */}
      {modalMode === "view" && activeSession && (
        <div className="schedule-modal-backdrop" onClick={closeModal}>
          <div className="schedule-modal" onClick={(ev) => ev.stopPropagation()}>
            <header className="schedule-modal__head">
              <div>
                <h2>{activeSession.title}</h2>
                <p className="schedule-modal__sub">
                  {expoName(activeSession.expoId)} · {activeSession.date} ·{" "}
                  {activeSession.startTime}–{activeSession.endTime}
                </p>
              </div>
              <button
                type="button"
                className="schedule-modal__close"
                onClick={closeModal}
              >
                ×
              </button>
            </header>

            <div className="schedule-modal__meta">
              <span className={TYPE_BADGE[activeSession.type] || "org-badge"}>
                {activeSession.type}
              </span>
              <span className={STATUS_BADGE[activeSession.status] || "org-badge"}>
                {activeSession.status}
              </span>
              {conflictIds.has(activeSession.id) && (
                <span className="org-badge org-badge--danger">Conflict</span>
              )}
            </div>

            <section className="schedule-modal__section">
              <h3>Description</h3>
              <p className="schedule-modal__text">
                {activeSession.description || "—"}
              </p>
            </section>

            <section className="schedule-modal__section">
              <h3>Details</h3>
              <dl className="schedule-kv">
                <div><dt>Speaker</dt><dd>{activeSession.speaker}</dd></div>
                <div><dt>Room</dt><dd>{activeSession.room}</dd></div>
                <div><dt>Capacity</dt><dd>{activeSession.capacity}</dd></div>
              </dl>
            </section>

            <footer className="schedule-modal__actions">
              <button className="org-btn org-btn--secondary" onClick={closeModal}>
                Close
              </button>
              <button
                className="org-btn org-btn--primary"
                onClick={() => openEdit(activeSession)}
              >
                Edit
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Create / Edit modal */}
      {(modalMode === "create" || modalMode === "edit") && (
        <div className="schedule-modal-backdrop" onClick={closeModal}>
          <div className="schedule-modal" onClick={(ev) => ev.stopPropagation()}>
            <header className="schedule-modal__head">
              <h2>{modalMode === "create" ? "Add Session" : "Edit Session"}</h2>
              <button
                type="button"
                className="schedule-modal__close"
                onClick={closeModal}
              >
                ×
              </button>
            </header>

            <form className="schedule-form" onSubmit={handleSave} noValidate>
              <div className="schedule-form__grid">
                <div className="schedule-form__field schedule-form__field--full">
                  <label>Session Title *</label>
                  <input
                    className="org-input"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. AI in Retail Operations"
                  />
                  {formErrors.title && (
                    <span className="schedule-form__error">{formErrors.title}</span>
                  )}
                </div>

                <div className="schedule-form__field schedule-form__field--full">
                  <label>Description</label>
                  <textarea
                    className="org-textarea"
                    rows={3}
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Short overview of the session."
                  />
                </div>

                <div className="schedule-form__field">
                  <label>Session Type</label>
                  <select
                    className="org-select"
                    value={form.type}
                    onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                  >
                    {TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="schedule-form__field">
                  <label>Speaker *</label>
                  <input
                    className="org-input"
                    value={form.speaker}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, speaker: e.target.value }))
                    }
                    placeholder="Speaker name"
                  />
                  {formErrors.speaker && (
                    <span className="schedule-form__error">{formErrors.speaker}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Expo *</label>
                  <select
                    className="org-select"
                    value={form.expoId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, expoId: e.target.value }))
                    }
                  >
                    <option value="">Select expo</option>
                    {expos.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  {formErrors.expoId && (
                    <span className="schedule-form__error">{formErrors.expoId}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Date *</label>
                  <input
                    type="date"
                    className="org-input"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                  {formErrors.date && (
                    <span className="schedule-form__error">{formErrors.date}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    className="org-input"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, startTime: e.target.value }))
                    }
                  />
                  {formErrors.startTime && (
                    <span className="schedule-form__error">{formErrors.startTime}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>End Time *</label>
                  <input
                    type="time"
                    className="org-input"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, endTime: e.target.value }))
                    }
                  />
                  {formErrors.endTime && (
                    <span className="schedule-form__error">{formErrors.endTime}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Room / Venue *</label>
                  <input
                    className="org-input"
                    value={form.room}
                    onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                    placeholder="e.g. Hall A · Main Stage"
                  />
                  {formErrors.room && (
                    <span className="schedule-form__error">{formErrors.room}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Capacity *</label>
                  <input
                    type="number"
                    min="1"
                    className="org-input"
                    value={form.capacity}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, capacity: e.target.value }))
                    }
                  />
                  {formErrors.capacity && (
                    <span className="schedule-form__error">{formErrors.capacity}</span>
                  )}
                </div>

                <div className="schedule-form__field">
                  <label>Status</label>
                  <select
                    className="org-select"
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, status: e.target.value }))
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <footer className="schedule-form__actions">
                <button
                  type="button"
                  className="org-btn org-btn--secondary"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="org-btn org-btn--primary"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : modalMode === "create"
                    ? "Create Session"
                    : "Save Changes"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId && (
        <div
          className="schedule-modal-backdrop"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="schedule-modal schedule-modal--sm"
            onClick={(ev) => ev.stopPropagation()}
          >
            <header className="schedule-modal__head">
              <h2 className="schedule-confirm__title">Delete session?</h2>
              <button
                type="button"
                className="schedule-modal__close"
                onClick={() => setConfirmDeleteId(null)}
              >
                ×
              </button>
            </header>
            <p className="schedule-confirm__text">
              This will permanently remove the session from the schedule.
            </p>
            <footer className="schedule-form__actions">
              <button
                className="org-btn org-btn--secondary"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="org-btn org-btn--danger"
                onClick={confirmDelete}
              >
                Yes, delete
              </button>
            </footer>
          </div>
        </div>
      )}

      {toast && (
        <div className={`schedule-toast schedule-toast--${toast.type}`} role="status">
          {toast.text}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   Calendar view (existing mode)
   ============================================================ */
function ScheduleCalendarView({ sessions, conflictIds, onView }) {
  const grouped = useMemo(() => {
    const map = new Map();
    sessions.forEach((s) => {
      if (!map.has(s.date)) map.set(s.date, []);
      map.get(s.date).push(s);
    });
    const arr = Array.from(map.entries());
    arr.forEach(([, list]) =>
      list.sort((a, b) => (a.startTime < b.startTime ? -1 : 1))
    );
    return arr;
  }, [sessions]);

  return (
    <div className="schedule-calendar">
      {grouped.map(([date, list]) => (
        <div key={date} className="schedule-calendar__day">
          <header className="schedule-calendar__day-head">
            <span className="schedule-calendar__date">{formatDate(date)}</span>
            <span className="schedule-calendar__day-count">
              {list.length} session{list.length !== 1 ? "s" : ""}
            </span>
          </header>
          <div className="schedule-calendar__timeline">
            {list.map((s) => {
              const startMin = toMinutes(s.startTime);
              const endMin = toMinutes(s.endTime);
              const top = ((startMin - 8 * 60) / (14 * 60)) * 100;
              const height = ((endMin - startMin) / (14 * 60)) * 100;
              return (
                <button
                  key={s.id}
                  type="button"
                  className={`schedule-calendar__block schedule-calendar__block--${s.type.toLowerCase()} ${
                    conflictIds.has(s.id) ? "schedule-calendar__block--conflict" : ""
                  }`}
                  style={{
                    top: `${Math.max(0, top)}%`,
                    height: `${Math.max(4, height)}%`,
                  }}
                  onClick={() => onView(s)}
                  title={`${s.title} · ${s.startTime}–${s.endTime}`}
                >
                  <span className="schedule-calendar__block-title">{s.title}</span>
                  <span className="schedule-calendar__block-meta">
                    {s.startTime} · {s.room}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}