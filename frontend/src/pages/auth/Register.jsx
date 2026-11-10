import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthField from "../../components/auth/AuthField";
import PasswordStrength from "../../components/auth/PasswordStrength";
import RoleSelector from "../../components/auth/RoleSelector";
import { useAuth } from "../../hooks/useAuth";

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [values, setValues] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "",
  });
  const [errors, setErrors] = useState({});
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const validate = () => {
    const next = {};
    if (!values.fullName.trim()) next.fullName = "Full name is required.";
    if (!values.email.trim()) next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email))
      next.email = "Enter a valid email address.";
    if (!values.phone.trim()) next.phone = "Phone number is required.";
    else if (!/^[+\d][\d\s()-]{6,}$/.test(values.phone))
      next.phone = "Enter a valid phone number.";
    if (!values.password) next.password = "Password is required.";
    else if (values.password.length < 8)
      next.password = "Password must be at least 8 characters.";
    if (!values.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (values.confirmPassword !== values.password)
      next.confirmPassword = "Passwords do not match.";
    if (!values.role) next.role = "Please select a role.";
    if (!terms) next.terms = "You must accept the Terms & Conditions.";
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
      const res = await register({
        name: values.fullName.trim(),
        email: values.email.trim(),
        phone: values.phone.trim(),
        password: values.password,
        role: values.role,
      });

      // ✅ Agar Exhibitor hai to Verification, warna Attendee
      if (res.user.role === "exhibitor") {
        navigate("/verify-exhibitor", { replace: true });
      } else {
        navigate("/attendee/dashboard", { replace: true });
      }
      
    } catch (err) {
      setAlert({
        type: "error",
        message: err?.message || "Registration failed. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <Link to="/" className="auth-back">
          ← Back to home
        </Link>

        <p className="auth-card__eyebrow">Create account</p>
        <h1 className="auth-card__title">Join EventSphere</h1>
        <p className="auth-card__desc">
          Register as an attendee or exhibitor to get started.
        </p>

        {alert && (
          <div className={`auth-alert auth-alert--${alert.type}`} role="status">
            {alert.message}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <AuthField id="fullName" label="Full Name" value={values.fullName} onChange={handleChange} placeholder="Your full name" error={errors.fullName} autoComplete="name" />
          <AuthField id="email" label="Email Address" type="email" value={values.email} onChange={handleChange} placeholder="you@example.com" error={errors.email} autoComplete="email" />
          <AuthField id="phone" label="Phone Number" type="tel" value={values.phone} onChange={handleChange} placeholder="+92 3XX XXX XXXX" error={errors.phone} autoComplete="tel" />
          <AuthField id="password" label="Password" type={showPw ? "text" : "password"} value={values.password} onChange={handleChange} placeholder="At least 8 characters" error={errors.password} autoComplete="new-password" showToggle onToggle={() => setShowPw((v) => !v)} />
          <PasswordStrength password={values.password} />
          <AuthField id="confirmPassword" label="Confirm Password" type={showConfirm ? "text" : "password"} value={values.confirmPassword} onChange={handleChange} placeholder="Re-enter your password" error={errors.confirmPassword} autoComplete="new-password" showToggle onToggle={() => setShowConfirm((v) => !v)} />

          <RoleSelector
            value={values.role}
            onChange={(role) => {
              setValues((v) => ({ ...v, role }));
              if (errors.role) setErrors((p) => ({ ...p, role: undefined }));
            }}
            error={errors.role}
          />

          <label className="auth-check">
            <input type="checkbox" checked={terms} onChange={(e) => { setTerms(e.target.checked); if (errors.terms) setErrors((p) => ({ ...p, terms: undefined })); }} />
            <span className="auth-check__text">
              I agree to the <Link to="/terms">Terms & Conditions</Link> and <Link to="/privacy">Privacy Policy</Link>.
            </span>
          </label>
          {errors.terms && <span className="auth-field__error" style={{ display: "block", marginBottom: "1rem" }}>{errors.terms}</span>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <><span className="auth-submit__spinner" /> Creating account…</> : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-note">
          Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
        </p>
      </div>
    </div>
  );
}