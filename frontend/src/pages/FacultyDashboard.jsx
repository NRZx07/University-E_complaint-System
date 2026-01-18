import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

const BACKEND_URL = "http://localhost:5000";

const FacultyDashboard = () => {
  const { user } = useAuth();

  // ✅ real data from backend
  const [complaints, setComplaints] = useState([]);

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateNote, setUpdateNote] = useState("");

  const [loadingComplaints, setLoadingComplaints] = useState(true);

  // ✅ Fetch assigned complaints from backend
  const fetchAssignedComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const res = await fetch(`${BACKEND_URL}/api/faculty/complaints`, {
        method: "GET",
        credentials: "include", // ✅ cookie auth
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load complaints");
        setComplaints([]);
        return;
      }

      setComplaints(data.complaints || []);
    } catch (err) {
      console.error(err);
      alert("Server error while loading complaints");
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchAssignedComplaints();
  }, []);

  // ✅ Status update API call
  const handleStatusUpdate = async (complaintId, newStatusUI) => {
    // UI statuses -> backend statuses
    const mapStatusToBackend = {
      Pending: "submitted",
      "In Progress": "in-progress",
      Resolved: "resolved",
    };

    const backendStatus = mapStatusToBackend[newStatusUI];
    if (!backendStatus) return alert("Invalid status");

    try {
      const res = await fetch(
        `${BACKEND_URL}/api/faculty/complaints/${complaintId}/status`,
        {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: backendStatus,
            note: updateNote, // ✅ optional, backend may ignore if not implemented
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to update status");
        return;
      }

      // ✅ Refresh list after update
      await fetchAssignedComplaints();

      setUpdateNote("");
      setSelectedComplaint(null);
    } catch (err) {
      console.error(err);
      alert("Server error while updating status");
    }
  };

  // ✅ status color (UI expects Pending/In Progress/Resolved)
  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Resolved":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-orange-100 text-orange-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // ✅ Convert backend complaint to your UI format (NO UI change)
  const mapComplaintForUI = (c) => {
    const statusMap = {
      submitted: "Pending",
      "in-progress": "In Progress",
      resolved: "Resolved",
    };

    const priorityMap = {
      low: "Low",
      medium: "Medium",
      high: "High",
    };

    return {
      _id: c._id, // keep backend id
      id: c._id?.slice(-6)?.toUpperCase() || "CMP",
      title: c.title,
      category: c.category,
      status: statusMap[c.status] || "Pending",
      priority: priorityMap[c.priority] || "Medium",
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      studentName: c.anonymous ? "Anonymous" : c.createdBy?.name || "Student",
      description: c.description,
      images: c.images || [],
    };
  };

  const uiComplaints = complaints.map(mapComplaintForUI);

  const pendingCount = uiComplaints.filter(
    (c) => c.status === "Pending"
  ).length;
  const inProgressCount = uiComplaints.filter(
    (c) => c.status === "In Progress"
  ).length;
  const resolvedCount = uiComplaints.filter(
    (c) => c.status === "Resolved"
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Faculty Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name} • {user?.department}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Assigned
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {uiComplaints.length}
                </p>
              </div>
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-lg">
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

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Pending</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {pendingCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white p-4 rounded-lg">
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

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">In Progress</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {inProgressCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-lg">
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {resolvedCount}
                </p>
              </div>
              <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-lg">
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
        </div>

        {/* Assigned Complaints */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            Assigned Complaints
          </h2>

          {loadingComplaints ? (
            <p className="text-gray-600">Loading complaints...</p>
          ) : uiComplaints.length === 0 ? (
            <p className="text-gray-600">No complaints assigned yet.</p>
          ) : (
            <div className="space-y-4">
              {uiComplaints.map((complaint) => (
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
                        ID: {complaint.id} • Submitted by:{" "}
                        {complaint.studentName} • {complaint.date}
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

                      {/* ✅ show uploaded images */}
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
                        {complaint.status}
                      </span>

                      <button
                        onClick={() => setSelectedComplaint(complaint)}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                      >
                        Update Status
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              Update Complaint Status
            </h3>
            <p className="text-gray-600 mb-6">ID: {selectedComplaint.id}</p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Status
                </label>

                <div className="space-y-2">
                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint._id, "Pending")
                    }
                    className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                      selectedComplaint.status === "Pending"
                        ? "bg-yellow-100 text-yellow-800 border-2 border-yellow-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Pending
                  </button>

                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint._id, "In Progress")
                    }
                    className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                      selectedComplaint.status === "In Progress"
                        ? "bg-blue-100 text-blue-800 border-2 border-blue-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    In Progress
                  </button>

                  <button
                    onClick={() =>
                      handleStatusUpdate(selectedComplaint._id, "Resolved")
                    }
                    className={`w-full px-4 py-3 rounded-lg text-left font-semibold transition-all ${
                      selectedComplaint.status === "Resolved"
                        ? "bg-green-100 text-green-800 border-2 border-green-500"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Resolved
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Update Note (Optional)
                </label>
                <textarea
                  value={updateNote}
                  onChange={(e) => setUpdateNote(e.target.value)}
                  rows="3"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Add a note about this update..."
                />
              </div>

              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setUpdateNote("");
                }}
                className="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
