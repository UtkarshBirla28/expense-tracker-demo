import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { exportToPdf } from "../controllers/pdfController";

export const router = Router();

router.get("/export", authMiddleware, exportToPdf);

export default router;

