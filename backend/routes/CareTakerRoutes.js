import express from "express";
import { requireRole, selfOrAdmin, validIds } from "../middleware/auth.js";
import {assignHostelToCaretaker,getCaretakerRequests,getAllCaretakers,updateCaretakerHostel,getCaretakerHostel,createCaretakerRequest} from "../controller/CareTakerController.js";

const router = express.Router();

router.post("/caretaker-assign-hostel", requireRole("admin"), validIds("caretakerId", "locationId"), assignHostelToCaretaker);
router.get("/caretaker-req/:caretakerId", requireRole("caretaker", "admin"), validIds("caretakerId"), selfOrAdmin("caretakerId"), getCaretakerRequests);
router.get("/all-caretakers", requireRole("admin"), getAllCaretakers);
router.put("/caretaker-update-hostel", requireRole("admin"), validIds("caretakerId", "locationId"), updateCaretakerHostel);
router.get("/caretaker-hostel/:caretakerId", requireRole("caretaker", "admin"), validIds("caretakerId"), selfOrAdmin("caretakerId"), getCaretakerHostel);
router.post("/create-caretaker-request", requireRole("caretaker"), createCaretakerRequest);

export default router;