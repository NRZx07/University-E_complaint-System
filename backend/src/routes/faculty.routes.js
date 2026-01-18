import express from "express";
import {
  getAssignedComplaints,
  updateComplaintStatusFaculty,
} from "../controllers/faculty.controller.js";

import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";

const router = express.Router();

// ✅ Faculty: view assigned complaints
router.get("/complaints", protect, authorize("faculty"), getAssignedComplaints);

// ✅ Faculty: update status
router.patch(
  "/complaints/:id/status",
  protect,
  authorize("faculty"),
  updateComplaintStatusFaculty
);

export default router;
