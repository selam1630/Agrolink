import { Router } from "express";
import { getWeatherAndCropAdvice } from "../controllers/weatherPrediction.controller";

const router = Router();
router.post("/advice", getWeatherAndCropAdvice);

export default router;
