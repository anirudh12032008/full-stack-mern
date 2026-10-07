import express from "express";
import { requireRole } from "../middleware/auth.js";
import { createEmergencyRequest , getAllEmgReq , updateScheduleOrder,getMyEmergencyRequests,getZoneCaretakerRequests } from "../controller/RequestController.js";

const router = express.Router();

router.post("/create", requireRole("supervisor"), createEmergencyRequest);
router.get("/getAllEmgReq", requireRole("admin"), getAllEmgReq);
router.put("/schedule-req/:id", requireRole("admin"), updateScheduleOrder);
router.get("/my-requests/:supervisorId", requireRole("supervisor", "admin"), getMyEmergencyRequests);
router.get("/zone-caretaker-requests/:supervisorId", requireRole("supervisor", "admin"), getZoneCaretakerRequests);

export default router;