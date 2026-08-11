import { Router } from "express";
import { fetchPickupRequests, pickup, assignReceiver, fetchActiveTask, fetchActiveReq } from "../controllers/pickupController.js";

import { jwtAuth } from "../middleware/jwtAuth.js";

const router = Router();

router.get("/fetchRequests", jwtAuth, fetchPickupRequests);
router.get("/activeTask", jwtAuth, fetchActiveTask);
router.get("/activeReq", jwtAuth, fetchActiveReq);
router.post("/newRequest", jwtAuth, pickup);
router.post("/accepted", jwtAuth, assignReceiver);

export default router;