import express from "express";
import { recommendFaculty, aiAssignFaculty } from "../controllers/aiController.js";
import { protect } from "../middleware/auth.middleware.js";
import { adminOnly } from "../middleware/role.middleware.js";


const router = express.Router();

// ✅ Recommend best faculty (doesn't assign, just suggests)
router.post("/recommend-faculty", protect, adminOnly, recommendFaculty);

// ✅ Assign best faculty automatically (for urgent / admin one-click)
router.post("/assign-faculty", protect, adminOnly, aiAssignFaculty);

export default router;
