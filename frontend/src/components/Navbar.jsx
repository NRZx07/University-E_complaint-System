import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileDrawer from "./ProfileDrawer";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  const handleLogout = () => {
    logout();
    setShowProfileSidebar(false);
    navigate("/");
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case "student":
        return "/student/dashboard";
      case "faculty":
        return "/faculty/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to={getDashboardLink()}
                className="flex items-center gap-3 group"
              >
                <div
                  className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600
                  flex items-center justify-center shadow-md
                  group-hover:scale-105 transition-all duration-300"
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <div className="leading-tight">
                  <h1
                    className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600
                    bg-clip-text text-transparent"
                  >
                    E-Complaint
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    University System
                  </p>
                </div>
              </Link>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <Link
                to={getDashboardLink()}
                className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Dashboard
              </Link>

              <button
                onClick={() => setShowProfileSidebar(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white
                  px-4 py-2 rounded-xl hover:shadow-lg hover:-translate-y-[1px] transition-all"
              >
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
                <span className="hidden sm:block text-sm font-medium">
                  {user?.name || "User"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Separate Drawer Component */}
      <ProfileDrawer
        open={showProfileSidebar}
        onClose={() => setShowProfileSidebar(false)}
        user={user}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
