import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Footer from "../components/Footer";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  // ✅ Dark Mode State
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : false;
  });

  // ✅ Apply theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const getDashboardLink = () => {
    if (!isAuthenticated) return "/login";
    switch (user?.role) {
      case "student":
        return "/student/dashboard";
      case "faculty":
        return "/faculty/dashboard";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/login";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
      {/* ✅ Fixed Toggle Button Position (Bottom-Right) */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="group flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
                     px-5 py-3 rounded-full shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 active:scale-95"
        >
          <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
            {darkMode ? "Light" : "Dark"}
          </span>
          <span className="text-xl group-hover:rotate-12 transition-transform duration-300">
            {darkMode ? "☀️" : "🌙"}
          </span>
        </button>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              University E-Complaint System
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Submit, track, and resolve complaints efficiently with our
              intelligent platform
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to={getDashboardLink()}
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 active:scale-95"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              </Link>

              <Link
                to={isAuthenticated ? getDashboardLink() : "/login"}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-all hover:-translate-y-1 active:scale-95"
              >
                Track Complaint
              </Link>
            </div>
          </div>
        </div>

        {/* Wave SVG */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#F9FAFB"
              className="dark:fill-[#030712] transition-colors duration-300"
            />
          </svg>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stats Card Wrapper Function/Component logic applied inline */}

          {/* Card 1 */}
          <div
            className="group bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800
                         hover:shadow-[0_20px_50px_rgba(59,130,246,0.15)] hover:-translate-y-3 transition-all duration-500
                         hover:ring-4 hover:ring-blue-500/10 dark:hover:ring-blue-500/5 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Total Complaints
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  1,247
                </p>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ↑ 12% from last month
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-8 h-8"
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
            </div>
          </div>

          {/* Card 2 */}
          <div
            className="group bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800
                         hover:shadow-[0_20px_50px_rgba(34,197,94,0.15)] hover:-translate-y-3 transition-all duration-500
                         hover:ring-4 hover:ring-green-500/10 dark:hover:ring-green-500/5 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Resolved
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  1,089
                </p>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  87% resolution rate
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div
            className="group bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800
                         hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] hover:-translate-y-3 transition-all duration-500
                         hover:ring-4 hover:ring-purple-500/10 dark:hover:ring-purple-500/5 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Avg Resolution Time
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  3.5d
                </p>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ↓ 15% faster
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Card 4 */}
          <div
            className="group bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-800
                         hover:shadow-[0_20px_50px_rgba(249,115,22,0.15)] hover:-translate-y-3 transition-all duration-500
                         hover:ring-4 hover:ring-orange-500/10 dark:hover:ring-orange-500/5 cursor-default"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
                  Satisfaction Rate
                </p>
                <p className="text-3xl font-bold text-gray-800 dark:text-white mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  94%
                </p>
                <p className="text-green-600 text-sm mt-2 font-semibold">
                  ↑ 5% improvement
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-2xl shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
            Powerful Features
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Everything you need to manage complaints effectively
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature Cards with Enhanced Interaction */}

          {[
            {
              title: "AI-Powered Analysis",
              desc: "Intelligent complaint categorization and priority assignment using advanced AI algorithms.",
              color: "blue",
              icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z",
            },
            {
              title: "Smart Routing",
              desc: "Automatically route complaints to the right department or faculty member for faster resolution.",
              color: "purple",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              title: "Real-time Tracking",
              desc: "Track your complaint status in real-time with instant notifications and updates.",
              color: "green",
              icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z",
            },
            {
              title: "Anonymous Complaints",
              desc: "Submit complaints anonymously to ensure privacy and encourage honest feedback.",
              color: "orange",
              icon: "M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z",
            },
            {
              title: "Analytics Dashboard",
              desc: "Comprehensive analytics and insights to improve complaint resolution processes.",
              color: "pink",
              icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
            },
            {
              title: "Secure & Reliable",
              desc: "Bank-level security with encrypted data storage and secure authentication.",
              color: "indigo",
              icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
            },
          ].map((f, i) => (
            <div
              key={i}
              className={`group bg-white/90 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-lg p-8 border border-gray-100 dark:border-gray-800
                                       hover:shadow-2xl hover:-translate-y-3 transition-all duration-500 cursor-default
                                       hover:ring-2 hover:ring-${f.color}-500/20`}
            >
              <div
                className={`bg-gradient-to-br ${
                  f.color === "blue"
                    ? "from-blue-500 to-blue-600"
                    : f.color === "purple"
                    ? "from-purple-500 to-purple-600"
                    : f.color === "green"
                    ? "from-green-500 to-green-600"
                    : f.color === "orange"
                    ? "from-yellow-500 to-orange-500"
                    : f.color === "pink"
                    ? "from-red-500 to-pink-600"
                    : "from-indigo-500 to-indigo-600"
                } text-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
              >
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={f.icon}
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {f.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
