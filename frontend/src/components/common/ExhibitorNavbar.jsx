import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { Bell, MessageSquare, ChevronDown, CheckCircle2, Clock, XCircle } from "lucide-react";
import { useExhibitorData } from "../../context/ExhibitorDataContext";
import { useAuth } from "../../hooks/useAuth";
import notificationService from "../../services/notificationService";
import messageService from "../../services/messageService";
import "./ExhibitorNavbar.css";

const PAGE_TITLES = {
  "/exhibitor/dashboard": "Dashboard",
  "/exhibitor/profile": "Company Profile",
  "/exhibitor/browse-expos": "Browse Expos",
  "/exhibitor/my-applications": "My Applications",
  "/exhibitor/booth-selection": "Booth Selection",
  "/exhibitor/my-booth": "My Booth",
  "/exhibitor/products-services": "Products & Services",
  "/exhibitor/staff": "Staff Management",
  "/exhibitor/communication": "Communication",
  "/exhibitor/directory": "Exhibitor Directory",
  "/exhibitor/notifications": "Notifications",
  "/exhibitor/settings": "Settings",
};

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function ExhibitorNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useExhibitorData();

  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  
  // Dropdown Data
  const [latestNotifs, setLatestNotifs] = useState([]);
  const [latestMsgs, setLatestMsgs] = useState([]);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const msgRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || "Exhibitor";

  // Fetch dropdown data on mount (simplified for dropdown preview)
  useEffect(() => {
    async function loadData() {
      try {
        const [notifRes, msgRes] = await Promise.all([
          notificationService.getMyNotifications().catch(() => ({ notifications: [] })),
          messageService.getMyConversations().catch(() => ({ conversations: [] })),
        ]);
        setLatestNotifs((notifRes.notifications || []).slice(0, 3));
        setLatestMsgs((msgRes.conversations || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (msgRef.current && !msgRef.current.contains(e.target)) setMsgOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on route change
  useEffect(() => {
    setProfileOpen(false);
    setNotifOpen(false);
    setMsgOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setProfileOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="exb-navbar">
      <div className="exb-navbar__left">
        <button
          type="button"
          className="exb-navbar__hamburger"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>

        <div className="exb-navbar__titles">
          <span className="exb-navbar__eyebrow">Exhibitor Portal</span>
          <h1 className="exb-navbar__title">{title}</h1>
        </div>
      </div>

      <div className="exb-navbar__right">
        {/* Notifications Dropdown */}
        <div className="exb-navbar__dropdown-wrap" ref={notifRef}>
          <button
            className="exb-navbar__icon-btn"
            onMouseEnter={() => setNotifOpen(true)}
            onClick={() => navigate("/exhibitor/notifications")}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && <span className="exb-navbar__badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </button>

          {notifOpen && (
            <div className="exb-navbar__dropdown" onMouseLeave={() => setNotifOpen(false)}>
              <div className="exb-dropdown__header">
                <span>Notifications</span>
                <Link to="/exhibitor/notifications" className="exb-dropdown__link">View all</Link>
              </div>
              <div className="exb-dropdown__body">
                {latestNotifs.length === 0 ? (
                  <div className="exb-dropdown__empty">No notifications yet.</div>
                ) : (
                  latestNotifs.map((n) => (
                    <div key={n._id || n.id} className="exb-dropdown__item">
                      <span className="exb-dropdown__dot" style={{ background: n.read ? "transparent" : "#0e8a5f" }} />
                      <div className="exb-dropdown__content">
                        <span className="exb-dropdown__title">{n.title}</span>
                        <span className="exb-dropdown__time">{new Date(n.createdAt || n.at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages Dropdown */}
        <div className="exb-navbar__dropdown-wrap" ref={msgRef}>
          <button
            className="exb-navbar__icon-btn"
            onMouseEnter={() => setMsgOpen(true)}
            onClick={() => navigate("/exhibitor/communication")}
            aria-label="Messages"
          >
            <MessageSquare size={20} />
          </button>

          {msgOpen && (
            <div className="exb-navbar__dropdown" onMouseLeave={() => setMsgOpen(false)}>
              <div className="exb-dropdown__header">
                <span>Recent Messages</span>
                <Link to="/exhibitor/communication" className="exb-dropdown__link">View all</Link>
              </div>
              <div className="exb-dropdown__body">
                {latestMsgs.length === 0 ? (
                  <div className="exb-dropdown__empty">No messages yet.</div>
                ) : (
                  latestMsgs.map((m) => (
                    <div key={m._id || m.id} className="exb-dropdown__item">
                      <div className="exb-dropdown__content">
                        <span className="exb-dropdown__title">{m.subject}</span>
                        <span className="exb-dropdown__time">{m.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        <div className="exb-navbar__dropdown-wrap" ref={profileRef}>
          <button
            type="button"
            className="exb-navbar__profile-btn"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <span className="exb-navbar__avatar">{initials(user?.name || "Exhibitor")}</span>
            <span className="exb-navbar__profile-meta">
              <span className="exb-navbar__profile-name">{user?.name || "Exhibitor"}</span>
            </span>
            <ChevronDown size={14} className={profileOpen ? "rotate-180" : ""} />
          </button>

          {profileOpen && (
            <div className="exb-navbar__dropdown exb-navbar__dropdown--profile">
              <Link to="/exhibitor/profile" className="exb-dropdown__link-item">Company Profile</Link>
              <Link to="/exhibitor/settings" className="exb-dropdown__link-item">Settings</Link>
              <div className="exb-dropdown__divider" />
              <button onClick={handleLogout} className="exb-dropdown__link-item exb-dropdown__link-item--danger">
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}