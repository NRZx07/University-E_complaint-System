import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (res.ok) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loadingAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
