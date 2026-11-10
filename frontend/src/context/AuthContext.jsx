import { createContext, useContext, useState, useEffect } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("auth_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function verifySession() {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setInitializing(false);
        return;
      }
      try {
        const { user: fresh } = await authService.getMe();
        if (!cancelled) setUser(fresh);
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setInitializing(false);
      }
    }

    verifySession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("auth_user", JSON.stringify(user));
      else localStorage.removeItem("auth_user");
    } catch {}
  }, [user]);

  const login = async ({ email, password }) => {
    setLoading(true);
    try {
      const res = await authService.login({ email, password });
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const res = await authService.register(payload);
      localStorage.setItem("auth_token", res.token);
      setUser(res.user);
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  };

  const updateUser = (patch) =>
    setUser((prev) => (prev ? { ...prev, ...patch } : prev));

  const refreshUser = async () => {
    try {
      const { user: fresh } = await authService.getMe();
      setUser(fresh);
      return fresh;
    } catch {
      return null;
    }
  };

  const value = {
    user,
    loading,
    initializing,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    return {
      user: null,
      loading: false,
      initializing: false,
      isAuthenticated: false,
      login: async () => {},
      register: async () => {},
      logout: () => {},
      updateUser: () => {},
      refreshUser: async () => null,
    };
  }
  return ctx;
}