import { useState } from "react";
import { Link } from "react-router-dom";
import AuthField from "../../components/auth/AuthField";
import authService from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return setError("Enter a valid email address.");

    setLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      setSent(true);
    } catch (err) {
      setError(err?.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/login" className="auth-back">
          ← Back to sign in
        </Link>

        <p className="auth-card__eyebrow">Password recovery</p>
        <h1 className="auth-card__title">Forgot your password?</h1>
        <p className="auth-card__desc">
          Enter the email associated with your account and we'll send
          instructions to reset your password.
        </p>

        {sent ? (
          <div className="auth-alert auth-alert--success" role="status">
            <strong>Check your inbox.</strong>
            <br />
            If an account exists for <strong>{email}</strong>, you will receive
            a password reset link shortly.
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            <AuthField
              id="email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
              placeholder="you@example.com"
              error={error}
              autoComplete="email"
            />

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-submit__spinner" /> Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        <p className="auth-footer-note">
          Remembered it?{" "}
          <Link to="/login" className="auth-link">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}