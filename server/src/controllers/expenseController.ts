// Main controller for handling expense tracking operations and financial data management
import { Request, Response } from "express";
import prisma from "../config/db";
import PDFDocument from "pdfkit";

// Define interfaces for request bodies and responses
interface AuthenticatedRequest extends Request {
  userId?: number;
}

const PAGE_LIMIT = 2000; // Process data in chunks

// Handles creation of new expenses with validation and user association

export const addExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { amount, category, description } = req.body;
  const userId = req.userId;

  try {
    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }
    if (!category || typeof category !== "string") {
      res.status(400).json({ message: "Valid category is required" });
      return;
    }

    const expense = await prisma.expense.create({
      data: {
        amount,
        category,
        description: description || "",
        userId: userId!,
      },
    });

    res.status(201).json({
      message: "Expense created successfully",
      expense,
    });
  } catch (error) {
    console.error("Add expense error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while adding expense" });
  }
};

// Manages income entries with amount validation and user-specific storage

export const addIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { amount, source, description } = req.body;
  const userId = req.userId;

  try {
    if (!amount || typeof amount !== "number" || amount <= 0) {
      res.status(400).json({ message: "Valid amount is required" });
      return;
    }

    const income = await prisma.income.create({
      data: {
        amount,
        source,
        description: description || "",
        userId: userId!,
      },
    });

    res.status(201).json({
      message: "Income created successfully",
      income,
    });
  } catch (error) {
    console.error("Add income error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while adding income" });
  }
};

// Retrieves financial data for dashboard, including expense categories and income sources

export const getFinancialSummary = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    // Get total expenses
    const totalExpenses = await prisma.expense.aggregate({
      where: { userId: userId! },
      _sum: { amount: true },
    });

    // Get total income
    const totalIncome = await prisma.income.aggregate({
      where: { userId: userId! },
      _sum: { amount: true },
    });

    // Calculate current balance
    const currentBalance =
      (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

    // Get expense categories summary
    const expensesByCategory = await prisma.expense.groupBy({
      by: ["category"],
      where: { userId: userId! },
      _sum: { amount: true },
    });

    // Get income sources summary
    const incomeBySource = await prisma.income.groupBy({  
      by: ["source"],
      where: { userId: userId! },
      _sum: { amount: true },
    });

    const formattedExpenses = expensesByCategory.map((item) => ({
      name: item.category,
      value: item._sum.amount || 0, // Ensure value is not undefined
    }));

    const formattedIncome = incomeBySource.map((item) => ({
      name: item.source,
      value: item._sum.amount || 0, // Ensures value is not undefined
    }));

    res.status(200).json({
      summary: {
        currentBalance,
        totalIncome: totalIncome._sum.amount || 0,
        totalExpenses: totalExpenses._sum.amount || 0,
      },
      expensesByCategory: formattedExpenses,
      incomeBySource: formattedIncome,
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching summary" });
  }
};

// Fetches paginated expense records with filtering capabilities

export const getExpenses = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;
  const { category } = req.query;

  try {
    const whereClause = {
      userId: userId!,
      ...(category ? { category: category as string } : {}),
    };

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
    });

    const totalAmount = await prisma.expense.aggregate({
      where: whereClause,
      _sum: { amount: true },
    });

    res.status(200).json({
      expenses,
      totalAmount: totalAmount._sum.amount || 0,
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching expenses" });
  }
};

// Fetches income records for the authenticated user

export const getIncomes = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    const incomes = await prisma.income.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      incomes,
    });
  } catch (error) {
    console.error("Get incomes error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching incomes" });
  }
};

// Handles secure deletion of expense records with user verification

export const deleteExpense = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const expense = await prisma.expense.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!expense) {
      res.status(404).json({ message: "Expense not found or unauthorized" });
      return;
    }

    await prisma.expense.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting expense" });
  }
};

// Handles secure deletion of income records with user verification

export const deleteIncome = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const { id } = req.params;
  const userId = req.userId;

  try {
    const income = await prisma.income.findFirst({
      where: {
        id: Number(id),
        userId: userId!,
      },
    });

    if (!income) {
      res.status(404).json({ message: "Income not found or unauthorized" });
      return;
    }

    await prisma.income.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({ message: "Income deleted successfully" });
  } catch (error) {
    console.error("Delete income error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong while deleting income" });
  }
};
