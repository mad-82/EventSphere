import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, User, MapPin, Bookmark, BookmarkCheck, RefreshCw, AlertCircle } from "lucide-react";
import scheduleService from "../../services/scheduleService";
import bookmarkService from "../../services/bookmarkService";
import "./AttendeeSchedule.css";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { weekday: "long", day: "2-digit", month: "long", year: "numeric" }) : "—";

export default function AttendeeSchedule() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]); // Array of session IDs
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [sessRes, bkmRes] = await Promise.all([
        scheduleService.list(),
        bookmarkService.getMyBookmarks().catch(() => ({ bookmarks: [] })),
      ]);
      setSessions(sessRes.sessions || []);

      // Bookmarks se sirf IDs nikaal lo
      const ids = (bkmRes.bookmarks || []).map((b) => {
        // Bookmark me sessionId ya populated object ho sakta hai
        if (b.sessionId?._id) return b.sessionId._id;
        if (b.sessionId) return b.sessionId;
        return null;
      }).filter(Boolean);

      setBookmarkedIds(ids);
    } catch (err) {
      setError(err.message || "Failed to load schedule.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleBookmark = async (sessionId) => {
    try {
      const res = await bookmarkService.toggle(sessionId);
      
      if (res.bookmarked) {
        setBookmarkedIds((prev) => [...prev, sessionId]);
      } else {
        setBookmarkedIds((prev) => prev.filter((id) => id !== sessionId));
      }
    } catch (err) {
      alert("Failed to toggle bookmark.");
    }
  };

  const isBookmarked = (id) => bookmarkedIds.includes(id);

  const groupedSessions = sessions.reduce((acc, session) => {
    const d = session.date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(session);
    return acc;
  }, {});

  if (loading) return <div className="attsch-page"><div className="attsch-loading"><RefreshCw className="att-spin" /> Loading schedule...</div></div>;
  if (error) return <div className="attsch-page"><div className="attsch-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="attsch-page">
      <header className="attsch-header">
        <div>
          <h1>Event Schedule</h1>
          <p>Sessions, workshops, and speakers across the expo.</p>
        </div>
        <button className="attsch-btn" onClick={() => navigate("/attendee/bookmarks")}>
          <BookmarkCheck size={16} /> View Bookmarks ({bookmarkedIds.length})
        </button>
      </header>

      {sessions.length === 0 ? (
        <div className="attsch-empty">
          <CalendarDays size={48} />
          <h3>No sessions available yet</h3>
          <p>Check back later for schedule updates.</p>
        </div>
      ) : (
        <div className="attsch-timeline">
          {Object.entries(groupedSessions).map(([date, daySessions]) => (
            <div key={date} className="attsch-day">
              <h2 className="attsch-day-title">{fmtDate(date)}</h2>
              <div className="attsch-day-sessions">
                {daySessions.map((s) => {
                  const id = s._id || s.id;
                  const active = isBookmarked(id);
                  return (
                    <div key={id} className="attsch-session">
                      <div className="attsch-session__time">
                        <span className="attsch-start">{s.startTime}</span>
                        <span className="attsch-end">{s.endTime}</span>
                      </div>
                      <div className="attsch-session__body">
                        <h3>{s.title}</h3>
                        <div className="attsch-meta">
                          <span><User size={13} /> {s.speaker}</span>
                          <span><MapPin size={13} /> {s.room}</span>
                        </div>
                        {s.description && <p className="attsch-desc">{s.description}</p>}
                      </div>
                      <button
                        className={`attsch-bookmark ${active ? "is-active" : ""}`}
                        onClick={() => handleToggleBookmark(id)}
                        title={active ? "Remove Bookmark" : "Bookmark Session"}
                      >
                        {active ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}