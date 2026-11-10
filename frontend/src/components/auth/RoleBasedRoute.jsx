import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RoleBasedRoute({ allowedRoles = [], children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "#080B12", color: "#fff", fontSize: "16px" }}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // admin has access to all role-protected routes
  const hasAccess = user.role === "admin" || allowedRoles.includes(user.role);

  if (!hasAccess) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <p className="auth-card__eyebrow">Access denied</p>
          <h1 className="auth-card__title">You don't have permission</h1>
          <p className="auth-card__desc">
            This page is restricted to: {allowedRoles.join(", ")}.
            <br />
            Your role: <strong>{user.role}</strong>
          </p>
        </div>
      </div>
    );
  }

  return children;
}