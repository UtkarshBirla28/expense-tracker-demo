// Controller for per-category monthly budgets
import { Request, Response } from "express";
import prisma from "../config/db";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

// Returns every budget with how much was spent in that category this month
export const getBudgets = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    const budgets = await prisma.budget.findMany({
      where: { userId: userId! },
      orderBy: { category: "asc" },
    });

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const spentByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: {
        userId: userId!,
        createdAt: { gte: monthStart },
      },
      _sum: { amount: true },
    });

    const spentMap = new Map(
      spentByCategory.map((item) => [
        item.category.toLowerCase(),
        item._sum.amount || 0,
      ])
    );

    res.status(200).json({
      budgets: budgets.map((budget) => ({
        ...budget,
        spent: spentMap.get(budget.category.toLowerCase()) || 0,
      })),
    });
  } catch (error) {
    console.error("Get budgets error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching budgets" });
  }
};

// Creates a budget for a category, or updates the limit if one already exists
export const upsertBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { category, amount } = req.body;
  const userId = req.userId;

  try {
    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }
    if (!category || typeof category !== "string" || !category.trim()) {
      res.status(400).json({ message: "Valid category is required" });
      return;
    }

    const normalized = category.trim().toLowerCase();

    const budget = await prisma.budget.upsert({
      where: {
        userId_category: { userId: userId!, category: normalized },
      },
      create: { category: normalized, amount, userId: userId! },
      update: { amount },
    });

    res.status(201).json({ message: "Budget saved successfully", budget });
  } catch (error) {
    console.error("Upsert budget error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while saving budget" });
  }
};

export const deleteBudget = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const budget = await prisma.budget.findFirst({
      where: { id: Number(id), userId: userId! },
    });

    if (!budget) {
      res.status(404).json({ message: "Budget not found or unauthorized" });
      return;
    }

    await prisma.budget.delete({ where: { id: budget.id } });

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Delete budget error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting budget" });
  }
};
