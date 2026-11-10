import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthField from "../../components/auth/AuthField";
import PasswordStrength from "../../components/auth/PasswordStrength";
import authService from "../../services/authService";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const email = params.get("email");

  const [values, setValues] = useState({ password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [apiError, setApiError] = useState("");

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-card__eyebrow">Invalid link</p>
          <h1 className="auth-card__title">Reset link is missing or expired</h1>
          <p className="auth-card__desc">
            Please request a new password reset link.
          </p>
          <Link
            to="/forgot-password"
            className="auth-submit"
            style={{ textDecoration: "none", display: "inline-block" }}
          >
            Request new link
          </Link>
        </div>
      </div>
    );
  }

  const validate = () => {
    const next = {};
    if (!values.password) next.password = "New password is required.";
    else if (values.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!values.confirm) next.confirm = "Please confirm your password.";
    else if (values.confirm !== values.password)
      next.confirm = "Passwords do not match.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setApiError("");

    try {
      await authService.resetPassword({ token, password: values.password });
      setDone(true);
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      setApiError(err?.message || "Reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-alert auth-alert--success" role="status">
            <strong>Password updated.</strong>
            <br />
            Redirecting to sign in…
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <p className="auth-card__eyebrow">Choose a new password</p>
        <h1 className="auth-card__title">Set a new password</h1>
        <p className="auth-card__desc">
          {email
            ? `Resetting password for ${decodeURIComponent(email)}`
            : "Enter your new password below."}
        </p>

        {apiError && (
          <div className="auth-alert auth-alert--error" role="alert">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthField
            id="password"
            label="New Password"
            type={showPw ? "text" : "password"}
            value={values.password}
            onChange={(e) => {
              setValues((v) => ({ ...v, password: e.target.value }));
              if (errors.password)
                setErrors((p) => ({ ...p, password: undefined }));
            }}
            placeholder="At least 8 characters"
            error={errors.password}
            autoComplete="new-password"
            showToggle
            onToggle={() => setShowPw((v) => !v)}
          />
          <PasswordStrength password={values.password} />

          <AuthField
            id="confirm"
            label="Confirm New Password"
            type={showConfirm ? "text" : "password"}
            value={values.confirm}
            onChange={(e) => {
              setValues((v) => ({ ...v, confirm: e.target.value }));
              if (errors.confirm)
                setErrors((p) => ({ ...p, confirm: undefined }));
            }}
            placeholder="Re-enter new password"
            error={errors.confirm}
            autoComplete="new-password"
            showToggle
            onToggle={() => setShowConfirm((v) => !v)}
          />

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? (
              <>
                <span className="auth-submit__spinner" /> Updating…
              </>
            ) : (
              "Update Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}