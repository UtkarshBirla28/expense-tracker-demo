"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToPdf = exports.deleteIncome = exports.deleteExpense = exports.getIncomes = exports.getExpenses = exports.getFinancialSummary = exports.addIncome = exports.addExpense = void 0;
const db_1 = __importDefault(require("../config/db"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const PAGE_LIMIT = 2000; // Process data in chunks
const addExpense = async (req, res) => {
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
        const expense = await db_1.default.expense.create({
            data: {
                amount,
                category,
                description: description || "",
                userId: userId,
            },
        });
        res.status(201).json({
            message: "Expense created successfully",
            expense,
        });
    }
    catch (error) {
        console.error("Add expense error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while adding expense" });
    }
};
exports.addExpense = addExpense;
const addIncome = async (req, res) => {
    const { amount, source, description } = req.body;
    const userId = req.userId;
    try {
        if (!amount || typeof amount !== "number" || amount <= 0) {
            res.status(400).json({ message: "Valid amount is required" });
            return;
        }
        const income = await db_1.default.income.create({
            data: {
                amount,
                source,
                description: description || "",
                userId: userId,
            },
        });
        res.status(201).json({
            message: "Income created successfully",
            income,
        });
    }
    catch (error) {
        console.error("Add income error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while adding income" });
    }
};
exports.addIncome = addIncome;
const getFinancialSummary = async (req, res) => {
    const userId = req.userId;
    try {
        // Get total expenses
        const totalExpenses = await db_1.default.expense.aggregate({
            where: { userId: userId },
            _sum: { amount: true },
        });
        // Get total income
        const totalIncome = await db_1.default.income.aggregate({
            where: { userId: userId },
            _sum: { amount: true },
        });
        // Calculate current balance
        const currentBalance = (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);
        // Get expense categories summary
        const expensesByCategory = await db_1.default.expense.groupBy({
            by: ["category"],
            where: { userId: userId },
            _sum: { amount: true },
        });
        // Get income sources summary
        const incomeBySource = await db_1.default.income.groupBy({
            by: ["source"],
            where: { userId: userId },
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
    }
    catch (error) {
        console.error("Get summary error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching summary" });
    }
};
exports.getFinancialSummary = getFinancialSummary;
const getExpenses = async (req, res) => {
    const userId = req.userId;
    const { category } = req.query;
    try {
        const whereClause = Object.assign({ userId: userId }, (category ? { category: category } : {}));
        const expenses = await db_1.default.expense.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
        });
        const totalAmount = await db_1.default.expense.aggregate({
            where: whereClause,
            _sum: { amount: true },
        });
        res.status(200).json({
            expenses,
            totalAmount: totalAmount._sum.amount || 0,
        });
    }
    catch (error) {
        console.error("Get expenses error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching expenses" });
    }
};
exports.getExpenses = getExpenses;
const getIncomes = async (req, res) => {
    const userId = req.userId;
    try {
        const incomes = await db_1.default.income.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        res.status(200).json({
            incomes,
        });
    }
    catch (error) {
        console.error("Get incomes error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching incomes" });
    }
};
exports.getIncomes = getIncomes;
// Deletion endpoints
const deleteExpense = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const expense = await db_1.default.expense.findFirst({
            where: {
                id: Number(id),
                userId: userId,
            },
        });
        if (!expense) {
            res.status(404).json({ message: "Expense not found or unauthorized" });
            return;
        }
        await db_1.default.expense.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Expense deleted successfully" });
    }
    catch (error) {
        console.error("Delete expense error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while deleting expense" });
    }
};
exports.deleteExpense = deleteExpense;
const deleteIncome = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const income = await db_1.default.income.findFirst({
            where: {
                id: Number(id),
                userId: userId,
            },
        });
        if (!income) {
            res.status(404).json({ message: "Income not found or unauthorized" });
            return;
        }
        await db_1.default.income.delete({
            where: { id: Number(id) },
        });
        res.status(200).json({ message: "Income deleted successfully" });
    }
    catch (error) {
        console.error("Delete income error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while deleting income" });
    }
};
exports.deleteIncome = deleteIncome;
const exportToPdf = async (req, res) => {
    const userId = req.userId;
    try {
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=financial-report.pdf");
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        doc.pipe(res);
        // Header (Stays on the first page)
        doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .text("Financial Report", { align: "center" });
        doc.moveDown();
        // Financial Summary (Will be compact, no extra page break)
        const [totalIncome, totalExpenses] = await Promise.all([
            db_1.default.income.aggregate({ _sum: { amount: true }, where: { userId } }),
            db_1.default.expense.aggregate({ _sum: { amount: true }, where: { userId } }),
        ]);
        const balance = (totalIncome._sum.amount || 0) - (totalExpenses._sum.amount || 0);
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
        const addPaginatedData = async (title, model, formatItem) => {
            doc.fontSize(14).font("Helvetica-Bold").text(title).moveDown(0.5);
            let lastCreatedAt = null;
            let lastId = null;
            let indexCounter = 1;
            while (true) {
                const whereClause = { userId };
                if (lastCreatedAt && lastId) {
                    whereClause.OR = [
                        { createdAt: { lt: lastCreatedAt } },
                        {
                            AND: [{ createdAt: lastCreatedAt }, { id: { gt: lastId } }],
                        },
                    ];
                }
                const data = await db_1.default[model].findMany({
                    where: whereClause,
                    orderBy: [{ createdAt: "desc" }, { id: "asc" }],
                    take: PAGE_LIMIT,
                    select: Object.assign({ id: true, amount: true, createdAt: true }, (model === "income" ? { source: true } : { category: true })),
                });
                if (data.length === 0)
                    break;
                // Improved layout: Tabular formatting for clarity
                data.forEach((item) => {
                    if (doc.y > 700)
                        doc.addPage();
                    doc
                        .fontSize(10)
                        .font("Helvetica")
                        .text(formatItem(item, indexCounter));
                    indexCounter++;
                });
                const lastItem = data[data.length - 1];
                lastCreatedAt = lastItem.createdAt;
                lastId = lastItem.id;
                if (data.length < PAGE_LIMIT)
                    break;
            }
            doc.moveDown(1); // Extra spacing after each section
        };
        // Adding Income & Expense Data
        await addPaginatedData("Income Breakdown", "income", (income, index) => {
            var _a;
            return `${index}. $${income.amount.toFixed(2)} - ${(_a = income.source) === null || _a === void 0 ? void 0 : _a.toUpperCase()} (${new Date(income.createdAt).toLocaleDateString()})`;
        });
        await addPaginatedData("Expense Breakdown", "expense", (expense, index) => {
            var _a;
            return `${index}. $${expense.amount.toFixed(2)} - ${(_a = expense.category) === null || _a === void 0 ? void 0 : _a.toUpperCase()} (${new Date(expense.createdAt).toLocaleDateString()})`;
        });
        // Footer (Only at the bottom of the last page)
        doc
            .fontSize(8)
            .font("Helvetica")
            .text("This report was generated automatically by the Expense Tracker system.", 50, doc.page.height - 50, { align: "center" });
        doc.end();
    }
    catch (error) {
        console.error("PDF export error:", error);
        res.status(500).json({
            message: "Something went wrong while generating PDF",
            error: error instanceof Error ? error.message : "Unknown error",
        });
    }
};
exports.exportToPdf = exportToPdf;
