import { Router } from "express";
import {  isAdmin } from "../middleware/adminMiddleware.js";
import { registerUser, loginUser, GoogleLogin } from "../controllers/AuthController.js";
import { jwtAuth } from "../middleware/jwtAuth.js";

const router=Router();

router.post("/register",isAdmin,registerUser);
router.post("/login",isAdmin,loginUser);
router.post("/google_login",isAdmin,GoogleLogin);
router.get("/logout", jwtAuth, (req, res) => {
 
  res.status(200).clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    }).json({ message:"user logged out"});
});
 
router.get("/check-auth", jwtAuth, (req, res) => {
 
  res.status(200).json({ isAuthenticated: true, user: req.user });
});

export default router;  