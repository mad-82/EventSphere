/* ============================================================
   Exhibitor Shared Context
   Sirf chhoti shared state — jaisi unread notification count.
   Baaki data har page apne service se layega.
   ============================================================ */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../hooks/useAuth";
import notificationService from "../services/notificationService";

const ExhibitorDataContext = createContext(null);

export function ExhibitorDataProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const refreshUnread = useCallback(async () => {
    if (!isAuthenticated || user?.role !== "exhibitor") return;
    try {
      const res = await notificationService.getMyNotifications();
      const unread = (res.notifications || []).filter((n) => !n.read).length;
      setUnreadCount(unread);
    } catch {
      /* silent */
    }
  }, [isAuthenticated, user]);

  // Initial fetch + auto-refresh every 30s
  useEffect(() => {
    refreshUnread();
    const interval = setInterval(refreshUnread, 30000);
    return () => clearInterval(interval);
  }, [refreshUnread]);

  const value = {
    unreadCount,
    refreshUnread,
    setUnreadCount,
  };

  return (
    <ExhibitorDataContext.Provider value={value}>
      {children}
    </ExhibitorDataContext.Provider>
  );
}

export function useExhibitorData() {
  const ctx = useContext(ExhibitorDataContext);
  if (!ctx) {
    // Safe fallback — bahar use ho to crash na ho
    return {
      unreadCount: 0,
      refreshUnread: async () => {},
      setUnreadCount: () => {},
    };
  }
  return ctx;
}