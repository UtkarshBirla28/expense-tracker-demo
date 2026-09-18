import { Router } from "express";
import {
  addExpense,
  addIncome,
  deleteExpense,
  deleteIncome,
  getExpenses,
  getFinancialSummary,
  getIncomes,
  getMonthlyTrends,
  updateExpense,
  updateIncome,
} from "../controllers/expenseController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/income", authMiddleware, getIncomes);
router.post("/income/add", authMiddleware, addIncome);
router.post("/expense/add", authMiddleware, addExpense);
router.get("/expense", authMiddleware, getExpenses);
router.get("/summary", authMiddleware, getFinancialSummary);
router.get("/trends", authMiddleware, getMonthlyTrends);
router.put("/expense/:id", authMiddleware, updateExpense);
router.put("/income/:id", authMiddleware, updateIncome);
router.delete("/deleteExpense/:id", authMiddleware, deleteExpense);
router.delete("/deleteIncome/:id", authMiddleware, deleteIncome);


export default router;
