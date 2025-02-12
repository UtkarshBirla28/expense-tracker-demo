"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const expenseRoutes_1 = __importDefault(require("./routes/expenseRoutes"));
const pdfRoutes_1 = __importDefault(require("./routes/pdfRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use("/api/auth", authRoutes_1.default);
app.use("/api/transactions", expenseRoutes_1.default);
app.use("/api/pdf", pdfRoutes_1.default);
// Error handling middleware
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});
// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
