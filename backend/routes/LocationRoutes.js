import express from "express";
import { requireRole, selfOrAdmin, validIds } from "../middleware/auth.js";
import { createLocation, getAllLocations, getLocationsByZone,getSingleLocation,updateLocation,deleteLocation} from "../controller/LocationController.js";

const router = express.Router();

router.post("/create", requireRole("admin"), createLocation);
router.get("/all", getAllLocations);
router.get("/get-location-by-zone/:zone", getLocationsByZone);
router.get("/single/:id", validIds("id"), getSingleLocation);
router.put("/update/:id", requireRole("admin"), validIds("id"), updateLocation);
router.delete("/delete/:id", requireRole("admin"), validIds("id"), deleteLocation);

export default router;