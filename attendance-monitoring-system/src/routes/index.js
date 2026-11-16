import { Router } from "express";
import healthRouter from "./health.js";
import attendanceRouter from "./attendance.js";
import adminReportsRouter from "./admin-reports.js";
import authRouter from "./auth.js";
import studentRouter from "./student.js";
import adminManagementRouter from "./admin-management.js";

const router = Router();
router.use("/health", healthRouter);
router.use("/auth", authRouter);
router.use("/attendance", attendanceRouter);
router.use("/student", studentRouter);
router.use("/admin", adminManagementRouter);
router.use("/admin", adminReportsRouter);

export default router;
