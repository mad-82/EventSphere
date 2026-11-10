import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AuthField from "../../components/auth/AuthField";
import { useAuth } from "../../hooks/useAuth";
import exhibitorService from "../../services/exhibitorService"; // ✅ Import add kiya

const ROLE_REDIRECT = {
  admin: "/organizer/dashboard",
  organizer: "/organizer/dashboard",
  exhibitor: "/exhibitor/dashboard",
  attendee: "/attendee/dashboard",
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [values, setValues] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const validate = () => {
    const next = {};
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Enter a valid email address.";
    if (!values.password) next.password = "Password is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    if (errors[e.target.name])
      setErrors((p) => ({ ...p, [e.target.name]: undefined }));
    setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setAlert(null);

    try {
      const res = await login({
        email: values.email.trim(),
        password: values.password,
      });

      // ✅ SMART CHECK: Agar Exhibitor hai, to check karo ke form bhara hai ya nahi
      if (res.user.role === "exhibitor") {
        try {
          const profile = await exhibitorService.getMyProfile();
          if (!profile.exhibitor?.companyName) {
            // Agar companyName khali hai, matlab verification form adhura hai
            navigate("/verify-exhibitor", { replace: true });
            return;
          }
        } catch (err) {
          console.error("Profile check failed", err);
        }
      }

      // Redirect based on role — no role selector, backend decides
      const target =
        location.state?.from ||
        ROLE_REDIRECT[res.user.role] ||
        "/";

      navigate(target, { replace: true });
    } catch (err) {
      setAlert({
        type: "error",
        message: err?.message || "Invalid email or password.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-back">
          ← Back to home
        </Link>

        <p className="auth-card__eyebrow">Welcome back</p>
        <h1 className="auth-card__title">Sign in to EventSphere</h1>
        <p className="auth-card__desc">
          Access your events, registrations, and feedback.
        </p>

        {alert && (
          <div className={`auth-alert auth-alert--${alert.type}`} role="status">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            id="email"
            label="Email Address"
            type="email"
            value={values.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
          />

          <AuthField
            id="password"
            label="Password"
            type={showPw ? "text" : "password"}
            value={values.password}
            onChange={handleChange}
            placeholder="Enter your password"
            error={errors.password}
            autoComplete="current-password"
            showToggle
            onToggle={() => setShowPw((v) => !v)}
          />

          <div className="auth-row">
            <label className="auth-check" style={{ marginBottom: 0 }}>
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
              />
              <span className="auth-check__text">Remember me</span>
            </label>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-submit__spinner" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="auth-footer-note">
          New to EventSphere?{" "}
          <Link to="/register" className="auth-link">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}