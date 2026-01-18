import Complaint from "../models/Complaint.js";

/**
 * @desc   Create complaint (Student)
 * @route  POST /api/complaints
 */
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, anonymous } = req.body;

    // ✅ collect uploaded images
    const imageUrls = (req.files || []).map(
      (file) => `/uploads/${file.filename}`
    );

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      anonymous: anonymous === "true" || anonymous === true,
      createdBy: req.user.id,
      images: imageUrls, // ✅ THIS LINE saves image paths
    });

    return res.status(201).json({
      message: "Complaint created ✅",
      complaint,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

/**
 * @desc   Get complaints of logged-in user
 * @route  GET /api/complaints/my
 */
export const getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user.id }).sort({
    createdAt: -1,
  });

  return res.json({ complaints }); // ✅ FIX
};

/**
 * @desc   Admin: get all complaints
 * @route  GET /api/complaints
 */
export const getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find()
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  return res.json({ complaints }); // ✅ FIX
};

/**
 * @desc   Admin: assign complaint to faculty
 * @route  PUT /api/complaints/:id/assign
 */
export const assignComplaint = async (req, res) => {
  const { facultyId } = req.body;

  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) {
    return res.status(404).json({ message: "Complaint not found" });
  }

  complaint.assignedTo = facultyId;
  complaint.status = "in-progress";
  await complaint.save();

  return res.json({
    message: "Complaint assigned ✅",
    complaint,
  });
};

//✅ Update complaint status (Faculty/Admin)

export const updateComplaintStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowed = ["submitted", "in-progress", "resolved"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
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

