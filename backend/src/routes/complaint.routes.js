import express from "express";
import {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
} from "../controllers/complaint.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.middleware.js"; // ✅ IMPORTANT

const router = express.Router();

/* ✅ Student */

// ✅ Create complaint (with images)
router.post(
  "/",
  protect,
  authorize("student"),
  upload.array("images", 3), // ✅ max 3 images
  createComplaint
);

// ✅ Get own complaints
router.get("/my", protect, authorize("student"), getMyComplaints);

/* ✅ Admin */

// ✅ Get all complaints
router.get("/", protect, authorize("admin"), getAllComplaints);

// ✅ Assign complaint
router.put("/:id/assign", protect, authorize("admin"), assignComplaint);

export default router;
