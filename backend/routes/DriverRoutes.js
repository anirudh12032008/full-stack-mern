import express from "express";
import { requireRole, selfOrAdmin, validIds } from "../middleware/auth.js";
import {getTodayScheduledRequests,markAsArrived,markAsCompleted, getCompletedTasks} from "../controller/DriverController.js";

const router = express.Router();

router.use(requireRole("driver", "admin"));

router.get("/today-task", getTodayScheduledRequests);
router.put("/arrived/:id", validIds("id"), markAsArrived);
router.put("/completed/:id", validIds("id"), markAsCompleted);
router.get("/completed", getCompletedTasks);

export default router;