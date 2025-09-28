import express from "express";
import { addFarmerToRegistry, listFarmers } from "../controllers/adminController";
import { authenticateToken, protect } from "../middlewares/auth.middleware";

const router = express.Router();
router.post("/farmers", authenticateToken, protect(["admin"]), addFarmerToRegistry);
router.get("/farmers", authenticateToken, protect(["admin"]), listFarmers);

export default router;
