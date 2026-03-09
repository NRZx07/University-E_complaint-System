import Complaint from "../models/Complaint.js";
import { sendEmail } from "../utils/sendEmail.js";

// ✅ GET assigned complaints for faculty
export const getAssignedComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ assignedTo: req.user.id })
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json({ complaints });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ✅ Faculty update status (only for assigned complaints)
export const updateComplaintStatusFaculty = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["in-progress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Allowed: in-progress, resolved",
      });
    }

    // ✅ 1. Populate 'createdBy' to get the student's email for the notification
    const complaint = await Complaint.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ 2. Ensure this complaint belongs to the logged-in faculty
    if (
      !complaint.assignedTo ||
      complaint.assignedTo.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    complaint.status = status;
    await complaint.save();

    // 🚀 3. TRIGGER EMAIL LOGIC
    if (status === "resolved") {
      console.log("DEBUG: Status is resolved, preparing email...");

      try {
        // We use 'to' and 'html' to match your sendEmail utility exactly
        await sendEmail({
          to: complaint.createdBy.email,
          subject: `Complaint Resolved: ${complaint.title} ✅`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
              <h2 style="color: #2e7d32;">Complaint Resolved</h2>
              <p>Hello <strong>${complaint.createdBy.name}</strong>,</p>
              <p>Your complaint regarding <strong>"${complaint.title}"</strong> has been marked as <strong>Resolved</strong>.</p>
              <p>We hope the solution is satisfactory. Thank you for using the E-Complaint system.</p>
              <br />
              <p style="font-size: 0.8em; color: #777;">This is an automated notification.</p>
            </div>
          `,
        });
        // Success log will appear from inside your sendEmail utility
      } catch (mailErr) {
        console.error("❌ Notification skipped due to mail error:", mailErr.message);
      }
    }

    return res.json({
      message: "Status updated ✅",
      complaint,
    });
  } catch (err) {
    console.error("Update Error:", err);
    return res.status(500).json({ message: err.message });
  }
};