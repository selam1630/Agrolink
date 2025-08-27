import { Router } from "express";
import { getFarmerProfile, updateFarmerProfile } from "../controllers/profileController";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/:id", authenticateToken, getFarmerProfile);
router.put("/:id", authenticateToken, updateFarmerProfile);

export default router;
