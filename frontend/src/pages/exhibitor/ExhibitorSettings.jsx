import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Bell, LogOut, Save, CheckCircle2, ShieldAlert } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/authService";
import "./ExhibitorSettings.css";

export default function ExhibitorSettings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // States for Password Form
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  // States for Preferences
  const [prefs, setPrefs] = useState({
    emailNotifications: true,
    applicationUpdates: true,
    boothUpdates: true,
    expoAnnouncements: false,
  });
  const [savedPrefs, setSavedPrefs] = useState(false);

  // Handle Password Change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (passwords.newPassword !== passwords.confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }
    if (passwords.newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }

    setSavingPw(true);
    try {
      await authService.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPwSuccess("Password updated successfully.");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwError(err.message || "Failed to update password. Check current password.");
    } finally {
      setSavingPw(false);
    }
  };

  // Handle Preferences Save (Local Frontend Simulation)
  const handleSavePrefs = () => {
    // In real app, this would be an API call
    localStorage.setItem("exhibitor_prefs", JSON.stringify(prefs));
    setSavedPrefs(true);
    setTimeout(() => setSavedPrefs(false), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="settings-page">
      <header className="settings-header">
        <h1>Account Settings</h1>
        <p>Manage your account security and notification preferences.</p>
      </header>

      <div className="settings-grid">
        
        {/* Left Column: Account Info & Logout */}
        <div className="settings-col">
          {/* Account Details */}
          <section className="settings-card">
            <div className="settings-card__head">
              <User size={20} className="settings-icon" />
              <h2>Account Information</h2>
            </div>
            <div className="settings-card__body">
              <div className="info-row">
                <span>Full Name</span>
                <strong>{user?.name || "—"}</strong>
              </div>
              <div className="info-row">
                <span>Email Address</span>
                <strong>{user?.email || "—"}</strong>
              </div>
              <div className="info-row">
                <span>Role</span>
                <strong style={{ textTransform: "capitalize" }}>{user?.role || "—"}</strong>
              </div>
              <div className="info-row">
                <span>Phone Number</span>
                <strong>{user?.phone || "Not provided"}</strong>
              </div>
              <p className="info-hint">To update your name or contact details, please edit your Company Profile.</p>
            </div>
          </section>

          {/* Logout Card */}
          <section className="settings-card settings-card--danger">
            <div className="settings-card__head">
              <LogOut size={20} className="settings-icon settings-icon--danger" />
              <h2>Account Actions</h2>
            </div>
            <div className="settings-card__body">
              <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#64748b" }}>
                Logging out will end your current session on this device.
              </p>
              <button className="settings-btn settings-btn--danger" onClick={handleLogout}>
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </section>
        </div>

        {/* Right Column: Security & Preferences */}
        <div className="settings-col">
          {/* Password */}
          <section className="settings-card">
            <div className="settings-card__head">
              <Lock size={20} className="settings-icon" />
              <h2>Security</h2>
            </div>
            <div className="settings-card__body">
              {pwError && <div className="settings-alert settings-alert--error"><ShieldAlert size={16} /> {pwError}</div>}
              {pwSuccess && <div className="settings-alert settings-alert--success"><CheckCircle2 size={16} /> {pwSuccess}</div>}
              
              <form onSubmit={handlePasswordChange} className="settings-form">
                <div className="form-group">
                  <label>Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.currentPassword}
                    onChange={(e) => setPasswords({...passwords, currentPassword: e.target.value})}
                    placeholder="Enter current password"
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                    placeholder="At least 8 characters"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                    placeholder="Re-enter new password"
                  />
                </div>
                <button type="submit" className="settings-btn settings-btn--primary" disabled={savingPw}>
                  <Save size={16} /> {savingPw ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          </section>

          {/* Preferences */}
          <section className="settings-card">
            <div className="settings-card__head">
              <Bell size={20} className="settings-icon" />
              <h2>Email Preferences</h2>
            </div>
            <div className="settings-card__body">
              <div className="pref-list">
                {Object.entries({
                  emailNotifications: "General Email Notifications",
                  applicationUpdates: "Application Status Updates",
                  boothUpdates: "Booth Allocation Updates",
                  expoAnnouncements: "Expo Announcements & News",
                }).map(([key, label]) => (
                  <label key={key} className="pref-toggle">
                    <div className="pref-toggle__text">
                      <strong>{label}</strong>
                      <span>Receive emails regarding this update.</span>
                    </div>
                    <input 
                      type="checkbox" 
                      checked={prefs[key]}
                      onChange={(e) => setPrefs({...prefs, [key]: e.target.checked})}
                    />
                    <span className="pref-toggle__slider"></span>
                  </label>
                ))}
              </div>
              
              <button className="settings-btn settings-btn--ghost" onClick={handleSavePrefs} style={{ marginTop: 16 }}>
                <Save size={16} /> {savedPrefs ? "Preferences Saved!" : "Save Preferences"}
              </button>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}