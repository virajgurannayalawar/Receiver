import { Router } from "express";
import { pickup } from "../controllers/orderController.js";
import { jwtAuth } from "../middleware/jwtAuth.js";

const router=Router();


router.post("/pickup",jwtAuth,pickup)

export default router;