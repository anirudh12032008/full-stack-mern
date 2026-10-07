import express from "express";
import rateLimit from "express-rate-limit";

import {sendOtp,verifyOtp} from "../controller/AuthController.js";

const router = express.Router();

const limiter = (max) => rateLimit({
  windowMs: 15 * 60 * 1000,
  max,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many tries, try again later" },
});

router.post("/send-otp",limiter(5),sendOtp);
router.post("/verify-email-otp",limiter(10),verifyOtp);

export default router;