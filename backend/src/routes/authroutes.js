import { Router } from "express";
import {  isAdmin } from "../middleware/adminMiddleware.js";
import { registerUser, loginUser, GoogleLogin, changeMode, checkRole } from "../controllers/AuthController.js";
import { jwtAuth } from "../middleware/jwtAuth.js";

const router=Router();
//think about admin afterwards.because if we use same collection for storing both admins and users then hackers can sometime send role as admin and can register and do scams 
// router.post("/register",isAdmin,registerUser);
// router.post("/login",isAdmin,loginUser);
// router.post("/google_login",isAdmin,GoogleLogin);


router.post("/register",registerUser);
router.post("/login",loginUser);
router.post("/google_login",GoogleLogin);
router.get("/logout", jwtAuth, (req, res) => {
 
  res.status(200).clearCookie("token", {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
    }).json({ message:"user logged out"});
});
 
router.get("/check-auth", jwtAuth, (req, res) => {
 
  res.status(200).json({ isAuthenticated: true, user: req.user,currentRole:req.user.currentRole });
});
router.get("/changeMode", jwtAuth,changeMode)
router.get("/checkRole", jwtAuth, checkRole)

export default router;
  