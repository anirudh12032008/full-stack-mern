import express from "express";
import { requireRole } from "../middleware/auth.js";

import {createUser,getAllUsers,deleteUser,} from "../controller/UserController.js";

const router = express.Router();

router.use(requireRole("admin"));

router.post("/create-user",createUser);

router.get("/all-users",getAllUsers);

router.delete("/delete-user/:id",deleteUser);

export default router;
