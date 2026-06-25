import { Router } from "express";
import {  isAdmin } from "../middleware/adminMiddleware.js";
import { registerUser, loginUser, GoogleLogin } from "../controllers/AuthController.js";

const router=Router();

router.post("/register",isAdmin,registerUser);
router.post("/login",isAdmin,loginUser);
router.post("/google_login",isAdmin,GoogleLogin);

export default router;  