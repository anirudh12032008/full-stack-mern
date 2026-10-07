import express from "express";
import { requireRole, selfOrAdmin, validIds } from "../middleware/auth.js";

import {assignZoneToSupervisor, getSupervisorLocations} from "../controller/SupervisorController.js";

const router = express.Router();

router.put("/assign-zone", requireRole("admin"), validIds("supervisorId"), assignZoneToSupervisor);
router.get("/getsupervisor-location/:id", requireRole("supervisor", "admin"), validIds("id"), selfOrAdmin("id"), getSupervisorLocations);

export default router;