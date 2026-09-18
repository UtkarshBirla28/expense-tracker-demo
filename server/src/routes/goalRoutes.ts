import { Router } from "express";
import {
  addGoal,
  contributeToGoal,
  deleteGoal,
  getGoals,
} from "../controllers/goalController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/", authMiddleware, getGoals);
router.post("/", authMiddleware, addGoal);
router.patch("/:id/contribute", authMiddleware, contributeToGoal);
router.delete("/:id", authMiddleware, deleteGoal);

export default router;
