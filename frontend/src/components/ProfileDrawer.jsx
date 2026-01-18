import React, { useEffect } from "react";
import { Link } from "react-router-dom";

const InfoRow = ({ label, value, icon }) => {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
        <svg
          className="w-5 h-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icon}
        </svg>
      </div>

      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold">
          {label}
        </p>
        <p className="text-gray-900 font-medium mt-1 break-words">{value}</p>
      </div>
    </div>
  );
};

const ProfileDrawer = ({ open, onClose, user, onLogout }) => {
  // ✅ ESC to close
  useEffect(() => {
    const handleEsc = (e) => e.key === "Escape" && onClose();
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // ✅ Prevent background scroll when drawer is open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Drawer */}
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[22rem] sm:w-[24rem] bg-white shadow-2xl
        transform transition-transform duration-300 ease-out
        ${open ? "translate-x-0" : "translate-x-full"}`}
        onClick={(e) => e.stopPropagation()}
        aria-hidden={!open}
      >
        <div className="h-full flex flex-col">
          {/* Header (compact + premium) */}
          <div className="relative px-6 pt-6 pb-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            {/* Top bar */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-wide">Profile</h2>

              <button
                onClick={onClose}
                className="h-10 w-10 rounded-full bg-white/15 hover:bg-white/25
                flex items-center justify-center transition-all active:scale-95"
                title="Close"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Profile identity */}
            <div className="mt-6 flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center shadow-md ring-2 ring-white/20">
                <span className="text-2xl font-extrabold">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>

              <div className="leading-tight">
                <h3 className="font-semibold text-lg">
                  {user?.name || "User"}
                </h3>
                <p className="text-white/85 text-sm capitalize">
                  {user?.role || "Role"}
                </p>
                {user?.studentId && (
                  <p className="text-white/80 text-xs mt-1">
                    ID: {user.studentId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-4">
              <InfoRow
                label="Email"
                value={user?.email || "Not provided"}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V6a2 2 0 00-2-2H3a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                }
              />

              <InfoRow
                label="Role"
                value={user?.role ? user.role : "Not provided"}
                icon={
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                }
              />

              {user?.department && (
                <InfoRow
                  label="Department"
                  value={user.department}
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 21h8M12 17v4M7 4h10l1 4H6l1-4zm0 4v9a2 2 0 002 2h6a2 2 0 002-2V8"
                    />
                  }
                />
              )}

              {user?.studentId && (
                <InfoRow
                  label="Student ID"
                  value={user.studentId}
                  icon={
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14l9 5-9 5-9-5 9-5z"
                    />
                  }
                />
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 space-y-3">
              <Link
                to="/profile"
                onClick={onClose}
                className="w-full inline-flex items-center justify-center gap-2
                bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl font-semibold
                hover:shadow-lg hover:-translate-y-[1px] transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
                Edit Profile
              </Link>

              <button
                onClick={onLogout}
                className="w-full inline-flex items-center justify-center gap-2
                bg-red-500 text-white px-4 py-3 rounded-xl font-semibold
                hover:bg-red-600 hover:shadow-lg hover:-translate-y-[1px] transition-all"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 text-center text-xs text-gray-500">
            University E-Complaint System
          </div>
        </div>
      </aside>
    </>
  );
};

export default ProfileDrawer;
