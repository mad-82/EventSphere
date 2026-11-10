import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCircle2, Clock, XCircle, Info, Check, RefreshCw, AlertCircle, Trash2 } from "lucide-react";
import notificationService from "../../services/notificationService";
import "./ExhibitorNotifications.css";

const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export default function ExhibitorNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
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

  const handleMarkRead = async (id) => {
    try {
      await notificationService.markRead(id);
      setNotifications(notifications.map(n => (n._id || n.id) === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await notificationService.remove(id);
      setNotifications(notifications.filter(n => (n._id || n.id) !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleItemClick = (n) => {
    if (!n.read) handleMarkRead(n._id || n.id);
    if (n.link) navigate(n.link);
  };

  if (loading) return <div className="notif-page"><div className="notif-loading"><RefreshCw className="exb-spin" /> Loading notifications...</div></div>;
  if (error) return <div className="notif-page"><div className="notif-error"><AlertCircle /> {error}</div></div>;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notif-page">
      <header className="notif-header">
        <div>
          <h1>Notifications</h1>
          <p>You have <strong>{unreadCount}</strong> unread messages.</p>
        </div>
        {unreadCount > 0 && (
          <button className="notif-btn notif-btn--ghost" onClick={handleMarkAllRead}>
            <Check size={16} /> Mark all as read
          </button>
        )}
      </header>

      {notifications.length === 0 ? (
        <div className="notif-empty">
          <Bell size={48} />
          <h3>No notifications yet</h3>
          <p>When you get updates about your applications or booths, they'll appear here.</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const notifId = n._id || n.id;
            const Icon = n.type === "application" ? CheckCircle2 : n.type === "booth" ? LayoutDashboard : n.type === "approved" ? CheckCircle2 : n.type === "rejected" ? XCircle : Info;
            
            return (
              <div key={notifId} className={`notif-item ${!n.read ? "is-unread" : ""}`} onClick={() => handleItemClick(n)}>
                <div className={`notif-item__icon notif-item__icon--${n.type || "info"}`}>
                  <Icon size={20} />
                </div>
                <div className="notif-item__content">
                  <div className="notif-item__title-row">
                    <span className="notif-item__title">{n.title}</span>
                    <span className="notif-item__time">{fmtDate(n.createdAt || n.at)}</span>
                  </div>
                  <p className="notif-item__message">{n.message}</p>
                </div>
                <div className="notif-item__actions">
                  {!n.read && <span className="notif-item__dot" />}
                  <button className="notif-item__delete" onClick={(e) => { e.stopPropagation(); handleDelete(notifId); }}>
                    <Trash2 size={16} />
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