import { Router, RequestHandler } from "express";
import multer from "multer";
import { storageArolink } from "../config/cloudinary";
import { diseaseDetection } from "../controllers/diseaseDetection.controller";

const router = Router();

const upload = multer({
  storage: storageArolink,
  limits: { fileSize: 5 * 1024 * 1024 },
});
const uploadMiddleware = upload.single("image") as RequestHandler;

router.post("/", uploadMiddleware, diseaseDetection);

export default router;
