import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "http://localhost:5000";

const StudentDashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const complaintsSectionRef = useRef(null);

  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [complaints, setComplaints] = useState([]);

  const [newComplaint, setNewComplaint] = useState({
    title: "",
    category: "Infrastructure",
    priority: "medium",
    description: "",
    anonymous: false,
  });

  const [selectedFiles, setSelectedFiles] = useState([]);

  // AUTO-SCROLL LOGIC
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("tab") === "complaints") {
      setTimeout(() => {
        complaintsSectionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 500);
    }
  }, [location]);

  const fetchMyComplaints = async () => {
    try {
      setLoadingComplaints(true);
      const res = await fetch(`${BACKEND_URL}/api/complaints/my`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setComplaints([]);
        return;
      }
      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleSubmitComplaint = async (e) => {
    e.preventDefault();
    if (
      !newComplaint.title ||
      !newComplaint.description ||
      !newComplaint.category
    ) {
      alert("Title, category and description are required");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", newComplaint.title);
      fd.append("category", newComplaint.category);
      fd.append("priority", newComplaint.priority);
      fd.append("description", newComplaint.description);
      fd.append("anonymous", newComplaint.anonymous);

      selectedFiles.slice(0, 3).forEach((file) => {
        fd.append("images", file);
      });

      const res = await fetch(`${BACKEND_URL}/api/complaints`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.message || "Complaint submission failed");
        return;
      }

      alert("Complaint submitted ✅");
      setNewComplaint({
        title: "",
        category: "Infrastructure",
        priority: "medium",
        description: "",
        anonymous: false,
      });
      setSelectedFiles([]);
      setShowComplaintForm(false);
      fetchMyComplaints();
    } catch (err) {
      alert("Server error while submitting complaint");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "submitted":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Counts
  const submittedCount = complaints.filter(
    (c) => c.status === "submitted"
  ).length;
  const inProgressCount = complaints.filter(
    (c) => c.status === "in-progress"
  ).length;
  const resolvedCount = complaints.filter(
    (c) => c.status === "resolved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ✅ Header (exact faculty style) */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Student Dashboard
            </h1>
            <p className="text-gray-600 mt-2">
              Welcome back,{" "}
              <span className="font-semibold text-blue-600">{user?.name}</span>{" "}
              👋
            </p>
          </div>

          {/* ✅ Button (simple like faculty) */}
          <button
            onClick={() => setShowComplaintForm(!showComplaintForm)}
            className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
              showComplaintForm
                ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {showComplaintForm ? "Close Form" : "+ New Complaint"}
          </button>
        </div>

        {/* ✅ Stats Cards (exact faculty UI) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Reports"
            count={complaints.length}
            gradient="from-blue-500 to-blue-600"
            iconPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              />
            }
          />

          <StatCard
            title="Submitted"
            count={submittedCount}
            gradient="from-yellow-500 to-orange-500"
            iconPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            }
          />

          <StatCard
            title="In Progress"
            count={inProgressCount}
            gradient="from-purple-500 to-purple-600"
            iconPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            }
          />

          <StatCard
            title="Resolved"
            count={resolvedCount}
            gradient="from-green-500 to-green-600"
            iconPath={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            }
          />
        </div>

        {/* ✅ Complaint Form (same logic, faculty card style) */}
        {showComplaintForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Submit New Complaint
            </h2>

            <form onSubmit={handleSubmitComplaint} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Brief summary of the issue"
                    value={newComplaint.title}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        title: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newComplaint.category}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="Infrastructure">Infrastructure</option>
                    <option value="Food Services">Food Services</option>
                    <option value="IT Services">IT Services</option>
                    <option value="Academic">Academic</option>
                    <option value="Administration">Administration</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <select
                    value={newComplaint.priority}
                    onChange={(e) =>
                      setNewComplaint({
                        ...newComplaint,
                        priority: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                {/* Anonymous */}
                <div className="flex items-end">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newComplaint.anonymous}
                      onChange={(e) =>
                        setNewComplaint({
                          ...newComplaint,
                          anonymous: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 font-medium">
                      Submit Anonymously
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) =>
                    setNewComplaint({
                      ...newComplaint,
                      description: e.target.value,
                    })
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments (Max 3 Images)
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) =>
                    setSelectedFiles(Array.from(e.target.files).slice(0, 3))
                  }
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                             file:rounded-full file:border-0 file:text-sm file:font-semibold
                             file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit Complaint"}
              </button>
            </form>
          </div>
        )}

        {/* ✅ Complaints List (faculty card style) */}
        <div
          ref={complaintsSectionRef}
          className="bg-white rounded-xl shadow-lg p-8 scroll-mt-10"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              My Recent Complaints
            </h2>
            <button
              onClick={fetchMyComplaints}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Refresh List
            </button>
          </div>

          {loadingComplaints ? (
            <p className="text-gray-600">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p className="text-gray-600">
              You haven't submitted any complaints yet.
            </p>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {complaint.title}
                      </h3>

                      <p className="text-sm text-gray-500 mb-2">
                        Category: {complaint.category} •{" "}
                        {complaint.createdAt
                          ? new Date(complaint.createdAt).toLocaleDateString()
                          : ""}
                      </p>

                      <p className="text-gray-600 mb-3">
                        {complaint.description}
                      </p>

                      <div className="flex items-center gap-2">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          {complaint.category}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority} Priority
                        </span>
                      </div>

                      {/* Images */}
                      {complaint.images && complaint.images.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {complaint.images.map((img, idx) => (
                            <img
                              key={idx}
                              src={`${BACKEND_URL}${img}`}
                              alt="Complaint"
                              className="w-24 h-24 object-cover rounded-lg border"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-4">
                      <span
                        className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                          complaint.status
                        )} block text-center mb-3`}
                      >
                        {complaint.status === "submitted"
                          ? "Submitted"
                          : complaint.status === "in-progress"
                          ? "In Progress"
                          : complaint.status === "resolved"
                          ? "Resolved"
                          : complaint.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ✅ EXACT faculty card style component */
const StatCard = ({ title, count, gradient, iconPath }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{count}</p>
        </div>

        <div
          className={`bg-gradient-to-br ${gradient} text-white p-4 rounded-lg`}
        >
          <svg
            className="w-8 h-8"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {iconPath}
          </svg>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
