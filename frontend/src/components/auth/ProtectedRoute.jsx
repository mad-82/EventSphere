import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function ProtectedRoute({ children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();

  // Wait for token verification to finish — don't flash redirect
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

  // ✅ CRITICAL CHECK: Agar user Exhibitor hai, verify nahi hua, aur Verification page pe NAHI hai,
  // to use zabardasti Verification page pe bhejo.
  if (
    user.role === "exhibitor" &&
    !user.isVerifiedExhibitor &&
    location.pathname !== "/verify-exhibitor"
  ) {
    return <Navigate to="/verify-exhibitor" replace />;
  }

  return children;
}