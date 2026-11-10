import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotifications } from "../../hooks/useNotifications";
import "./Sidebar.css";

/* --- Inline icons (no icon library dependency) --- */
const I = ({ children, size = 18 }) => (
  <svg
    width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true"
  >{children}</svg>
);
const Icon = {
  dashboard: <I><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></I>,
  expo:      <I><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 9h6"/><path d="M9 13h6"/><path d="M9 17h6"/></I>,
  exhibitor: <I><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></I>,
  apps:      <I><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6"/><path d="M9 17h6"/></I>,
  booth:     <I><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/><path d="M3 9h18"/></I>,
  floor:     <I><path d="M3 3h18v18H3z"/><path d="M3 9h6V3"/><path d="M9 9h6v6H9z"/><path d="M15 15h6v6h-6z"/></I>,
  schedule:  <I><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/><path d="M8 14h.01"/><path d="M12 14h.01"/><path d="M16 14h.01"/></I>,
  attendee:  <I><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></I>,
  analytics: <I><path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 5-6"/></I>,
  comms:     <I><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></I>,
  bell:      <I><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/></I>,
  feedback:  <I><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></I>,
  profile:   <I><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></I>,
  logout:    <I><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></I>,
  chevron:   <I size={12}><polyline points="15 18 9 12 15 6"/></I>,
  // 🔥 NAYA ICON: Booth Requests ke liye (Tick mark / Clipboard)
  request:   <I><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/></I>,
};

const NAV = [
  { section: "Overview", items: [
    { to: "/organizer/dashboard", label: "Dashboard", icon: Icon.dashboard },
  ]},
  { section: "Events", items: [
    { to: "/organizer/expos",       label: "Expo Management", icon: Icon.expo },
    { to: "/organizer/schedule",    label: "Schedule",        icon: Icon.schedule },
  ]},
  { section: "Exhibitors", items: [
    { to: "/organizer/exhibitors",       label: "Exhibitors",    icon: Icon.exhibitor },
    { to: "/organizer/applications",     label: "Applications",  icon: Icon.apps, badgeKey: "applications" },
    // 🔥 NAYA LINK YAHAN ADD KIYA HAI
    { to: "/organizer/booth-requests",   label: "Booth Requests", icon: Icon.request },
    { to: "/organizer/booths",           label: "Booths",        icon: Icon.booth },
    { to: "/organizer/floor-plan",       label: "Floor Plan",    icon: Icon.floor },
  ]},
  { section: "Attendees", items: [
    { to: "/organizer/attendees", label: "Attendees", icon: Icon.attendee },
  ]},
  { section: "Insights", items: [
    { to: "/organizer/analytics", label: "Analytics & Reports", icon: Icon.analytics },
  ]},
  { section: "Engagement", items: [
    { to: "/organizer/communication", label: "Communication", icon: Icon.comms },
    { to: "/organizer/notifications", label: "Notifications", icon: Icon.bell, badgeKey: "notifications" },
    { to: "/organizer/feedback",      label: "Feedback",      icon: Icon.feedback },
  ]},
  { section: "Account", items: [
    { to: "/organizer/profile", label: "Profile & Settings", icon: Icon.profile },
  ]},
];

export default function Sidebar({
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile,
}) {
  const navigate = useNavigate();
  const { user, logout } = useAuth?.() || {};
  const { unreadCount = 0 } = useNotifications?.() || {};

  const displayRole = user?.role || "Organizer";

  const handleLogout = () => {
    if (typeof logout === "function") logout();
    navigate("/login");
  };

  const badgeFor = (item) => {
    if (item.badgeKey === "notifications") return unreadCount > 0 ? unreadCount : null;
    if (item.badgeKey === "applications") return null;
    return null;
  };

  return (
    <>
      {mobileOpen && (
        <div className="org-sidebar-backdrop" onClick={onCloseMobile} aria-hidden="true" />
      )}
      <aside
        className={`org-sidebar ${collapsed ? "org-sidebar--collapsed" : ""} ${mobileOpen ? "org-sidebar--mobile-open" : ""}`}
        aria-label="Organizer navigation"
      >
        {onToggleCollapse && (
          <button
            type="button"
            className="org-sidebar__toggle"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {Icon.chevron}
          </button>
        )}

        <div className="org-sidebar__brand">
          <div className="org-sidebar__logo">EX</div>
          <div className="org-sidebar__brand-text">
            <span className="org-sidebar__brand-name">ExpoSuite</span>
            <span className="org-sidebar__brand-role">{displayRole}</span>
          </div>
        </div>

        <nav className="org-sidebar__nav">
          {NAV.map((group) => (
            <div key={group.section}>
              <div className="org-sidebar__section-label">{group.section}</div>
              {group.items.map((item) => {
                const badge = badgeFor(item);
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to.endsWith("dashboard")}
                    className={({ isActive }) =>
                      `org-sidebar__link ${isActive ? "org-sidebar__link--active" : ""}`
                    }
                    title={collapsed ? item.label : undefined}
                    onClick={() => onCloseMobile && onCloseMobile()}
                  >
                    <span className="org-sidebar__icon">{item.icon}</span>
                    <span className="org-sidebar__label">{item.label}</span>
                    {badge != null && <span className="org-sidebar__badge">{badge > 99 ? "99+" : badge}</span>}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="org-sidebar__footer">
          <button type="button" className="org-sidebar__logout" onClick={handleLogout}>
            <span className="org-sidebar__icon" style={{ color: "inherit" }}>{Icon.logout}</span>
            <span className="org-sidebar__label">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}