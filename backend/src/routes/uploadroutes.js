import { Router } from "express";
import { generateUploadToken } from "../controllers/uploadController.js";
import { jwtAuth } from "../middleware/jwtAuth.js";
 

const router=Router();

router.get("/",jwtAuth,generateUploadToken );
 
export default router;  