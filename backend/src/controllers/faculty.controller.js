import Complaint from "../models/Complaint.js";

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

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ ensure this complaint belongs to this faculty
    if (!complaint.assignedTo || complaint.assignedTo.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    complaint.status = status;
    await complaint.save();

    return res.json({
      message: "Status updated ✅",
      complaint,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
