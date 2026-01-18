import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Complaint from "../models/Complaint.js";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

/* ✅ Get faculty list */
router.get("/faculty", protect, authorize("admin"), async (req, res) => {
  try {
    const faculty = await User.find({ role: "faculty" }).select("-password");
    return res.json({ faculty });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ✅ Admin creates a faculty account */
router.post("/faculty", protect, authorize("admin"), async (req, res) => {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !email || !password || !department) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedEmail = email.toLowerCase();

    const exists = await User.findOne({ email: normalizedEmail });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const faculty = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "faculty",
      department,
    });

    return res.status(201).json({
      message: "Faculty account created ✅",
      faculty: {
        id: faculty._id,
        name: faculty.name,
        email: faculty.email,
        role: faculty.role,
        department: faculty.department,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ✅ Admin deletes faculty (SAFE - blocked if unresolved complaints exist) */
router.delete("/faculty/:id", protect, authorize("admin"), async (req, res) => {
  try {
    const facultyId = req.params.id;

    const faculty = await User.findById(facultyId);
    if (!faculty) {
      return res.status(404).json({ message: "Faculty not found" });
    }

    if (faculty.role !== "faculty") {
      return res.status(400).json({ message: "Only faculty can be deleted" });
    }

    // ✅ block delete if unresolved complaints exist
    const unresolvedCount = await Complaint.countDocuments({
      assignedTo: facultyId,
      status: { $in: ["submitted", "in-progress"] },
    });

    if (unresolvedCount > 0) {
      return res.status(400).json({
        message: `Cannot delete faculty. ${unresolvedCount} complaints are still pending/in-progress.`,
      });
    }

    // ✅ unassign resolved complaints (optional)
    await Complaint.updateMany(
      { assignedTo: facultyId },
      { $set: { assignedTo: null } }
    );

    await User.findByIdAndDelete(facultyId);

    return res.json({ message: "Faculty deleted ✅" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
});

/* ✅ Reassign unresolved complaints from one faculty to another */
router.put(
  "/faculty/:fromId/reassign/:toId",
  protect,
  authorize("admin"),
  async (req, res) => {
    try {
      const { fromId, toId } = req.params;

      if (fromId === toId) {
        return res
          .status(400)
          .json({ message: "Cannot reassign to same faculty" });
      }

      const fromFaculty = await User.findById(fromId);
      const toFaculty = await User.findById(toId);

      if (!fromFaculty || fromFaculty.role !== "faculty") {
        return res.status(404).json({ message: "Source faculty not found" });
      }

      if (!toFaculty || toFaculty.role !== "faculty") {
        return res.status(404).json({ message: "Target faculty not found" });
      }

      // ✅ only unresolved complaints are reassigned
      const result = await Complaint.updateMany(
        { assignedTo: fromId, status: { $in: ["submitted", "in-progress"] } },
        { $set: { assignedTo: toId } }
      );

      return res.json({
        message: "Reassigned complaints ✅",
        reassignedCount: result.modifiedCount || 0,
      });
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  }
);

export default router;
