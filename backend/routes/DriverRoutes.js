import express from "express";
import { requireRole } from "../middleware/auth.js";
import {getTodayScheduledRequests,markAsArrived,markAsCompleted, getCompletedTasks} from "../controller/DriverController.js";

const router = express.Router();

router.use(requireRole("driver", "admin"));

router.get("/today-task", getTodayScheduledRequests);
router.put("/arrived/:id", markAsArrived);
router.put("/completed/:id", markAsCompleted);
router.get("/completed", getCompletedTasks);

export default router;