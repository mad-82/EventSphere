import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCircle2, Clock, XCircle, Info, Check, RefreshCw, AlertCircle, Trash2
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import notificationService from "../../services/notificationService";
import "./Notifications.css";

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

const CATEGORY_ICONS = {
  application: CheckCircle2,
  approved: CheckCircle2,
  rejected: XCircle,
  booth: Clock,
  schedule: Clock,
  attendee: Bell,
  inquiry: Info,
  system: Info,
  announcement: Info,
};

const CATEGORY_COLORS = {
  application: "success",
  approved: "success",
  rejected: "danger",
  booth: "warning",
  schedule: "warning",
  attendee: "info",
  inquiry: "info",
  system: "neutral",
  announcement: "info",
};

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all"); // all | unread

  const isAdmin = user?.role === "admin" || user?.role === "organizer";
  const isAttendee = user?.role === "attendee";

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await notificationService.getMyNotifications();
        setNotifications(res.notifications || []);
      } catch (err) {
        setError(err?.message || "Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.read);
    return notifications;
  }, [notifications, filter]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications((list) => list.map((n) => ((n._id || n.id) === id ? { ...n, read: true } : n)));
    } catch (err) { console.error(err); }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications((list) => list.map((n) => ({ ...n, read: true })));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await notificationService.remove(id);
      setNotifications((list) => list.filter((n) => (n._id || n.id) !== id));
    } catch (err) { console.error(err); }
  };

  const handleClick = (n) => {
    if (!n.read) handleMarkRead(n._id || n.id);
    if (n.link) navigate(n.link);
  };

  if (loading) return <div className="notif-page"><div className="notif-loading"><RefreshCw className="att-spin" /> Loading...</div></div>;
  if (error) return <div className="notif-page"><div className="notif-error"><AlertCircle /> {error}</div></div>;

  return (
    <div className="notif-page">
      <header className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>You have <strong>{unreadCount}</strong> unread messages.</p>
        </div>
        <div className="notif-header__actions">
          {unreadCount > 0 && (
            <button className="notif-btn notif-btn--ghost" onClick={handleMarkAllRead}>
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>
      </header>

      <div className="notif-tabs">
        <button className={`notif-tab ${filter === "all" ? "is-active" : ""}`} onClick={() => setFilter("all")}>
          All ({notifications.length})
        </button>
        <button className={`notif-tab ${filter === "unread" ? "is-active" : ""}`} onClick={() => setFilter("unread")}>
          Unread ({unreadCount})
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="notif-empty">
          <Bell size={48} />
          <h3>No notifications</h3>
          <p>{filter === "unread" ? "You're all caught up!" : "When you get updates, they'll appear here."}</p>
        </div>
      ) : (
        <div className="notif-list">
          {filtered.map((n) => {
            const id = n._id || n.id;
            const cat = n.category || n.type || "info";
            const Icon = CATEGORY_ICONS[cat] || Info;
            const color = CATEGORY_COLORS[cat] || "neutral";

            return (
              <div key={id} className={`notif-item ${!n.read ? "is-unread" : ""}`} onClick={() => handleClick(n)}>
                <div className={`notif-item__icon notif-icon--${color}`}>
                  <Icon size={18} />
                </div>
                <div className="notif-item__body">
                  <div className="notif-item__title-row">
                    <span className="notif-item__title">{n.title}</span>
                    <span className="notif-item__time">{fmtDate(n.createdAt || n.at)}</span>
                  </div>
                  <p className="notif-item__message">{n.message}</p>
                </div>
                <div className="notif-item__actions">
                  {!n.read && <span className="notif-item__dot" />}
                  <button className="notif-item__delete" onClick={(e) => { e.stopPropagation(); handleDelete(id); }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}