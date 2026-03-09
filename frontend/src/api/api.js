const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";


export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, {
    credentials: "include", // ✅ cookies always
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
};
