import { NavLink, useNavigate } from "react-router-dom";
import { useExhibitorData } from "../../context/ExhibitorDataContext";
import { useAuth } from "../../hooks/useAuth";
import "./ExhibitorSidebar.css";

const NAV_SECTIONS = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", to: "/exhibitor/dashboard", icon: "grid" },
      { label: "Company Profile", to: "/exhibitor/profile", icon: "building" },
    ],
  },
  {
    title: "Expos",
    items: [
      { label: "Browse Expos", to: "/exhibitor/browse-expos", icon: "compass" },
      { label: "My Applications", to: "/exhibitor/my-applications", icon: "file" },
      { label: "Booth Selection", to: "/exhibitor/booth-selection", icon: "layout" },
      { label: "My Booth", to: "/exhibitor/my-booth", icon: "pin" },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Products & Services", to: "/exhibitor/products-services", icon: "box" },
      { label: "Staff Management", to: "/exhibitor/staff", icon: "users" },
      { label: "Communication", to: "/exhibitor/communication", icon: "message" },
      { label: "Exhibitor Directory", to: "/exhibitor/directory", icon: "book" },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "Notifications", to: "/exhibitor/notifications", icon: "bell", badge: "unread" },
      { label: "Settings", to: "/exhibitor/settings", icon: "settings" },
    ],
  },
];

/* Minimal inline icon set — no external dependency */
function Icon({ name }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": "true",
  };
  switch (name) {
    case "grid":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "building":
      return (
        <svg {...p}>
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3" />
        </svg>
      );
    case "compass":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="m15 9-4 4-2 4 4-4 2-4Z" />
        </svg>
      );
    case "file":
      return (
        <svg {...p}>
          <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
          <path d="M14 3v6h6" />
          <path d="M8 13h8M8 17h5" />
        </svg>
      );
    case "layout":
      return (
        <svg {...p}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 21V9" />
        </svg>
      );
    case "pin":
      return (
        <svg {...p}>
          <path d="M12 21s-7-6.5-7-12a7 7 0 1 1 14 0c0 5.5-7 12-7 12Z" />
          <circle cx="12" cy="9" r="2.5" />
        </svg>
      );
    case "box":
      return (
        <svg {...p}>
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="M3 8l9 5 9-5M12 13v8" />
        </svg>
      );
    case "users":
      return (
        <svg {...p}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "message":
      return (
        <svg {...p}>
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2Z" />
        </svg>
      );
    case "book":
      return (
        <svg {...p}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
        </svg>
      );
    case "bell":
      return (
        <svg {...p}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
    case "settings":
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
        </svg>
      );
    case "chevron":
      return (
        <svg {...p} width={14} height={14}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "logout":
      return (
        <svg {...p}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="m16 17 5-5-5-5M21 12H9" />
        </svg>
      );
    default:
      return null;
  }
}

function initials(name = "") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export default function ExhibitorSidebar({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const { unreadCount } = useExhibitorData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const companyName = user?.companyName || user?.name || "Meridian Industrial";
  const userName = user?.name || "Exhibitor User";
  const userEmail = user?.email || "exhibitor@example.com";

  const handleLogout = () => {
    logout?.();
    navigate("/login", { replace: true });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="exb-sidebar__backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={[
          "exb-sidebar",
          collapsed ? "exb-sidebar--collapsed" : "",
          mobileOpen ? "exb-sidebar--mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Exhibitor navigation"
      >
        {/* Brand */}
        <div className="exb-sidebar__brand">
          <div className="exb-sidebar__brand-mark">
            {initials(companyName)}
          </div>
          {!collapsed && (
            <div className="exb-sidebar__brand-text">
              <span className="exb-sidebar__brand-name">{companyName}</span>
              <span className="exb-sidebar__brand-tag">Exhibitor Portal</span>
            </div>
          )}
        </div>

        {/* Desktop collapse toggle */}
        <button
          type="button"
          className="exb-sidebar__collapse-btn"
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <span
            className={
              collapsed ? "exb-sidebar__chev exb-sidebar__chev--right" : "exb-sidebar__chev"
            }
          >
            <Icon name="chevron" />
          </span>
        </button>

        {/* Nav */}
        <nav className="exb-sidebar__nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title} className="exb-sidebar__section">
              {!collapsed && (
                <span className="exb-sidebar__section-title">
                  {section.title}
                </span>
              )}
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={onCloseMobile}
                  className={({ isActive }) =>
                    [
                      "exb-sidebar__link",
                      isActive ? "exb-sidebar__link--active" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                  end
                  title={collapsed ? item.label : undefined}
                >
                  <span className="exb-sidebar__icon">
                    <Icon name={item.icon} />
                  </span>
                  {!collapsed && (
                    <span className="exb-sidebar__label">{item.label}</span>
                  )}
                  {item.badge === "unread" && unreadCount > 0 && (
                    <span
                      className={
                        collapsed
                          ? "exb-sidebar__badge exb-sidebar__badge--dot"
                          : "exb-sidebar__badge"
                      }
                    >
                      {collapsed ? "" : unreadCount}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="exb-sidebar__footer">
          {!collapsed && (
            <div className="exb-sidebar__user">
              <div className="exb-sidebar__avatar">{initials(userName)}</div>
              <div className="exb-sidebar__user-meta">
                <span className="exb-sidebar__user-name">{userName}</span>
                <span className="exb-sidebar__user-email">{userEmail}</span>
              </div>
            </div>
          )}
          <button
            type="button"
            className="exb-sidebar__logout"
            onClick={handleLogout}
            title="Sign out"
          >
            <Icon name="logout" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}