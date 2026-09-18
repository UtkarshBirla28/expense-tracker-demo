"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBudget = exports.upsertBudget = exports.getBudgets = void 0;
const db_1 = __importDefault(require("../config/db"));
// Returns every budget with how much was spent in that category this month
const getBudgets = async (req, res) => {
    const userId = req.userId;
    try {
        const budgets = await db_1.default.budget.findMany({
            where: { userId: userId },
            orderBy: { category: "asc" },
        });
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const spentByCategory = await db_1.default.expense.groupBy({
            by: ["category"],
            where: {
                userId: userId,
                createdAt: { gte: monthStart },
            },
            _sum: { amount: true },
        });
        const spentMap = new Map(spentByCategory.map((item) => [
            item.category.toLowerCase(),
            item._sum.amount || 0,
        ]));
        res.status(200).json({
            budgets: budgets.map((budget) => (Object.assign(Object.assign({}, budget), { spent: spentMap.get(budget.category.toLowerCase()) || 0 }))),
        });
    }
    catch (error) {
        console.error("Get budgets error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while fetching budgets" });
    }
};
exports.getBudgets = getBudgets;
// Creates a budget for a category, or updates the limit if one already exists
const upsertBudget = async (req, res) => {
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
        const budget = await db_1.default.budget.upsert({
            where: {
                userId_category: { userId: userId, category: normalized },
            },
            create: { category: normalized, amount, userId: userId },
            update: { amount },
        });
        res.status(201).json({ message: "Budget saved successfully", budget });
    }
    catch (error) {
        console.error("Upsert budget error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while saving budget" });
    }
};
exports.upsertBudget = upsertBudget;
const deleteBudget = async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    try {
        const budget = await db_1.default.budget.findFirst({
            where: { id: Number(id), userId: userId },
        });
        if (!budget) {
            res.status(404).json({ message: "Budget not found or unauthorized" });
            return;
        }
        await db_1.default.budget.delete({ where: { id: budget.id } });
        res.status(200).json({ message: "Budget deleted successfully" });
    }
    catch (error) {
        console.error("Delete budget error:", error);
        res
            .status(500)
            .json({ message: "Something went wrong while deleting budget" });
    }
};
exports.deleteBudget = deleteBudget;
