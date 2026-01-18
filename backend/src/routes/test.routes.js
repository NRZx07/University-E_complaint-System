import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { authorize } from "../middleware/role.middleware.js";


const router = express.Router();

router.get("/public", (req, res) => {
  res.json({ message: "Public route working ✅" });
});

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "Protected route working ✅",
    user: req.user
  });
});

//admin only route
router.get("/admin", protect, authorize("admin"), (req, res) => {
  res.json({
    message: "Admin route working ✅",
    user: req.user
  });
});

export default router;
