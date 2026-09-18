"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateIncome = exports.updateExpense = exports.getMonthlyTrends = exports.deleteIncome = exports.deleteExpense = exports.getIncomes = exports.getExpenses = exports.getFinancialSummary = exports.addIncome = exports.addExpense = void 0;
const db_1 = __importDefault(require("../config/db"));
// Process data in chunks
// Handles creation of new expenses with validation and user association
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
// Manages income entries with amount validation and user-specific storage
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
// Retrieves financial data for dashboard, including expense categories and income sources
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
    }
    catch (error) {
        console.error("Get summary error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching summary" });
    }
};
exports.getFinancialSummary = getFinancialSummary;
// Fetches paginated expense records with filtering capabilities
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
// Fetches income records for the authenticated user
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
// Handles secure deletion of expense records with user verification
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
// Handles secure deletion of income records with user verification
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
// Returns income vs expense totals for each of the last 6 months
const getMonthlyTrends = async (req, res) => {
    const userId = req.userId;
    try {
        const now = new Date();
        const windowStart = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        const [expenses, incomes] = await Promise.all([
            db_1.default.expense.findMany({
                where: { userId: userId, createdAt: { gte: windowStart } },
                select: { amount: true, createdAt: true },
            }),
            db_1.default.income.findMany({
                where: { userId: userId, createdAt: { gte: windowStart } },
                select: { amount: true, createdAt: true },
            }),
        ]);
        const monthKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            months.push({ month: monthKey(date), income: 0, expense: 0 });
        }
        const byMonth = new Map(months.map((entry) => [entry.month, entry]));
        for (const expense of expenses) {
            const entry = byMonth.get(monthKey(expense.createdAt));
            if (entry)
                entry.expense += expense.amount;
        }
        for (const income of incomes) {
            const entry = byMonth.get(monthKey(income.createdAt));
            if (entry)
                entry.income += income.amount;
        }
        res.status(200).json({ trends: months });
    }
    catch (error) {
        console.error("Get trends error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching trends" });
    }
};
exports.getMonthlyTrends = getMonthlyTrends;
// Updates an existing expense owned by the requesting user
const updateExpense = async (req, res) => {
    const { id } = req.params;
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
        const existing = await db_1.default.expense.findFirst({
            where: { id: Number(id), userId: userId },
        });
        if (!existing) {
            res.status(404).json({ message: "Expense not found or unauthorized" });
            return;
        }
        const expense = await db_1.default.expense.update({
            where: { id: existing.id },
            data: { amount, category, description: description || "" },
        });
        res.status(200).json({ message: "Expense updated successfully", expense });
    }
    catch (error) {
        console.error("Update expense error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while updating expense" });
    }
};
exports.updateExpense = updateExpense;
// Updates an existing income owned by the requesting user
const updateIncome = async (req, res) => {
    const { id } = req.params;
    const { amount, source, description } = req.body;
    const userId = req.userId;
    try {
        if (!amount || typeof amount !== "number" || amount <= 0) {
            res.status(400).json({ message: "Valid amount is required" });
            return;
        }
        if (!source || typeof source !== "string") {
            res.status(400).json({ message: "Valid source is required" });
            return;
        }
        const existing = await db_1.default.income.findFirst({
            where: { id: Number(id), userId: userId },
        });
        if (!existing) {
            res.status(404).json({ message: "Income not found or unauthorized" });
            return;
        }
        const income = await db_1.default.income.update({
            where: { id: existing.id },
            data: { amount, source, description: description || "" },
        });
        res.status(200).json({ message: "Income updated successfully", income });
    }
    catch (error) {
        console.error("Update income error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while updating income" });
    }
};
exports.updateIncome = updateIncome;
