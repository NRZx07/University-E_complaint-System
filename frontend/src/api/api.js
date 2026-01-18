const API_BASE = "http://localhost:5000/api";

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
