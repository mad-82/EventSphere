import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bookmark, BookmarkCheck, User, MapPin, Clock, Trash2, RefreshCw, AlertCircle } from "lucide-react";
import bookmarkService from "../../services/bookmarkService";
import "./BookmarkedSessions.css";

export default function BookmarkedSessions() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function loadBookmarks() {
    setLoading(true);
    try {
      const res = await bookmarkService.getMyBookmarks();
      setBookmarks(res.bookmarks || []);
    } catch (err) {
      setError(err.message || "Failed to load bookmarks.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBookmarks();
  }, []);

  const handleRemove = async (sessionId) => {
    if (!window.confirm("Remove this bookmark?")) return;
    try {
      await bookmarkService.toggle(sessionId);
      // UI se hatao
      setBookmarks((prev) =>
        prev.filter((b) => {
          const sId = b.sessionId?._id || b.sessionId;
          return sId !== sessionId;
        })
      );
    } catch (err) {
      alert("Failed to remove bookmark.");
    }
  };

  if (loading) return <div className="bms-page"><div className="bms-loading"><RefreshCw className="att-spin" /> Loading bookmarks...</div></div>;
  if (error) return <div className="bms-page"><div className="bms-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="bms-page">
      <header className="bms-header">
        <div>
          <h1>Bookmarked Sessions</h1>
          <p>Your favorite sessions saved for later.</p>
        </div>
        <button className="bms-btn" onClick={() => navigate("/attendee/schedule")}>
          <Bookmark size={16} /> Browse Schedule
        </button>
      </header>

      {bookmarks.length === 0 ? (
        <div className="bms-empty">
          <BookmarkCheck size={48} />
          <h3>No bookmarked sessions</h3>
          <p>Browse the schedule and bookmark sessions to see them here.</p>
          <button className="bms-btn bms-btn--primary" onClick={() => navigate("/attendee/schedule")}>
            View Schedule
          </button>
        </div>
      ) : (
        <div className="bms-grid">
          {bookmarks.map((b) => {
            // Backend populate karta hai "sessionId" field me
            const session = b.sessionId;
            if (!session) return null;
            const sessionId = session._id || session.id;

            return (
              <div key={b._id || sessionId} className="bms-card">
                <div className="bms-card__header">
                  <div className="bms-card__icon"><BookmarkCheck size={20} /></div>
                  <button className="bms-remove" onClick={() => handleRemove(sessionId)}>
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="bms-card__title">{session.title}</h3>
                <div className="bms-card__meta">
                  <span><User size={13} /> {session.speaker}</span>
                  <span><MapPin size={13} /> {session.room}</span>
                  <span><Clock size={13} /> {session.date} · {session.startTime} – {session.endTime}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}