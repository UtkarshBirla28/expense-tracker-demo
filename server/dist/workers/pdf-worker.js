"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// workers/pdfWorker.js
const worker_threads_1 = require("worker_threads");
const pdfkit_1 = __importDefault(require("pdfkit"));
const db_1 = __importDefault(require("../config/db"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const { userId, model, offset, limit } = worker_threads_1.workerData;
(async () => {
    try {
        // Query the transactions for this batch
        const transactions = await db_1.default[model].findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip: offset,
            take: limit,
            select: model === "income"
                ? { id: true, amount: true, createdAt: true, source: true }
                : { id: true, amount: true, createdAt: true, category: true },
        });
        // Create a PDF chunk for this batch
        const doc = new pdfkit_1.default({ margin: 50, size: "A4" });
        const tempDir = path_1.default.join(__dirname, "../temp");
        if (!fs_1.default.existsSync(tempDir)) {
            fs_1.default.mkdirSync(tempDir, { recursive: true });
        }
        const filePath = path_1.default.join(tempDir, `${model}_${offset}.pdf`);
        const writeStream = fs_1.default.createWriteStream(filePath);
        doc.pipe(writeStream);
        // Write a small header for this chunk
        doc.fontSize(14)
            .font("Helvetica-Bold")
            .text(`${model.toUpperCase()} Details (Batch starting at ${offset})`, { align: "center" });
        doc.moveDown();
        // List each transaction with simple formatting
        transactions.forEach((txn, index) => {
            let line;
            if (model === "income") {
                line = `${offset + index + 1}. $${txn.amount.toFixed(2)} - ${txn.source.toUpperCase()} (${new Date(txn.createdAt).toLocaleDateString()})`;
            }
            else {
                line = `${offset + index + 1}. $${txn.amount.toFixed(2)} - ${txn.category.toUpperCase()} (${new Date(txn.createdAt).toLocaleDateString()})`;
            }
            doc.fontSize(10).font("Helvetica").text(line);
            if (doc.y > 700) {
                doc.addPage();
            }
        });
        doc.end();
        writeStream.on("finish", () => {
            if (!worker_threads_1.parentPort) {
                throw new Error("This script must be run as a worker thread");
            }
            worker_threads_1.parentPort.postMessage({ offset, filePath });
        });
        writeStream.on("error", (err) => {
            throw err;
        });
    }
    catch (error) {
        if (!worker_threads_1.parentPort) {
            throw new Error("This script must be run as a worker thread");
        }
        worker_threads_1.parentPort.postMessage({ error: error.message });
    }
})();
