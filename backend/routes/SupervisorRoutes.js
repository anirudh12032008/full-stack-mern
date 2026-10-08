import express from "express";
import { requireRole } from "../middleware/auth.js";

import {assignZoneToSupervisor, getSupervisorLocations} from "../controller/SupervisorController.js";

const router = express.Router();

router.put("/assign-zone", requireRole("admin"), assignZoneToSupervisor);
router.get("/getsupervisor-location/:id", requireRole("supervisor", "admin"), getSupervisorLocations);

export default router;