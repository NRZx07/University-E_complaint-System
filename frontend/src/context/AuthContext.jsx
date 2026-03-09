import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

// Fallback to localhost:5000 if the env variable is missing
const API_BASE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    try {
      // Use absolute URL construction
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
      console.error("Auth check failed:", err);
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
      // Force an absolute URL to prevent the /undefined/ relative path error
      const logoutUrl = `${API_BASE}/api/auth/logout`;

      await fetch(logoutUrl, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      // ALWAYS clear user state even if the network request fails
      setUser(null);
      // Redirect to login (optional but recommended)
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loadingAuth }}
    >
      {/* Prevent rendering the app until we know if the user is logged in.
         This stops "undefined" errors in child components.
      */}
      {!loadingAuth && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
