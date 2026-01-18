import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loadingAuth } = useAuth();

  // ✅ wait for /auth/me to finish (cookie session check)
  if (loadingAuth) return <div className="p-6 text-center">Loading...</div>;

  // ✅ not logged in
  if (!user) return <Navigate to="/login" replace />;

  // ✅ role not allowed
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const { user, loadingAuth } = useAuth();
  const isAuthenticated = !!user;

  // ✅ global loading
  if (loadingAuth) return <div className="p-6 text-center">Loading...</div>;

  return (
    <Router>
      {isAuthenticated && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />

        {/* ✅ If already logged in, redirect away from login/register */}
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={
            !isAuthenticated ? <Register /> : <Navigate to="/" replace />
          }
        />

        {/* ✅ Dashboards */}
        <Route
          path="/student/dashboard"
          element={
            <ProtectedRoute allowedRoles={["student"]}>
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/faculty/dashboard"
          element={
            <ProtectedRoute allowedRoles={["faculty"]}>
              <FacultyDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* ✅ Any logged in user */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* ✅ fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
