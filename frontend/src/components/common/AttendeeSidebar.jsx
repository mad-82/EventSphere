import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import "./AttendeeSidebar.css";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/attendee/dashboard", icon: "grid" },
      { label: "Browse Events", to: "/events", icon: "compass" },
      { label: "My Registrations", to: "/attendee/registrations", icon: "file" },
    ],
  },
  {
    title: "Explore",
    items: [
      { label: "Exhibitor Search", to: "/attendee/exhibitors", icon: "search" },
      { label: "Event Schedule", to: "/attendee/schedule", icon: "calendar" },
      { label: "Bookmarked Sessions", to: "/attendee/bookmarks", icon: "bookmark" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", to: "/attendee/notifications", icon: "bell" },
      { label: "Communication", to: "/attendee/communication", icon: "message" },
      { label: "Feedback & Support", to: "/attendee/feedback", icon: "help" },
      { label: "Profile & Settings", to: "/attendee/settings", icon: "settings" },
    ],
  },
];

function Icon({ name }) {
  const p = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round", strokeLinejoin: "round" };
  switch (name) {
    case "grid": return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></svg>;
    case "compass": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="m15 9-4 4-2 4 4-4 2-4Z" /></svg>;
    case "file": return <svg {...p}><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /></svg>;
    case "search": return <svg {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
    case "bookmark": return <svg {...p}><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z" /></svg>;
    case "bell": return <svg {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case "message": return <svg {...p}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" /></svg>;
    case "help": return <svg {...p}><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>;
    case "settings": return <svg {...p}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" /></svg>;
    case "chevron": return <svg {...p} width={14} height={14}><path d="m15 18-6-6 6-6" /></svg>;
    case "logout": return <svg {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></svg>;
    default: return null;
  }
}

function initials(name = "") {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

export default function AttendeeSidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userName = user?.name || "Attendee";
  const userEmail = user?.email || "attendee@example.com";

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {mobileOpen && <div className="att-sidebar__backdrop" onClick={onCloseMobile} />}
      <aside
        className={[
          "att-sidebar",
          collapsed ? "att-sidebar--collapsed" : "",
          mobileOpen ? "att-sidebar--mobile-open" : "",
        ].filter(Boolean).join(" ")}
      >
        <div className="att-sidebar__brand">
          <div className="att-sidebar__brand-mark">{initials(userName)}</div>
          {!collapsed && (
            <div className="att-sidebar__brand-text">
              <span className="att-sidebar__brand-name">{userName}</span>
              <span className="att-sidebar__brand-tag">Attendee Portal</span>
            </div>
          )}
        </div>

        <button type="button" className="att-sidebar__collapse-btn" onClick={onToggleCollapse}>
          <span className={collapsed ? "att-sidebar__chev att-sidebar__chev--right" : "att-sidebar__chev"}>
            <Icon name="chevron" />
          </span>
        </button>

        <nav className="att-sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="att-sidebar__section">
              {!collapsed && <span className="att-sidebar__section-title">{section.title}</span>}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) => ["att-sidebar__link", isActive ? "att-sidebar__link--active" : ""].filter(Boolean).join(" ")}
                  end
                >
                  <span className="att-sidebar__icon"><Icon name={item.icon} /></span>
                  {!collapsed && <span className="att-sidebar__label">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="att-sidebar__footer">
          {!collapsed && (
            <div className="att-sidebar__user">
              <div className="att-sidebar__avatar">{initials(userName)}</div>
              <div className="att-sidebar__user-meta">
                <span className="att-sidebar__user-name">{userName}</span>
                <span className="att-sidebar__user-email">{userEmail}</span>
              </div>
            </div>
          )}
          <button type="button" className="att-sidebar__logout" onClick={handleLogout}>
            <Icon name="logout" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}