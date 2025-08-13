import express from "express";
import { getWeatherAndCropAdvice } from "../controllers/weatherPrediction.controller";

const router = express.Router();

router.post("/", getWeatherAndCropAdvice);

export default router;
