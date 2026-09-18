import { Router } from "express";
import {
  deleteBudget,
  getBudgets,
  upsertBudget,
} from "../controllers/budgetController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, upsertBudget);
router.delete("/:id", authMiddleware, deleteBudget);

export default router;
