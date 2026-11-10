import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../hooks/useNotifications";
import "./NotificationBell.css";

export default function NotificationBell() {
  const navigate = useNavigate();
  const { unreadCount, notifications, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  /* Close on route change */
  useEffect(() => {
    setOpen(false);
  }, [navigate]);

  const recent = notifications.slice(0, 5);

  const handleViewAll = () => {
    setOpen(false);
    navigate("/organizer/notifications");
  };

  const handleItemClick = (n) => {
    if (n.unread) markRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="nb" ref={dropdownRef}>
      <button
        type="button"
        className="nb__button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.7 21a2 2 0 0 1-3.4 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="nb__badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
        )}
      </button>

      {open && (
        <div className="nb__dropdown" role="menu">
          <header className="nb__head">
            <span className="nb__head-title">Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className="nb__head-action"
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </header>

          <div className="nb__list">
            {recent.length === 0 ? (
              <div className="nb__empty">No notifications yet.</div>
            ) : (
              recent.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  className={`nb__item ${n.unread ? "nb__item--unread" : ""}`}
                  onClick={() => handleItemClick(n)}
                >
                  <span className="nb__item-title">{n.title}</span>
                  <span className="nb__item-message">{n.message}</span>
                  <span className="nb__item-time">{relativeTime(n.timestamp)}</span>
                </button>
              ))
            )}
          </div>

          <footer className="nb__foot">
            <button type="button" className="nb__foot-btn" onClick={handleViewAll}>
              View all notifications
            </button>
          </footer>
        </div>
      )}
    </div>
  );
}

function relativeTime(iso) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}