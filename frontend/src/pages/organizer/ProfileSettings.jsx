import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../hooks/useAuth";
import "./ProfileSettings.css";

/* ============================================================
   MOCK DATA — replace with services/ once wired.
   Auth context provides the current user; the rest are defaults.
   ============================================================ */

const DEFAULT_PROFILE = {
  name: "Adeel Ahmed",
  email: "adeel.ahmed@eventsphere.pk",
  phone: "+92 300 1234567",
  designation: "Senior Event Manager",
  organization: "EventSphere Pvt Ltd",
  bio: "Managing large-scale exhibitions across Pakistan for 8+ years.",
  avatar: "",
};

const DEFAULT_PREFERENCES = {
  emailNotifications: true,
  applicationAlerts: true,
  boothAlerts: true,
  scheduleAlerts: false,
  attendeeAlerts: true,
  systemAlerts: true,
  weeklyDigest: true,
  language: "en",
  timezone: "Asia/Karachi",
};

const LANGUAGE_OPTIONS = [
  { id: "en", label: "English" },
  { id: "ur", label: "Urdu" },
  { id: "ar", label: "Arabic" },
];

const TIMEZONE_OPTIONS = [
  { id: "Asia/Karachi",     label: "Asia/Karachi (PKT · UTC+5)" },
  { id: "Asia/Dubai",       label: "Asia/Dubai (GST · UTC+4)" },
  { id: "Asia/Kolkata",     label: "Asia/Kolkata (IST · UTC+5:30)" },
  { id: "Europe/London",    label: "Europe/London (GMT · UTC+0)" },
  { id: "America/New_York", label: "America/New_York (EST · UTC-5)" },
];

const MOCK_SESSIONS = [
  {
    id: "sess-current",
    device: "Chrome · Windows",
    location: "Karachi, Pakistan",
    lastActive: "Active now",
    current: true,
  },
  {
    id: "sess-002",
    device: "Safari · iPhone 15",
    location: "Karachi, Pakistan",
    lastActive: "2 hours ago",
    current: false,
  },
  {
    id: "sess-003",
    device: "Firefox · macOS",
    location: "Lahore, Pakistan",
    lastActive: "Yesterday",
    current: false,
  },
];

const TABS = [
  { id: "profile",     label: "Profile" },
  { id: "account",     label: "Account" },
  { id: "preferences", label: "Preferences" },
  { id: "security",    label: "Security" },
];

/* ============================================================
   Page
   ============================================================ */
