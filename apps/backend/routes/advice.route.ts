import express from "express";

const router = express.Router();

import { getAgriculturalAdvice } from "../controllers/advise.controller";

router.post("/advice", getAgriculturalAdvice);

export default router;
