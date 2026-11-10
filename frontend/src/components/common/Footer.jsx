import { Link } from "react-router-dom";
import "./Footer.css";

const FOOTER_COLS = [
  {
    title: "Platform",
    links: [
      { label: "Explore Events", to: "/events" },
      { label: "Find Booths", to: "/booths" },
      { label: "About Us", to: "/about" },
      { label: "Contact", to: "/contact-us" },
      { label: "Feedback", to: "/our-clients" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Corporate Events", to: "/events" },
      { label: "Wedding Events", to: "/events" },
      { label: "Brand Activations", to: "/events" },
      { label: "Exhibitions", to: "/events" },
      { label: "Conferences", to: "/events" },
    ],
  },
  {
    title: "Locations",
    links: [
      { label: "Karachi", to: "/events" },
      { label: "Lahore", to: "/events" },
      { label: "Islamabad", to: "/events" },
      { label: "Peshawar", to: "/events" },
      { label: "Multan", to: "/events" },
    ],
  },
];

const SOCIALS = [
  {
    label: "Instagram",
    href: "https://instagram.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM10 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C21.4 8.65 22 11 22 14.1V21h-4v-6.1c0-1.45-.03-3.32-2.02-3.32-2.02 0-2.33 1.58-2.33 3.21V21h-4z" />
      </svg>
    ),
  },
  {
    label: "Facebook",
    href: "https://facebook.com",
    icon: (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3-.04-1.3-.13-2.47-.13-2.45 0-4.13 1.5-4.13 4.24V9.9H7.4V13h2.7v8z" />
      </svg>
    ),
  },
];

export default function Footer() {
  return (
    <footer className="premium-footer">
      
      {/* 1. Huge CTA Section */}
      <div className="pf-cta-section">
        <div className="pf-cta-inner">
          <h2>Ready to create something <span>extraordinary?</span></h2>
          <Link to="/contact-us" className="pf-cta-btn">
            Start a Conversation <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* 2. Main Footer Area */}
      <div className="pf-main">
        <div className="pf-container">
          
          {/* Top: Brand + Links */}
          <div className="pf-grid">
            
            {/* Brand Column */}
            <div className="pf-brand-col">
              <Link to="/" className="pf-logo">
                <div className="pf-logo-mark">E</div>
                <span>EventSphere<span className="pf-dot">.</span></span>
              </Link>
              <p className="pf-desc">
                Pakistan's premium event management platform. We connect organizers, exhibitors, and attendees for unforgettable experiences.
              </p>
              
              <div className="pf-socials">
                {SOCIALS.map((s) => (
                  <a key={s.label} href={s.href} target="_blank" rel="noreferrer" className="pf-social" aria-label={s.label}>
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Links Columns */}
            <div className="pf-links-grid">
              {FOOTER_COLS.map((col) => (
                <div key={col.title} className="pf-col">
                  <h4>{col.title}</h4>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link to={link.to}>{link.label}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

          </div>

          {/* Bottom: Legal */}
          <div className="pf-bottom">
            <p>© {new Date().getFullYear()} EventSphere Pvt Ltd. All rights reserved.</p>
            <div className="pf-legal">
              <Link to="/privacy">Privacy Policy</Link>
              <Link to="/terms">Terms of Service</Link>
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
}