export default function ProfileSettings() {
  const { user } = useAuth?.() || {};

  const [tab, setTab] = useState("profile");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  /* Profile */
  const [profile, setProfile] = useState({
    ...DEFAULT_PROFILE,
    name: user?.name || DEFAULT_PROFILE.name,
    email: user?.email || DEFAULT_PROFILE.email,
    avatar: user?.avatar || "",
  });
  const [profileDirty, setProfileDirty] = useState(false);

  /* Preferences */
  const [prefs, setPrefs] = useState(DEFAULT_PREFERENCES);
  const [prefsDirty, setPrefsDirty] = useState(false);

  /* Password */
  const [pwForm, setPwForm] = useState({ current: "", next: "", confirm: "" });
  const [pwErrors, setPwErrors] = useState({});

  /* Sessions */
  const [sessions, setSessions] = useState(MOCK_SESSIONS);
  const [confirmRevokeId, setConfirmRevokeId] = useState(null);

  /* 2FA */
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);

  /* Avatar input */
  const avatarInputRef = useRef(null);

  /* ---------- Profile actions ---------- */
  const setProfileField = (key) => (e) => {
    setProfile((p) => ({ ...p, [key]: e.target.value }));
    setProfileDirty(true);
  };

  const handleAvatarClick = () => avatarInputRef.current?.click();

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProfile((p) => ({ ...p, avatar: ev.target.result }));
      setProfileDirty(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const saveProfile = (e) => {
    e.preventDefault();
    const errs = {};
    if (!profile.name.trim()) errs.name = "Name is required.";
    if (!profile.email.trim()) errs.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = "Enter a valid email.";
    if (Object.keys(errs).length) {
      setProfile((p) => p);
      setToast({ type: "error", text: Object.values(errs)[0] });
      return;
    }
    // Backend integration point — PUT /organizer/profile
    setProfileDirty(false);
    setToast({ type: "success", text: "Profile saved." });
  };

  const discardProfile = () => {
    setProfile({
      ...DEFAULT_PROFILE,
      name: user?.name || DEFAULT_PROFILE.name,
      email: user?.email || DEFAULT_PROFILE.email,
      avatar: user?.avatar || "",
    });
    setProfileDirty(false);
    setToast({ type: "success", text: "Changes discarded." });
  };

  /* ---------- Preferences actions ---------- */
  const togglePref = (key) => {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setPrefsDirty(true);
  };

  const setPrefField = (key) => (e) => {
    setPrefs((p) => ({ ...p, [key]: e.target.value }));
    setPrefsDirty(true);
  };

  const savePrefs = () => {
    // Backend integration point — PUT /organizer/preferences
    setPrefsDirty(false);
    setToast({ type: "success", text: "Preferences saved." });
  };

  const discardPrefs = () => {
    setPrefs(DEFAULT_PREFERENCES);
    setPrefsDirty(false);
    setToast({ type: "success", text: "Preferences discarded." });
  };

  /* ---------- Password actions ---------- */
  const setPwField = (key) => (e) => {
    setPwForm((f) => ({ ...f, [key]: e.target.value }));
    setPwErrors((errs) => {
      if (!errs[key]) return errs;
      const next = { ...errs };
      delete next[key];
      return next;
    });
  };

  const validatePassword = () => {
    const errs = {};
    if (!pwForm.current) errs.current = "Current password is required.";
    if (!pwForm.next) errs.next = "New password is required.";
    else if (pwForm.next.length < 8) errs.next = "Password must be at least 8 characters.";
    else if (pwForm.next === pwForm.current) errs.next = "New password must differ from current.";
    if (!pwForm.confirm) errs.confirm = "Please confirm your new password.";
    else if (pwForm.confirm !== pwForm.next) errs.confirm = "Passwords do not match.";
    return errs;
  };

  const changePassword = (e) => {
    e.preventDefault();
    const errs = validatePassword();
    if (Object.keys(errs).length) {
      setPwErrors(errs);
      return;
    }
    // Backend integration point — POST /organizer/change-password
    setPwForm({ current: "", next: "", confirm: "" });
    setPwErrors({});
    setToast({ type: "success", text: "Password updated." });
  };

  /* ---------- Session actions ---------- */
  const requestRevoke = (id) => setConfirmRevokeId(id);
  const confirmRevoke = () => {
    setSessions((list) => list.filter((s) => s.id !== confirmRevokeId));
    setConfirmRevokeId(null);
    setToast({ type: "success", text: "Session revoked." });
  };

  /* ---------- 2FA actions ---------- */
  const toggle2FA = () => {
    setTwoFAEnabled((v) => !v);
    setToast({
      type: "success",
      text: twoFAEnabled ? "Two-factor authentication disabled." : "Two-factor authentication enabled.",
    });
  };

  /* ---------- Render ---------- */
  return (
    <div className="profile-settings">
      <div className="org-page-header">
        <div className="org-page-header__titles">
          <h1 className="org-page-header__title">Profile & Settings</h1>
          <p className="org-page-header__subtitle">
            Manage your account, preferences, and security.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="ps-tabs" role="tablist" aria-label="Settings sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`ps-tab ${tab === t.id ? "ps-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* =========================
          PROFILE TAB
          ========================= */}
      {tab === "profile" && (
        <form className="ps-section org-card" onSubmit={saveProfile}>
          <header className="ps-section__head">
            <div>
              <h2 className="ps-section__title">Profile</h2>
              <p className="ps-section__subtitle">This information is visible to exhibitors and attendees.</p>
            </div>
            {profileDirty && (
              <div className="ps-section__actions">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={discardProfile}>
                  Cancel
                </button>
                <button type="submit" className="org-btn org-btn--primary org-btn--sm">
                  Save Changes
                </button>
              </div>
            )}
          </header>

          {/* Avatar */}
          <div className="ps-avatar-row">
            <div className="ps-avatar" onClick={handleAvatarClick} role="button" tabIndex={0}
                 onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleAvatarClick(); } }}>
              {profile.avatar ? (
                <img src={profile.avatar} alt="Avatar" />
              ) : (
                <span className="ps-avatar__initials">{initials(profile.name)}</span>
              )}
              <span className="ps-avatar__overlay">Change</span>
            </div>
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
            <div className="ps-avatar-info">
              <span className="ps-avatar-info__name">{profile.name || "Your name"}</span>
              <span className="ps-avatar-info__email">{profile.email}</span>
              <button type="button" className="org-btn org-btn--ghost org-btn--sm" onClick={handleAvatarClick}>
                Upload Photo
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="ps-form-grid">
            <div className="ps-field">
              <label>Full Name *</label>
              <input className="org-input" value={profile.name} onChange={setProfileField("name")} />
            </div>
            <div className="ps-field">
              <label>Email *</label>
              <input type="email" className="org-input" value={profile.email} onChange={setProfileField("email")} />
            </div>
            <div className="ps-field">
              <label>Phone</label>
              <input className="org-input" value={profile.phone} onChange={setProfileField("phone")} />
            </div>
            <div className="ps-field">
              <label>Designation</label>
              <input className="org-input" value={profile.designation} onChange={setProfileField("designation")} />
            </div>
            <div className="ps-field ps-field--full">
              <label>Organization</label>
              <input className="org-input" value={profile.organization} onChange={setProfileField("organization")} />
            </div>
            <div className="ps-field ps-field--full">
              <label>Bio</label>
              <textarea className="org-textarea" rows={3} value={profile.bio} onChange={setProfileField("bio")} />
            </div>
          </div>
        </form>
      )}

      {/* =========================
          ACCOUNT TAB
          ========================= */}
      {tab === "account" && (
        <div className="ps-section org-card">
          <header className="ps-section__head">
            <div>
              <h2 className="ps-section__title">Account</h2>
              <p className="ps-section__subtitle">Change your sign-in password.</p>
            </div>
          </header>

          <form className="ps-form-grid" onSubmit={changePassword} noValidate>
            <div className="ps-field ps-field--full">
              <label>Current Password *</label>
              <input
                type="password"
                className="org-input"
                value={pwForm.current}
                onChange={setPwField("current")}
                autoComplete="current-password"
              />
              {pwErrors.current && <span className="ps-field__error">{pwErrors.current}</span>}
            </div>
            <div className="ps-field">
              <label>New Password *</label>
              <input
                type="password"
                className="org-input"
                value={pwForm.next}
                onChange={setPwField("next")}
                autoComplete="new-password"
              />
              {pwErrors.next && <span className="ps-field__error">{pwErrors.next}</span>}
              <span className="ps-field__hint">Minimum 8 characters. Must differ from current.</span>
            </div>
            <div className="ps-field">
              <label>Confirm New Password *</label>
              <input
                type="password"
                className="org-input"
                value={pwForm.confirm}
                onChange={setPwField("confirm")}
                autoComplete="new-password"
              />
              {pwErrors.confirm && <span className="ps-field__error">{pwErrors.confirm}</span>}
            </div>
            <div className="ps-field ps-field--full ps-form-actions">
              <button type="submit" className="org-btn org-btn--primary">
                Update Password
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =========================
          PREFERENCES TAB
          ========================= */}
      {tab === "preferences" && (
        <div className="ps-section org-card">
          <header className="ps-section__head">
            <div>
              <h2 className="ps-section__title">Preferences</h2>
              <p className="ps-section__subtitle">Control how the panel notifies you and how it displays dates.</p>
            </div>
            {prefsDirty && (
              <div className="ps-section__actions">
                <button type="button" className="org-btn org-btn--secondary org-btn--sm" onClick={discardPrefs}>
                  Cancel
                </button>
                <button type="button" className="org-btn org-btn--primary org-btn--sm" onClick={savePrefs}>
                  Save Preferences
                </button>
              </div>
            )}
          </header>

          {/* Notifications */}
          <div className="ps-pref-group">
            <h3 className="ps-pref-group__title">Notifications</h3>
            {[
              { key: "emailNotifications", label: "Email notifications", desc: "Receive important updates by email." },
              { key: "applicationAlerts",  label: "New exhibitor applications", desc: "When a new application is submitted." },
              { key: "boothAlerts",        label: "Booth activity", desc: "Booth allocations and status changes." },
              { key: "scheduleAlerts",     label: "Schedule changes", desc: "When sessions are added or moved." },
              { key: "attendeeAlerts",     label: "Attendee registrations", desc: "New attendee sign-ups." },
              { key: "systemAlerts",       label: "System alerts", desc: "Maintenance windows and platform updates." },
              { key: "weeklyDigest",       label: "Weekly digest", desc: "A summary of key metrics every Monday." },
            ].map((row) => (
              <label key={row.key} className="ps-toggle-row">
                <div className="ps-toggle-row__label">
                  <span className="ps-toggle-row__name">{row.label}</span>
                  <span className="ps-toggle-row__desc">{row.desc}</span>
                </div>
                <span className={`ps-toggle ${prefs[row.key] ? "ps-toggle--on" : ""}`}>
                  <input
                    type="checkbox"
                    checked={prefs[row.key]}
                    onChange={() => togglePref(row.key)}
                    aria-label={row.label}
                  />
                  <span className="ps-toggle__knob" />
                </span>
              </label>
            ))}
          </div>

          {/* Localization */}
          <div className="ps-pref-group">
            <h3 className="ps-pref-group__title">Localization</h3>
            <div className="ps-form-grid">
              <div className="ps-field">
                <label>Language</label>
                <select className="org-select" value={prefs.language} onChange={setPrefField("language")}>
                  {LANGUAGE_OPTIONS.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}
                </select>
              </div>
              <div className="ps-field">
                <label>Timezone</label>
                <select className="org-select" value={prefs.timezone} onChange={setPrefField("timezone")}>
                  {TIMEZONE_OPTIONS.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================
          SECURITY TAB
          ========================= */}
      {tab === "security" && (
        <>
          <div className="ps-section org-card">
            <header className="ps-section__head">
              <div>
                <h2 className="ps-section__title">Two-Factor Authentication</h2>
                <p className="ps-section__subtitle">Add an extra layer of security to your account.</p>
              </div>
              <span className={`org-badge ${twoFAEnabled ? "org-badge--success" : "org-badge--neutral"}`}>
                {twoFAEnabled ? "Enabled" : "Disabled"}
              </span>
            </header>
            <div className="ps-2fa-row">
              <p className="ps-2fa-row__text">
                When enabled, you'll be required to enter a code from your authenticator app
                each time you sign in.
              </p>
              <button
                type="button"
                className={`org-btn ${twoFAEnabled ? "org-btn--danger" : "org-btn--primary"}`}
                onClick={toggle2FA}
              >
                {twoFAEnabled ? "Disable 2FA" : "Enable 2FA"}
              </button>
            </div>
          </div>

          <div className="ps-section org-card">
            <header className="ps-section__head">
              <div>
                <h2 className="ps-section__title">Active Sessions</h2>
                <p className="ps-section__subtitle">Devices currently signed in to your account.</p>
              </div>
            </header>
            <ul className="ps-sessions">
              {sessions.map((s) => (
                <li key={s.id} className="ps-session">
                  <div className="ps-session__meta">
                    <span className="ps-session__device">
                      {s.device}
                      {s.current && <span className="ps-session__current-badge">Current</span>}
                    </span>
                    <span className="ps-session__sub">{s.location} · {s.lastActive}</span>
                  </div>
                  {!s.current && (
                    <button
                      type="button"
                      className="org-btn org-btn--danger org-btn--sm"
                      onClick={() => requestRevoke(s.id)}
                    >
                      Revoke
                    </button>
                  )}
                </li>
              ))}
              {sessions.length === 1 && (
                <li className="ps-sessions__empty">
                  No other active sessions.
                </li>
              )}
            </ul>
          </div>
        </>
      )}

      {/* Revoke confirm */}
      {confirmRevokeId && (
        <div className="ps-modal-backdrop" onClick={() => setConfirmRevokeId(null)} role="presentation">
          <div className="ps-modal org-card" role="alertdialog" aria-modal="true" onClick={(ev) => ev.stopPropagation()}>
            <h2 className="ps-modal__title">Revoke session?</h2>
            <p className="ps-modal__text">
              The selected device will be signed out immediately. You can sign in again from that device anytime.
            </p>
            <footer className="ps-modal__actions">
              <button type="button" className="org-btn org-btn--secondary" onClick={() => setConfirmRevokeId(null)}>Cancel</button>
              <button type="button" className="org-btn org-btn--danger" onClick={confirmRevoke}>Revoke</button>
            </footer>
          </div>
        </div>
      )}

      {toast && <div className={`expo-toast expo-toast--${toast.type}`} role="status">{toast.text}</div>}
    </div>
  );
}

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}