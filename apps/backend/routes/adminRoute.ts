import express from "express";
import { addFarmerToRegistry, listFarmers,getAdminMetrics } from "../controllers/adminController";
import { authenticateToken, protect } from "../middlewares/auth.middleware";

const router = express.Router();
router.post("/farmers", authenticateToken, protect(["admin"]), addFarmerToRegistry);
router.get("/farmers", authenticateToken, protect(["admin"]), listFarmers);
router.get("/metrics", authenticateToken, protect(["admin"]), getAdminMetrics);
export default router;
