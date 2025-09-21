import { Router } from "express";
import { getWeatherAndCropAdvice, getWeatherAndCropAdviceForDashboard } from "../controllers/weatherPrediction.controller";

const router = Router();
router.post("/advice", getWeatherAndCropAdvice);
router.post("/advice-for-dashboard", getWeatherAndCropAdviceForDashboard);

export default router;
