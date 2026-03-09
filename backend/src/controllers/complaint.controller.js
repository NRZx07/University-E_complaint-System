import Complaint from "../models/Complaint.js";
import { sendEmail } from "../utils/sendEmail.js";
import User from "../models/User.js";

// 🔥 Short ID generator
const getShortId = (id) => `CMP-${id.toString().slice(-6).toUpperCase()}`;

/**
 * @desc   Create complaint (Student)
 */
export const createComplaint = async (req, res) => {
  try {
    const { title, description, category, priority, anonymous } = req.body;

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
      images: imageUrls,
    });

    const shortId = getShortId(complaint._id);

    // 1. Respond to user IMMEDIATELY for speed
    res.status(201).json({
      message: "Complaint created ✅",
      complaintId: shortId,
      complaint,
    });

    // 2. Background email logic
    const triggerBackgroundEmails = async () => {
      try {
        console.log("--- 📧 Starting Background Email Process ---");
        
        // Ensure student exists
        const student = await User.findById(req.user.id);
        
        // Find admins using CASE-INSENSITIVE search (Fixes "Admin" vs "admin" issue)
        const admins = await User.find({ role: { $regex: /^admin$/i } });

        console.log(`DEBUG: Student found: ${student?.email || "No"}`);
        console.log(`DEBUG: Admins found: ${admins.length}`);

        // Email Student
        if (student?.email) {
          sendEmail({
            to: student.email,
            subject: `Complaint Submitted (${shortId})`,
            html: `<h2>Complaint Submitted ✅</h2><p>ID: ${shortId}</p><p>Title: ${title}</p>`,
          }).catch(err => console.error("❌ Student email failed:", err.message));
        }

        // Email Admins
        admins.forEach(admin => {
          if (admin.email) {
            console.log(`DEBUG: Dispatching email to Admin: ${admin.email}`);
            sendEmail({
              to: admin.email,
              subject: `New Complaint (${shortId})`,
              html: `<h3>New Complaint Received</h3><p>ID: ${shortId}</p><p>Title: ${title}</p>`,
            }).catch(err => console.error(`❌ Admin email failed for ${admin.email}:`, err.message));
          }
        });
      } catch (e) {
        console.error("🔥 Background email crash:", e.message);
      }
    };

    triggerBackgroundEmails();

  } catch (err) {
    if (!res.headersSent) {
      return res.status(500).json({ message: err.message });
    }
  }
};

/**
 * @desc   Admin: assign complaint
 */
export const assignComplaint = async (req, res) => {
  try {
    const { facultyId } = req.body;

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.assignedTo = facultyId;
    complaint.status = "in-progress";
    await complaint.save();

    const shortId = getShortId(complaint._id);

    res.json({ message: "Complaint assigned ✅", complaint });

    // Background email to Faculty
    const faculty = await User.findById(facultyId);
    if (faculty?.email) {
      console.log(`DEBUG: Notifying Faculty: ${faculty.email}`);
      sendEmail({
        to: faculty.email,
        subject: `New Complaint Assigned (${shortId})`,
        html: `<h2>New Task Assigned</h2><p>ID: ${shortId}</p><p>${complaint.title}</p>`,
      }).catch(err => console.error("❌ Faculty email failed:", err.message));
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

/**
 * @desc   Update complaint status (Resolved)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    let { status } = req.body;
    status = status.trim().toLowerCase();

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    const shortId = getShortId(complaint._id);

    res.json({ message: "Status updated ✅", complaint });

    if (status === "resolved") {
      const emailTasks = async () => {
        try {
          const student = await User.findById(complaint.createdBy);
          const faculty = complaint.assignedTo ? await User.findById(complaint.assignedTo) : null;
          const admins = await User.find({ role: { $regex: /^admin$/i } });

          if (student?.email) {
            sendEmail({
              to: student.email,
              subject: `Complaint Resolved (${shortId}) 🎉`,
              html: `<h2>Resolved</h2><p>Your complaint ${shortId} is now closed.</p>`
            }).catch(() => {});
          }

          if (faculty?.email) {
            sendEmail({
              to: faculty.email,
              subject: `Complaint Closed (${shortId})`,
              html: `<p>Task ${shortId} completed.</p>`
            }).catch(() => {});
          }

          admins.forEach(admin => {
            if (admin.email) {
              sendEmail({
                to: admin.email,
                subject: `Resolved: ${shortId}`,
                html: `<p>Complaint ${shortId} marked as resolved.</p>`
              }).catch(() => {});
            }
          });
        } catch (err) {
          console.error("Resolution email worker failed:", err.message);
        }
      };
      emailTasks();
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ message: err.message });
  }
};

export const getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ createdBy: req.user.id }).sort({ createdAt: -1 });
  return res.json({ complaints });
};

export const getAllComplaints = async (req, res) => {
  const complaints = await Complaint.find()
    .populate("createdBy", "name email role")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });
  return res.json({ complaints });
};