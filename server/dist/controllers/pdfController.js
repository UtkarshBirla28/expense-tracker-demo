"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportToPdf = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const pdf_lib_1 = require("pdf-lib");
const pdfkit_1 = __importDefault(require("pdfkit"));
const worker_threads_1 = require("worker_threads");
const db_1 = __importDefault(require("../config/db"));
const PAGE_LIMIT = 2000; // Batch size
const tempDir = path_1.default.join(__dirname, "../../temp");
if (!fs_1.default.existsSync(tempDir)) {
    fs_1.default.mkdirSync(tempDir, { recursive: true });
}
/**
 * Generate a header PDF with the report title and financial summary.
 */
const generateHeaderPdf = async (summaryData) => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        const headerPath = path_1.default.join(tempDir, "header.pdf");
        const writeStream = fs_1.default.createWriteStream(headerPath);
        doc.pipe(writeStream);
        // Header Title
        doc.fontSize(24)
            .font("Helvetica-Bold")
            .text("Financial Report", { align: "center" });
        doc.moveDown();
        // Summary
        doc.fontSize(16)
            .font("Helvetica-Bold")
            .text("Financial Summary", { align: "left" });
        doc.moveDown(0.5);
        doc.fontSize(12)
            .font("Helvetica")
            .text(`Total Income: $${summaryData.totalIncome.toFixed(2)}`)
            .text(`Total Expenses: $${summaryData.totalExpenses.toFixed(2)}`)
            .text(`Current Balance: $${summaryData.balance.toFixed(2)}`);
        doc.moveDown(1);
        doc.end();
        writeStream.on("finish", () => resolve(headerPath));
        writeStream.on("error", reject);
    });
};
/**
 * Generate a footer PDF.
 */
const generateFooterPdf = async () => {
    return new Promise((resolve, reject) => {
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        const footerPath = path_1.default.join(tempDir, "footer.pdf");
        const writeStream = fs_1.default.createWriteStream(footerPath);
        doc.pipe(writeStream);
        doc.fontSize(8)
            .font("Helvetica")
            .text("This report was generated automatically by the Expense Tracker system.", { align: "center" });
        doc.end();
        writeStream.on("finish", () => resolve(footerPath));
        writeStream.on("error", reject);
    });
};
/**
 * Spawn a worker to generate a PDF chunk for a given model (income or expense) with a given offset and limit.
 */
const spawnWorker = (userId, model, offset, limit) => {
    return new Promise((resolve, reject) => {
        const workerPath = path_1.default.join(__dirname, "../workers/pdf-worker.js");
        const worker = new worker_threads_1.Worker(workerPath, {
            workerData: { userId, model, offset, limit },
        });
        worker.on("message", (result) => {
            // result is an object { offset, filePath }
            resolve(result);
        });
        worker.on("error", reject);
    });
};
/**
 * The main exportToPdf controller.
 */
const exportToPdf = async (req, res) => {
    const userId = req.userId;
    try {
        // (1) Get summary info (using aggregates)
        const [totalIncomeAgg, totalExpensesAgg] = await Promise.all([
            db_1.default.income.aggregate({ _sum: { amount: true }, where: { userId } }),
            db_1.default.expense.aggregate({ _sum: { amount: true }, where: { userId } }),
        ]);
        const totalIncome = totalIncomeAgg._sum.amount || 0;
        const totalExpenses = totalExpensesAgg._sum.amount || 0;
        const balance = totalIncome - totalExpenses;
        const summaryData = { totalIncome, totalExpenses, balance };
        // (2) Generate header and footer PDFs
        const [headerPath, footerPath] = await Promise.all([
            generateHeaderPdf(summaryData),
            generateFooterPdf(),
        ]);
        // (3) Count the number of income and expense records so we know how many batches we need.
        const [incomeCount, expenseCount] = await Promise.all([
            db_1.default.income.count({ where: { userId } }),
            db_1.default.expense.count({ where: { userId } }),
        ]);
        const incomeBatches = Math.ceil(incomeCount / PAGE_LIMIT);
        const expenseBatches = Math.ceil(expenseCount / PAGE_LIMIT);
        // (4) Spawn workers for each batch (for income and expense)
        const incomePromises = [];
        for (let i = 0; i < incomeBatches; i++) {
            const offset = i * PAGE_LIMIT;
            incomePromises.push(spawnWorker(userId, "income", offset, PAGE_LIMIT));
        }
        const expensePromises = [];
        for (let i = 0; i < expenseBatches; i++) {
            const offset = i * PAGE_LIMIT;
            expensePromises.push(spawnWorker(userId, "expense", offset, PAGE_LIMIT));
        }
        const incomeResults = await Promise.all(incomePromises);
        const expenseResults = await Promise.all(expensePromises);
        // (5) Sort results by offset (to preserve ordering)
        incomeResults.sort((a, b) => a.offset - b.offset);
        expenseResults.sort((a, b) => a.offset - b.offset);
        const incomePaths = incomeResults.map((r) => r.filePath);
        const expensePaths = expenseResults.map((r) => r.filePath);
        // (6) Merge all PDFs using pdf-lib
        const finalPdf = await pdf_lib_1.PDFDocument.create();
        // Merge order: header, all income chunks, all expense chunks, footer.
        const mergeOrder = [headerPath, ...incomePaths, ...expensePaths, footerPath];
        for (const filePath of mergeOrder) {
            const fileBytes = fs_1.default.readFileSync(filePath);
            const pdf = await pdf_lib_1.PDFDocument.load(fileBytes);
            const copiedPages = await finalPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => finalPdf.addPage(page));
        }
        const finalPdfBytes = await finalPdf.save();
        // (7) Set response headers and send the final PDF
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=financial-report.pdf");
        res.send(Buffer.from(finalPdfBytes));
        // (8) Cleanup temporary files (optional)
        mergeOrder.forEach((filePath) => {
            if (fs_1.default.existsSync(filePath))
                fs_1.default.unlinkSync(filePath);
        });
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
