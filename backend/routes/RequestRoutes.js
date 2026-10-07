import express from "express";
import { requireRole, selfOrAdmin, validIds } from "../middleware/auth.js";
import { createEmergencyRequest , getAllEmgReq , updateScheduleOrder,getMyEmergencyRequests,getZoneCaretakerRequests } from "../controller/RequestController.js";

const router = express.Router();

router.post("/create", requireRole("supervisor"), validIds("location"), createEmergencyRequest);
router.get("/getAllEmgReq", requireRole("admin"), getAllEmgReq);
router.put("/schedule-req/:id", requireRole("admin"), validIds("id"), updateScheduleOrder);
router.get("/my-requests/:supervisorId", requireRole("supervisor", "admin"), validIds("supervisorId"), selfOrAdmin("supervisorId"), getMyEmergencyRequests);
router.get("/zone-caretaker-requests/:supervisorId", requireRole("supervisor", "admin"), validIds("supervisorId"), selfOrAdmin("supervisorId"), getZoneCaretakerRequests);

export default router;