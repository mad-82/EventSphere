import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import NotificationBell from "./NotificationBell"; // ← confirm export style & path
import "./OrganizerNavbar.css";

const PAGE_LABELS = {
  "/organizer/dashboard":     "Dashboard",
  "/organizer/expos":         "Expo Management",
  "/organizer/exhibitors":    "Exhibitor Management",
  "/organizer/applications":  "Exhibitor Applications",
  "/organizer/booths":        "Booth Management",
  "/organizer/floor-plan":    "Floor Plan",
  "/organizer/schedule":      "Schedule Management",
  "/organizer/attendees":     "Attendee Management",
  "/organizer/analytics":     "Analytics & Reports",
  "/organizer/communication": "Communication",
  "/organizer/notifications": "Notifications",
  "/organizer/feedback":      "Feedback & Support",
  "/organizer/profile":       "Profile & Settings",
};

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
  </svg>
);
const MenuIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/>
  </svg>
);

export default function OrganizerNavbar({ onToggleSidebar }) {
  const { user, logout } = useAuth?.() || {};
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const currentLabel = PAGE_LABELS[location.pathname] || "Organizer";
  const name = user?.name || "Organizer";
  const role = user?.role || "Admin";
  const initials = name.split(" ").map((s) => s[0]).slice(0, 2).join("").toUpperCase();

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login");
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      // Global search — Stage 3+ will route to a results page.
      // For now, no-op placeholder until search index exists.
    }
  };

  return (
    <header className="org-navbar">
      <button
        type="button"
        className="org-navbar__menu-btn"
        onClick={onToggleSidebar}
        aria-label="Toggle sidebar"
      >
        <MenuIcon />
      </button>

      <nav className="org-navbar__breadcrumb" aria-label="Breadcrumb">
        <span className="org-navbar__breadcrumb-prev">Organizer</span>
        <span className="org-navbar__breadcrumb-sep">/</span>
        <span className="org-navbar__breadcrumb-current">{currentLabel}</span>
      </nav>

      <form className="org-navbar__search" onSubmit={handleSearchSubmit} role="search">
        <div className="org-navbar__search-wrap">
          <span className="org-navbar__search-icon"><SearchIcon /></span>
          <input
            type="search"
            placeholder="Search expos, exhibitors, attendees…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Global search"
          />
        </div>
      </form>

      <div className="org-navbar__actions">
        <NotificationBell />
        <div className="org-navbar__profile" ref={dropdownRef} onClick={() => setDropdownOpen((v) => !v)}>
          <div className="org-navbar__avatar">
            {user?.avatar ? <img src={user.avatar} alt={name} /> : initials}
          </div>
          <div className="org-navbar__user-meta">
            <span className="org-navbar__user-name">{name}</span>
            <span className="org-navbar__user-role">{role}</span>
          </div>

          {dropdownOpen && (
            <div className="org-navbar__dropdown" onClick={(e) => e.stopPropagation()}>
              <Link to="/organizer/profile" className="org-navbar__dropdown-item">
                Profile & Settings
              </Link>
              <Link to="/organizer/notifications" className="org-navbar__dropdown-item">
                Notifications
              </Link>
              <div className="org-navbar__dropdown-divider" />
              <button
                type="button"
                className="org-navbar__dropdown-item org-navbar__dropdown-item--danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}