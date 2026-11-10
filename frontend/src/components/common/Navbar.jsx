import { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth"; 
import "./Navbar.css";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "About", to: "/about" },
  { label: "Services", to: "/services" },
  { label: "Booths", to: "/booths" },
  { label: "Events", to: "/events" },
  { label: "Feedback", to: "/our-clients" },
  { label: "Contact", to: "/contact-us" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const { user, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDashboardLink = () => {
    if (!user) return "/";
    if (user.role === "organizer" || user.role === "admin") return "/organizer/dashboard";
    if (user.role === "exhibitor") return "/exhibitor/dashboard";
    return "/attendee/dashboard";
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login");
  };

  return (
    <>
      <header
        className={`es-nav ${scrolled ? "es-nav--scrolled" : ""} ${
          menuOpen ? "es-nav--open" : ""
        }`}
      >
        <div className="es-nav__inner">
          <Link to="/" className="es-nav__brand" aria-label="EventSphere home">
            <span className="es-nav__brand-mark">
              <span>ES</span>
            </span>
            <span className="es-nav__brand-text">
              EventSphere
              <span className="es-nav__brand-sub">Event Management</span>
            </span>
          </Link>

          <nav className="es-nav__links" aria-label="Primary">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`es-nav__link ${
                  location.pathname === link.to ? "is-active" : ""
                }`}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>

          <div className="es-nav__actions">
            {user ? (
              <div className="es-nav__profile-wrap" ref={dropdownRef}>
                <button 
                  className="es-nav__profile-btn" 
                  onClick={() => setProfileOpen(!profileOpen)}
                >
                  <span className="es-nav__avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </span>
                  <span className="es-nav__profile-name">{user.name.split(" ")[0]}</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {profileOpen && (
                  <div className="es-nav__dropdown">
                    <div className="es-nav__dropdown-header">
                      <span className="es-nav__dropdown-name">{user.name}</span>
                      <span className="es-nav__dropdown-role">{user.role}</span>
                    </div>
                    <Link to={getDashboardLink()} className="es-nav__dropdown-item" onClick={() => setProfileOpen(false)}>
                      My Dashboard
                    </Link>
                    <div className="es-nav__dropdown-divider"></div>
                    <button onClick={handleLogout} className="es-nav__dropdown-item es-nav__dropdown-item--danger">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/login" className="es-btn es-btn--ghost">
                  Login
                </Link>
                <Link to="/register" className="es-btn es-btn--solid">
                  <span>Register</span>
                  <svg className="es-btn__arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </>
            )}

            <button
              type="button"
              className="es-nav__burger"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>

      {/* ⬇️ MOBILE MENU KO HEADER KE BAHAR NIKAL DIYA HAI ⬇️ */}
      <div className={`es-nav__mobile ${menuOpen ? "is-open" : ""}`}>
        <div className="es-nav__mobile-close" onClick={() => setMenuOpen(false)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
        </div>
        
        <nav className="es-nav__mobile-links" aria-label="Mobile">
          {NAV_LINKS.map((link, i) => (
            <Link
              key={link.to}
              to={link.to}
              className="es-nav__mobile-link"
              style={{ "--i": i }}
              onClick={() => setMenuOpen(false)}
            >
              <span className="es-nav__mobile-index">0{i + 1}</span>
              {link.label}
            </Link>
          ))}
          <div className="es-nav__mobile-actions">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="es-btn es-btn--solid es-btn--full" onClick={() => setMenuOpen(false)}>
                  My Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="es-btn es-btn--ghost es-btn--full" style={{ marginTop: "10px" }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="es-btn es-btn--ghost es-btn--full" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="es-btn es-btn--solid es-btn--full" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        </nav>
      </div>
    </>
  );
}