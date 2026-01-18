import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import CreateFaculty from "./CreateFaculty";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from "chart.js";
import { Bar, Pie, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const BACKEND_URL = "http://localhost:5000";

const AdminDashboard = () => {
  const { user } = useAuth();

  // ✅ Complaints from backend
  const [complaints, setComplaints] = useState([]);

  // ✅ Faculty list from backend
  const [facultyList, setFacultyList] = useState([]);

  // Assign modal
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignToFaculty, setAssignToFaculty] = useState("");

  // Faculty Management
  const [showCreateFaculty, setShowCreateFaculty] = useState(false);

  // Reassign modal
  const [reassignModalOpen, setReassignModalOpen] = useState(false);
  const [reassignFromFaculty, setReassignFromFaculty] = useState(null);
  const [reassignToFaculty, setReassignToFaculty] = useState("");
  const [reassigningNow, setReassigningNow] = useState(false);

  // Loading states
  const [loadingComplaints, setLoadingComplaints] = useState(true);
  const [loadingFaculty, setLoadingFaculty] = useState(true);
  const [assigning, setAssigning] = useState(false);

  // AI states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null); // { facultyId, facultyName, reason, confidence }

  // ✅ backend -> UI mapping
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
      _id: c._id,
      id: c._id?.slice(-6)?.toUpperCase() || "CMP",
      title: c.title,
      category: c.category,
      status: statusMap[c.status] || "Pending",
      priority: priorityMap[c.priority] || "Medium",
      assignedTo: c.assignedTo?.name || "Unassigned",
      assignedToId: c.assignedTo?._id || "",
      date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "",
      raw: c,
    };
  };

  // ✅ Fetch complaints
  const fetchAllComplaints = async () => {
    try {
      setLoadingComplaints(true);

      const res = await fetch(`${BACKEND_URL}/api/complaints`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load complaints");
        setComplaints([]);
        return;
      }

      setComplaints((data.complaints || []).map(mapComplaintForUI));
    } catch (err) {
      console.error(err);
      alert("Server error while loading complaints");
    } finally {
      setLoadingComplaints(false);
    }
  };

  // ✅ Fetch faculty list
  const fetchFacultyList = async () => {
    try {
      setLoadingFaculty(true);

      const res = await fetch(`${BACKEND_URL}/api/admin/faculty`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load faculty list");
        setFacultyList([]);
        return;
      }

      setFacultyList(data.faculty || []);
    } catch (err) {
      console.error(err);
      alert("Server error while loading faculty list");
    } finally {
      setLoadingFaculty(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
    fetchFacultyList();
  }, []);

  // ✅ Assign complaint (manual)
  const assignComplaint = async () => {
    if (!selectedComplaint?._id) return;
    if (!assignToFaculty) return alert("Please select faculty");

    try {
      setAssigning(true);

      const res = await fetch(
        `${BACKEND_URL}/api/complaints/${selectedComplaint._id}/assign`,
        {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ facultyId: assignToFaculty }),
        }
      );

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Assignment failed");
        return;
      }

      alert("Assigned ✅");
      setSelectedComplaint(null);
      setAssignToFaculty("");
      setAiSuggestion(null);

      fetchAllComplaints();
    } catch (err) {
      console.error(err);
      alert("Server error while assigning");
    } finally {
      setAssigning(false);
    }
  };

  // ✅ Delete faculty (SAFE)
  const handleDeleteFaculty = async (facultyId) => {
    const ok = window.confirm(
      "Delete this faculty? (Blocked if any pending/in-progress complaints exist)"
    );
    if (!ok) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/faculty/${facultyId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Delete failed");
        return;
      }

      alert("Faculty deleted ✅");
      fetchFacultyList();
      fetchAllComplaints();
    } catch (err) {
      console.error(err);
      alert("Server error while deleting faculty");
    }
  };

  // ✅ Reassign complaints from one faculty to another
  const handleReassignComplaints = async () => {
    if (!reassignFromFaculty?._id) return;
    if (!reassignToFaculty) return alert("Select target faculty");

    try {
      setReassigningNow(true);

      const res = await fetch(
        `${BACKEND_URL}/api/admin/faculty/${reassignFromFaculty._id}/reassign/${reassignToFaculty}`,
        {
          method: "PUT",
          credentials: "include",
        }
      );

      const data = await res.json();
      if (!res.ok) return alert(data.message || "Reassign failed");

      alert(`Reassigned ✅ (${data.reassignedCount} complaints)`);

      setReassignModalOpen(false);
      setReassignFromFaculty(null);
      setReassignToFaculty("");

      fetchAllComplaints();
      fetchFacultyList();
    } catch (err) {
      console.error(err);
      alert("Server error while reassigning complaints");
    } finally {
      setReassigningNow(false);
    }
  };

  // ✅ AI Suggest faculty
  const getAISuggestion = async (complaint) => {
    try {
      setAiLoading(true);
      setAiSuggestion(null);

      const res = await fetch(`${BACKEND_URL}/api/ai/recommend-faculty`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: complaint._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "AI recommendation failed");
        return;
      }

      setAiSuggestion(data.suggestion);
    } catch (err) {
      console.error(err);
      alert("Server error while generating AI suggestion");
    } finally {
      setAiLoading(false);
    }
  };

  // ✅ AI Auto assign
  const aiAssignNow = async (complaint) => {
    try {
      setAiLoading(true);

      const res = await fetch(`${BACKEND_URL}/api/ai/assign-faculty`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complaintId: complaint._id }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "AI assign failed");
        return;
      }

      alert("Assigned by AI ✅");
      fetchAllComplaints();
      fetchFacultyList();
    } catch (err) {
      console.error(err);
      alert("Server error while AI assigning");
    } finally {
      setAiLoading(false);
    }
  };

  // helpers
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

  // stats
  const statusCounts = useMemo(() => {
    const counts = { Pending: 0, "In Progress": 0, Resolved: 0 };
    complaints.forEach((c) => {
      counts[c.status] = (counts[c.status] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  // charts
  const categoryCounts = useMemo(() => {
    const counts = {};
    complaints.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  const categoryData = {
    labels: Object.keys(categoryCounts).length
      ? Object.keys(categoryCounts)
      : ["No Data"],
    datasets: [
      {
        label: "Complaints by Category",
        data: Object.keys(categoryCounts).length
          ? Object.values(categoryCounts)
          : [0],
        backgroundColor: [
          "rgba(59, 130, 246, 0.8)",
          "rgba(168, 85, 247, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 146, 60, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const statusData = {
    labels: ["Pending", "In Progress", "Resolved"],
    datasets: [
      {
        label: "Complaints by Status",
        data: [
          statusCounts["Pending"],
          statusCounts["In Progress"],
          statusCounts["Resolved"],
        ],
        backgroundColor: [
          "rgba(251, 191, 36, 0.8)",
          "rgba(59, 130, 246, 0.8)",
          "rgba(34, 197, 94, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const trendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "New Complaints",
        data: [12, 19, 15, 18],
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        tension: 0.4,
        fill: true,
      },
      {
        label: "Resolved",
        data: [8, 15, 12, 16],
        borderColor: "rgb(34, 197, 94)",
        backgroundColor: "rgba(34, 197, 94, 0.1)",
        tension: 0.4,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user?.name} • System Administrator
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Total Complaints
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {complaints.length}
                </p>
                <p className="text-green-600 text-sm mt-2">
                  System updated live
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

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">Resolved</p>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {statusCounts["Resolved"]}
                </p>
                <p className="text-green-600 text-sm mt-2">Auto updated</p>
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

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Avg Resolution Time
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">3.5d</p>
                <p className="text-green-600 text-sm mt-2">Demo value</p>
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium">
                  Satisfaction Rate
                </p>
                <p className="text-3xl font-bold text-gray-800 mt-2">94%</p>
                <p className="text-green-600 text-sm mt-2">Demo value</p>
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
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Complaints by Category
            </h3>
            <div className="h-64">
              <Bar data={categoryData} options={chartOptions} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              Status Distribution
            </h3>
            <div className="h-64">
              <Pie data={statusData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Complaint Trends
          </h3>
          <div className="h-64">
            <Line data={trendData} options={chartOptions} />
          </div>
        </div>

        {/* ✅ Faculty Management */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              Faculty Management
            </h2>

            <button
              onClick={() => setShowCreateFaculty((p) => !p)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
            >
              {showCreateFaculty ? "Close" : "+ Create Faculty"}
            </button>
          </div>

          {showCreateFaculty && (
            <div className="mb-6 bg-gray-50 p-6 rounded-xl border">
              <CreateFaculty onCreated={fetchFacultyList} />
            </div>
          )}

          <div className="flex items-center justify-between mb-3">
            <p className="text-gray-600 font-medium">Faculty List</p>

            <button
              onClick={fetchFacultyList}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-2 rounded-lg text-sm font-semibold"
            >
              ↻ Refresh
            </button>
          </div>

          {loadingFaculty ? (
            <p className="text-gray-500">Loading faculty...</p>
          ) : facultyList.length === 0 ? (
            <p className="text-gray-500">No faculty found.</p>
          ) : (
            <div className="space-y-3">
              {facultyList.map((f) => (
                <div
                  key={f._id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-sm transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{f.name}</p>
                    <p className="text-sm text-gray-500">{f.email}</p>
                    {f.department && (
                      <p className="text-xs text-gray-400 mt-1">
                        {f.department}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setReassignFromFaculty(f);
                        setReassignModalOpen(true);
                        setReassignToFaculty("");
                      }}
                      className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-200 transition"
                    >
                      Reassign
                    </button>

                    <button
                      onClick={() => handleDeleteFaculty(f._id)}
                      className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-200 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All Complaints */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">All Complaints</h2>

            <button
              onClick={fetchAllComplaints}
              className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ↻ Refresh
            </button>
          </div>

          {loadingComplaints ? (
            <p className="text-gray-600">Loading complaints...</p>
          ) : complaints.length === 0 ? (
            <p className="text-gray-600">No complaints found.</p>
          ) : (
            <div className="space-y-4">
              {complaints.map((complaint) => (
                <div
                  key={complaint._id}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {complaint.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">
                        ID: {complaint.id} • {complaint.date}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-700">
                          {complaint.category}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                            complaint.status
                          )}`}
                        >
                          {complaint.status}
                        </span>

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                            complaint.priority
                          )}`}
                        >
                          {complaint.priority}
                        </span>

                        {complaint.priority === "High" &&
                          complaint.assignedTo === "Unassigned" &&
                          complaint.status !== "Resolved" && (
                            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              URGENT
                            </span>
                          )}
                      </div>

                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Assigned to:</span>{" "}
                        {complaint.assignedTo}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="mt-4 md:mt-0 md:ml-4 flex flex-col gap-2">
                      {complaint.status !== "Resolved" ? (
                        <button
                          onClick={() => {
                            setSelectedComplaint(complaint);
                            setAssignToFaculty(complaint.assignedToId || "");
                            setAiSuggestion(null);
                          }}
                          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all"
                        >
                          Assign Faculty
                        </button>
                      ) : (
                        <button
                          disabled
                          className="bg-gray-200 text-gray-500 px-4 py-2 rounded-lg text-sm font-semibold cursor-not-allowed"
                        >
                          Resolved
                        </button>
                      )}

                      {complaint.status !== "Resolved" &&
                        complaint.priority === "High" &&
                        complaint.assignedTo === "Unassigned" && (
                          <button
                            onClick={() => aiAssignNow(complaint)}
                            disabled={aiLoading}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-700 transition-all disabled:opacity-50"
                          >
                            {aiLoading ? "AI Assigning..." : "⚡ AI Assign Now"}
                          </button>
                        )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Assign Faculty Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Assign to Faculty
                </h3>
                <p className="text-gray-600 mt-1">
                  Complaint:{" "}
                  <span className="font-semibold">
                    {selectedComplaint.title}
                  </span>
                </p>
                <p className="text-gray-500 text-sm">
                  ID: {selectedComplaint.id}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedComplaint(null);
                  setAssignToFaculty("");
                  setAiSuggestion(null);
                }}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* ✅ AI Recommendation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-blue-900">
                  AI Recommendation
                </p>

                <button
                  onClick={() => getAISuggestion(selectedComplaint)}
                  disabled={aiLoading}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {aiLoading ? "Analyzing..." : "✨ Get Suggestion"}
                </button>
              </div>

              {!aiSuggestion ? (
                <p className="text-sm text-blue-800 mt-2">
                  Click “Get Suggestion” to recommend best faculty
                  automatically.
                </p>
              ) : (
                <div className="mt-3">
                  <p className="text-sm text-gray-800">
                    ✅ Suggested:{" "}
                    <span className="font-bold">
                      {aiSuggestion.facultyName}
                    </span>
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {aiSuggestion.reason}
                    {typeof aiSuggestion.confidence === "number" && (
                      <span className="ml-2 text-blue-700 font-semibold">
                        ({Math.round(aiSuggestion.confidence * 100)}%)
                      </span>
                    )}
                  </p>

                  <button
                    onClick={() => setAssignToFaculty(aiSuggestion.facultyId)}
                    className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all"
                  >
                    Apply Suggested Faculty
                  </button>
                </div>
              )}
            </div>

            {/* Select faculty */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Select Faculty Member
              </label>

              <div className="flex gap-2">
                <select
                  value={assignToFaculty}
                  onChange={(e) => setAssignToFaculty(e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">-- Select Faculty --</option>
                  {loadingFaculty ? (
                    <option disabled>Loading...</option>
                  ) : facultyList.length === 0 ? (
                    <option disabled>No faculty found</option>
                  ) : (
                    facultyList.map((f) => (
                      <option key={f._id} value={f._id}>
                        {f.name} ({f.email})
                      </option>
                    ))
                  )}
                </select>

                <button
                  onClick={fetchFacultyList}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold"
                >
                  ↻
                </button>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  disabled={assigning}
                  onClick={assignComplaint}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {assigning ? "Assigning..." : "Assign"}
                </button>

                <button
                  onClick={() => {
                    setSelectedComplaint(null);
                    setAssignToFaculty("");
                    setAiSuggestion(null);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ REASSIGN MODAL */}
      {reassignModalOpen && reassignFromFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">
                  Reassign Complaints
                </h3>
                <p className="text-gray-600 mt-1">
                  From:{" "}
                  <span className="font-semibold">
                    {reassignFromFaculty.name}
                  </span>
                </p>
              </div>

              <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setReassignFromFaculty(null);
                  setReassignToFaculty("");
                }}
                className="text-gray-500 hover:text-gray-800 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Target Faculty
            </label>

            <select
              value={reassignToFaculty}
              onChange={(e) => setReassignToFaculty(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">-- Select Faculty --</option>
              {facultyList
                .filter((x) => x._id !== reassignFromFaculty._id)
                .map((x) => (
                  <option key={x._id} value={x._id}>
                    {x.name} ({x.email})
                  </option>
                ))}
            </select>

            <div className="flex gap-3 pt-6">
              <button
                onClick={handleReassignComplaints}
                disabled={reassigningNow}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {reassigningNow ? "Reassigning..." : "Reassign Now"}
              </button>

              <button
                onClick={() => {
                  setReassignModalOpen(false);
                  setReassignFromFaculty(null);
                  setReassignToFaculty("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
