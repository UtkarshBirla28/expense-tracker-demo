// Controller for savings goals
import { Request, Response } from "express";
import prisma from "../config/db";

interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const getGoals = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    const goals = await prisma.goal.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({ goals });
  } catch (error) {
    console.error("Get goals error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching goals" });
  }
};

export const addGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { name, targetAmount } = req.body;
  const userId = req.userId;

  try {
    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ message: "Valid name is required" });
      return;
    }
    if (
      !targetAmount ||
      typeof targetAmount !== "number" ||
      targetAmount <= 0
    ) {
      res.status(400).json({ message: "Valid target amount is required" });
      return;
    }

    const goal = await prisma.goal.create({
      data: { name: name.trim(), targetAmount, userId: userId! },
    });

    res.status(201).json({ message: "Goal created successfully", goal });
  } catch (error) {
    console.error("Add goal error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while creating goal" });
  }
};

// Adds money toward a goal (capped so savedAmount never exceeds the target)
export const contributeToGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const { amount } = req.body;
  const userId = req.userId;

  try {
    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }

    const goal = await prisma.goal.findFirst({
      where: { id: Number(id), userId: userId! },
    });

    if (!goal) {
      res.status(404).json({ message: "Goal not found or unauthorized" });
      return;
    }

    const savedAmount = Math.min(
      goal.savedAmount + amount,
      goal.targetAmount
    );

    const updated = await prisma.goal.update({
      where: { id: goal.id },
      data: { savedAmount },
    });

    res
      .status(200)
      .json({ message: "Contribution added successfully", goal: updated });
  } catch (error) {
    console.error("Contribute to goal error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while adding contribution" });
  }
};

export const deleteGoal = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const goal = await prisma.goal.findFirst({
      where: { id: Number(id), userId: userId! },
    });

    if (!goal) {
      res.status(404).json({ message: "Goal not found or unauthorized" });
      return;
    }

    await prisma.goal.delete({ where: { id: goal.id } });

    res.status(200).json({ message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Delete goal error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting goal" });
  }
};
