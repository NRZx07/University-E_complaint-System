import Complaint from "../models/Complaint.js";
import User from "../models/User.js";

/**
 * ✅ Category → Department mapping (customize for your university)
 */
const categoryToDepartment = {
  Infrastructure: "Maintenance",
  "Food Services": "Food Services",
  "IT Services": "IT",
  Academic: "Academic",
  Administration: "Administration",
  Others: "Administration",
};

/**
 * ✅ Get department from category
 */
const resolveDepartment = (category) => {
  return categoryToDepartment[category] || "Administration";
};

/**
 * ✅ Workload score (lower is better)
 * Workload = pending + inprogress (resolved not counted)
 */
const computeFacultyWorkload = async (facultyId) => {
  const activeCount = await Complaint.countDocuments({
    assignedTo: facultyId,
    status: { $in: ["submitted", "in-progress"] },
  });

  return activeCount;
};

/**
 * ✅ Choose best faculty by:
 * 1) department match (if available in faculty profile)
 * 2) least workload
 */
const pickBestFaculty = async (complaint, facultyList) => {
  const targetDept = resolveDepartment(complaint.category);

  // ✅ If your faculty have department field, filter matching dept first
  const deptMatched = facultyList.filter(
    (f) => f.department && f.department.toLowerCase() === targetDept.toLowerCase()
  );

  const candidates = deptMatched.length > 0 ? deptMatched : facultyList;

  if (candidates.length === 0) return null;

  // ✅ Calculate workloads
  const scored = await Promise.all(
    candidates.map(async (f) => {
      const load = await computeFacultyWorkload(f._id);
      return {
        faculty: f,
        workload: load,
      };
    })
  );

  // ✅ Sort by least workload
  scored.sort((a, b) => a.workload - b.workload);

  const best = scored[0];

  // ✅ Simple confidence (for UI)
  const confidence =
    candidates.length === 1
      ? 0.85
      : Math.max(0.55, Math.min(0.95, 0.9 - best.workload * 0.05));

  return {
    facultyId: best.faculty._id,
    facultyName: best.faculty.name,
    department: best.faculty.department || "N/A",
    workload: best.workload,
    confidence,
    reason:
      deptMatched.length > 0
        ? `Matched department "${targetDept}" and has lowest workload (${best.workload} active complaints).`
        : `No exact department match found. Selected faculty with lowest workload (${best.workload} active complaints).`,
  };
};

/**
 * ✅ POST /api/ai/recommend-faculty
 * Body: { complaintId }
 */
export const recommendFaculty = async (req, res) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({ message: "complaintId is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ If already assigned, still allow suggestion but mention it
    const facultyList = await User.find({ role: "faculty" }).select(
      "_id name email department"
    );

    if (!facultyList.length) {
      return res.status(404).json({ message: "No faculty found in system" });
    }

    const suggestion = await pickBestFaculty(complaint, facultyList);

    if (!suggestion) {
      return res.status(404).json({ message: "No suitable faculty found" });
    }

    return res.status(200).json({
      suggestion,
    });
  } catch (err) {
    console.error("recommendFaculty error:", err);
    return res.status(500).json({ message: "Server error in AI recommend" });
  }
};

/**
 * ✅ POST /api/ai/assign-faculty
 * Body: { complaintId }
 */
export const aiAssignFaculty = async (req, res) => {
  try {
    const { complaintId } = req.body;

    if (!complaintId) {
      return res.status(400).json({ message: "complaintId is required" });
    }

    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ Auto-assign should be mostly for unassigned complaints
    if (complaint.assignedTo) {
      return res.status(400).json({
        message: "Complaint already assigned. Use manual reassignment if needed.",
      });
    }

    const facultyList = await User.find({ role: "faculty" }).select(
      "_id name email department"
    );

    if (!facultyList.length) {
      return res.status(404).json({ message: "No faculty found in system" });
    }

    const suggestion = await pickBestFaculty(complaint, facultyList);

    if (!suggestion) {
      return res.status(404).json({ message: "No suitable faculty found" });
    }

    // ✅ Assign
    complaint.assignedTo = suggestion.facultyId;

    // ✅ If urgent, push complaint to action faster:
    // If high priority -> set in-progress automatically
    if (complaint.priority === "high") {
      complaint.status = "in-progress";
    }

    // ✅ Save note for transparency
    complaint.notes.push({
      message: `Assigned by AI to ${suggestion.facultyName}. Reason: ${suggestion.reason}`,
      createdBy: req.user._id,
    });

    await complaint.save();

    return res.status(200).json({
      message: "Assigned by AI successfully",
      assignedTo: suggestion.facultyName,
      suggestion,
    });
  } catch (err) {
    console.error("aiAssignFaculty error:", err);
    return res.status(500).json({ message: "Server error in AI assign" });
  }
};
