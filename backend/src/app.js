import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// routes
import authRoutes from "./routes/auth.routes.js";
import complaintRoutes from "./routes/complaint.routes.js";
import testRoutes from "./routes/test.routes.js";
import facultyRoutes from "./routes/faculty.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();

/* ✅ Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ✅ CORS */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ✅ (Optional) preflight for Express v5 - only regex works */
app.options(/.*/, cors());

/* ✅ Static file serving */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* ✅ Routes */
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/test", testRoutes);
app.use("/api/faculty", facultyRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/ai", aiRoutes);

export default app;
