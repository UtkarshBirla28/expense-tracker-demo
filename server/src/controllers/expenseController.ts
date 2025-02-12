import { Request, Response } from "express";
import prisma from "../config/db";
import PDFDocument from "pdfkit";

// Define interfaces for request bodies and responses
interface AuthenticatedRequest extends Request {
  userId?: number;
}


const PAGE_LIMIT = 2000; // Process data in chunks

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
      value: item._sum.amount || 0, // Ensure value is not undefined
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

// Deletion endpoints
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

export const exportToPdf = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.userId;

  try {
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=financial-report.pdf"
    );

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    doc.pipe(res);

    // Header (Stays on the first page)
    doc
      .fontSize(24)
      .font("Helvetica-Bold")
      .text("Financial Report", { align: "center" });
    doc.moveDown();

    // Financial Summary (Will be compact, no extra page break)
    const [totalIncome, totalExpenses] = await Promise.all([
      prisma.income.aggregate({ _sum: { amount: true }, where: { userId } }),
      prisma.expense.aggregate({ _sum: { amount: true }, where: { userId } }),
    ]);

    const balance =
      (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);

    doc
      .fontSize(16)
      .font("Helvetica-Bold")
      .text("Financial Summary")
      .moveDown(0.5);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Total Income: $${(totalIncome._sum.amount || 0).toFixed(2)}`)
      .text(`Total Expenses: $${(totalExpenses._sum.amount || 0).toFixed(2)}`)
      .text(`Current Balance: $${balance.toFixed(2)}`);
    doc.moveDown(1.5); // Gives spacing before income/expense details

    // Optimized function for Income/Expense
    const addPaginatedData = async (
      title: string,
      model: "income" | "expense",
      formatItem: (item: any, index: number) => string
    ) => {
      doc.fontSize(14).font("Helvetica-Bold").text(title).moveDown(0.5);

      let lastCreatedAt: Date | null = null;
      let lastId: number | null = null;
      let indexCounter = 1;

      while (true) {
        const whereClause: any = { userId };
        if (lastCreatedAt && lastId) {
          whereClause.OR = [
            { createdAt: { lt: lastCreatedAt } },
            {
              AND: [{ createdAt: lastCreatedAt }, { id: { gt: lastId } }],
            },
          ];
        }

        const data = await (prisma as any)[model].findMany({
          where: whereClause,
          orderBy: [{ createdAt: "desc" }, { id: "asc" }],
          take: PAGE_LIMIT,
          select: {
            id: true,
            amount: true,
            createdAt: true,
            ...(model === "income" ? { source: true } : { category: true }),
          },
        });

        if (data.length === 0) break;

        // Improved layout: Tabular formatting for clarity
        data.forEach((item: any) => {
          if (doc.y > 700) doc.addPage();
          doc
            .fontSize(10)
            .font("Helvetica")
            .text(formatItem(item, indexCounter));
          indexCounter++;
        });

        const lastItem = data[data.length - 1];
        lastCreatedAt = lastItem.createdAt;
        lastId = lastItem.id;

        if (data.length < PAGE_LIMIT) break;
      }

      doc.moveDown(1); // Extra spacing after each section
    };

    // Adding Income & Expense Data
    await addPaginatedData(
      "Income Breakdown",
      "income",
      (income, index) =>
        `${index}. $${income.amount.toFixed(
          2
        )} - ${income.source?.toUpperCase()} (${new Date(
          income.createdAt
        ).toLocaleDateString()})`
    );

    await addPaginatedData(
      "Expense Breakdown",
      "expense",
      (expense, index) =>
        `${index}. $${expense.amount.toFixed(
          2
        )} - ${expense.category?.toUpperCase()} (${new Date(
          expense.createdAt
        ).toLocaleDateString()})`
    );

    // Footer (Only at the bottom of the last page)
    doc
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This report was generated automatically by the Expense Tracker system.",
        50,
        doc.page.height - 50,
        { align: "center" }
      );

    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({
      message: "Something went wrong while generating PDF",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
