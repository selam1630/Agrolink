import express from "express";
import { authenticateToken, protect } from "../middlewares/auth.middleware";
import {
  createSoilReading,
  getAllSoilReadings,
  getMySoilReadings,
} from "../controllers/soilController";

const router = express.Router();
router.post(
  "/create",
  authenticateToken,
  protect(["admin", "farmer"]), 
  createSoilReading
);
router.get(
  "/all",
  authenticateToken,
  protect(["admin"]),
  getAllSoilReadings
);
router.get(
  "/my",
  authenticateToken,
  protect(["farmer"]),
  getMySoilReadings
);

export default router;
