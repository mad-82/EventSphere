import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const ROLE_REDIRECT = {
  admin: "/organizer/dashboard",
  organizer: "/organizer/dashboard",
  exhibitor: "/exhibitor/dashboard",
  attendee: "/attendee/dashboard",
};

export default function PublicOnlyRoute({ children }) {
  const { user, initializing } = useAuth();

  // Jab tak token verify ho raha hai, tab tak wait karein (flash se bachne ke liye)
  if (initializing) {
    return null; // ya ek simple loader
  }

  // Agar user pehle se login hai, toh usay dashboard par bhej dein
  if (user) {
    const target = ROLE_REDIRECT[user.role] || "/";
    return <Navigate to={target} replace />;
  }

  // Agar login nahi hai, toh normal page dikhayein
  return children;
}