import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AttendeeNavbar.css";

const PAGE_TITLES = {
  "/attendee/dashboard": "Dashboard",
  "/attendee/registrations": "My Registrations",
  "/attendee/exhibitors": "Exhibitor Search",
  "/attendee/schedule": "Event Schedule",
  "/attendee/bookmarks": "Bookmarked Sessions",
  "/attendee/notifications": "Notifications",
  "/attendee/communication": "Communication",
  "/attendee/feedback": "Feedback & Support",
  "/attendee/settings": "Settings",
};

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function AttendeeNavbar({ onToggleSidebar }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const title = PAGE_TITLES[location.pathname] || "Attendee";

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <header className="att-navbar">
      <div className="att-navbar__left">
        <button type="button" className="att-navbar__hamburger" onClick={onToggleSidebar}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M3 12h18M3 18h18" />
          </svg>
        </button>
        <div className="att-navbar__titles">
          <span className="att-navbar__eyebrow">Attendee Portal</span>
          <h1 className="att-navbar__title">{title}</h1>
        </div>
      </div>

      <div className="att-navbar__right">
        <Link to="/attendee/notifications" className="att-navbar__icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </Link>
        <Link to="/attendee/communication" className="att-navbar__icon-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
          </svg>
        </Link>

        <div className="att-navbar__profile" ref={menuRef}>
          <button type="button" className="att-navbar__profile-btn" onClick={() => setMenuOpen((v) => !v)}>
            <span className="att-navbar__avatar">{initials(user?.name || "Attendee")}</span>
            <span className="att-navbar__profile-meta">
              <span className="att-navbar__profile-name">{user?.name || "Attendee"}</span>
              <span className="att-navbar__profile-role">Attendee</span>
            </span>
          </button>
          {menuOpen && (
            <div className="att-navbar__menu">
              <Link to="/attendee/settings" className="att-navbar__menu-item">Settings</Link>
              <Link to="/attendee/feedback" className="att-navbar__menu-item">Feedback</Link>
              <div className="att-navbar__menu-divider" />
              <button type="button" className="att-navbar__menu-item att-navbar__menu-item--danger" onClick={handleLogout}>
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}