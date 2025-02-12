// workers/pdfWorker.js
import { parentPort, workerData } from "worker_threads";
import PDFDocument from "pdfkit";
import prisma from "../config/db";
import fs from "fs";
import path from "path";

const { userId, model, offset, limit } = workerData;

(async () => {
  try {
    // Query the transactions for this batch
    const transactions = await prisma[model].findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip: offset,
      take: limit,
      select:
        model === "income"
          ? { id: true, amount: true, createdAt: true, source: true }
          : { id: true, amount: true, createdAt: true, category: true },
    });

    // Create a PDF chunk for this batch
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    const filePath = path.join(tempDir, `${model}_${offset}.pdf`);
    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // Write a small header for this chunk
    doc.fontSize(14)
      .font("Helvetica-Bold")
      .text(
        `${model.toUpperCase()} Details (Batch starting at ${offset})`,
        { align: "center" }
      );
    doc.moveDown();

    // List each transaction with simple formatting
    transactions.forEach((txn, index) => {
      let line;
      if (model === "income") {
        line = `${offset + index + 1}. $${txn.amount.toFixed(
          2
        )} - ${txn.source.toUpperCase()} (${new Date(
          txn.createdAt
        ).toLocaleDateString()})`;
      } else {
        line = `${offset + index + 1}. $${txn.amount.toFixed(
          2
        )} - ${txn.category.toUpperCase()} (${new Date(
          txn.createdAt
        ).toLocaleDateString()})`;
      }
      doc.fontSize(10).font("Helvetica").text(line);
      if (doc.y > 700) {
        doc.addPage();
      }
    });

    doc.end();

    writeStream.on("finish", () => {
      if (!parentPort) {
        throw new Error("This script must be run as a worker thread");
      }
      parentPort.postMessage({ offset, filePath });
    });
    writeStream.on("error", (err) => {
      throw err;
    });
  } catch (error) {
    if (!parentPort) {
      throw new Error("This script must be run as a worker thread");
    }
    parentPort.postMessage({ error: error.message });
  }
})();
