import PDFDocument from "pdfkit";
import prisma from "../config/db";

/*
 * Single-pass, table-based financial report.
 * (Replaces the old worker/merge pipeline that emitted a plain numbered
 * text list — kept simple since a personal tracker has tens, not
 * thousands, of rows.)
 *
 * PDFKit's built-in Helvetica has no rupee glyph, so amounts use "Rs.".
 */

// ── Palette (matches the web app) ──────────────────────────
const BRAND = "#2a78d6";
const INK = "#0b0b0b";
const MUTED = "#6f6e69";
const INCOME = "#157a55";
const EXPENSE = "#c0392b";
const ROW_ALT = "#f4f6f9";
const BORDER = "#e1e0d9";
const CARD_BG = "#fbfcfe";

const MARGIN = 42;
const PAGE_WIDTH = 595.28; // A4
const PAGE_HEIGHT = 841.89;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

const rupees = (n: number) => `Rs. ${Math.round(n).toLocaleString("en-IN")}`;
const shortDate = (d: Date) =>
  new Date(d).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

interface Row {
  date: Date;
  tag: string;
  description: string;
  amount: number;
}

export const exportToPdf = async (req: any, res: any) => {
  const userId = req.userId;
  try {
    const [incomes, expenses] = await Promise.all([
      prisma.income.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { amount: true, createdAt: true, source: true, description: true },
      }),
      prisma.expense.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        select: { amount: true, createdAt: true, category: true, description: true },
      }),
    ]);

    const totalIncome = incomes.reduce((s, r) => s + r.amount, 0);
    const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
    const balance = totalIncome - totalExpenses;

    const incomeRows: Row[] = incomes.map((r) => ({
      date: r.createdAt,
      tag: r.source,
      description: r.description || "—",
      amount: r.amount,
    }));
    const expenseRows: Row[] = expenses.map((r) => ({
      date: r.createdAt,
      tag: r.category,
      description: r.description || "—",
      amount: r.amount,
    }));

    const doc = new PDFDocument({
      // bottom: 0 so footer text near the page edge never triggers
      // PDFKit's automatic page-add (which was inserting blank pages).
      margins: { top: MARGIN, bottom: 0, left: MARGIN, right: MARGIN },
      size: "A4",
      bufferPages: true,
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c: Buffer) => chunks.push(c));
    doc.on("end", () => {
      const pdf = Buffer.concat(chunks);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=financial-report.pdf"
      );
      res.send(pdf);
    });

    drawBrandHeader(doc);
    drawSummary(doc, totalIncome, totalExpenses, balance);
    drawTable(doc, "Expenses", expenseRows, EXPENSE, totalExpenses);
    drawTable(doc, "Income", incomeRows, INCOME, totalIncome);
    drawPageFooters(doc);

    doc.end();
  } catch (error) {
    console.error("PDF export error:", error);
    res.status(500).json({
      message: "Something went wrong while generating PDF",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// ── Sections ───────────────────────────────────────────────

function drawBrandHeader(doc: any) {
  // Brand bar
  doc.rect(0, 0, PAGE_WIDTH, 74).fill(BRAND);

  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(20)
    .text("Expense Tracker", MARGIN, 22);

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor("#dbe8fb")
    .text("Financial Report", MARGIN, 47);

  const generated = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  doc
    .fontSize(9)
    .fillColor("#dbe8fb")
    .text(`Generated ${generated}`, MARGIN, 34, {
      width: CONTENT_WIDTH,
      align: "right",
    });

  doc.y = 100;
  doc.x = MARGIN;
}

function drawSummary(
  doc: any,
  income: number,
  expenses: number,
  balance: number
) {
  const gap = 12;
  const cardW = (CONTENT_WIDTH - gap * 2) / 3;
  const cardH = 66;
  const top = doc.y;

  const cards = [
    { label: "TOTAL INCOME", value: rupees(income), color: INCOME },
    { label: "TOTAL EXPENSES", value: rupees(expenses), color: EXPENSE },
    {
      label: "BALANCE",
      value: rupees(balance),
      color: balance < 0 ? EXPENSE : BRAND,
    },
  ];

  cards.forEach((card, i) => {
    const x = MARGIN + i * (cardW + gap);
    doc
      .roundedRect(x, top, cardW, cardH, 8)
      .fillAndStroke(CARD_BG, BORDER);
    // colored accent stripe
    doc.rect(x, top + 10, 3, cardH - 20).fill(card.color);
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(MUTED)
      .text(card.label, x + 14, top + 15, { width: cardW - 20 });
    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .fillColor(card.color)
      .text(card.value, x + 14, top + 32, { width: cardW - 20 });
  });

  doc.y = top + cardH + 22;
  doc.x = MARGIN;
}

// Column layout (x offsets from MARGIN, and widths)
const COLS = {
  date: { x: 0, w: 92 },
  tag: { x: 92, w: 120 },
  desc: { x: 212, w: 205 },
  amount: { x: 417, w: CONTENT_WIDTH - 417 },
};
const ROW_H = 22;
const HEADER_H = 24;

function drawTable(
  doc: any,
  title: string,
  rows: Row[],
  accent: string,
  total: number
) {
  ensureSpace(doc, 90);

  // Section title with count
  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(INK)
    .text(title, MARGIN, doc.y);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED)
    .text(
      `${rows.length} ${rows.length === 1 ? "entry" : "entries"}`,
      MARGIN,
      doc.y - 13,
      { width: CONTENT_WIDTH, align: "right" }
    );
  doc.moveDown(0.6);

  if (rows.length === 0) {
    doc
      .font("Helvetica-Oblique")
      .fontSize(10)
      .fillColor(MUTED)
      .text(`No ${title.toLowerCase()} recorded yet.`, MARGIN, doc.y);
    doc.moveDown(1.2);
    doc.x = MARGIN;
    return;
  }

  drawTableHeader(doc);

  rows.forEach((row, i) => {
    if (doc.y + ROW_H > PAGE_HEIGHT - 60) {
      doc.addPage();
      doc.y = MARGIN + 10;
      drawTableHeader(doc);
    }
    const y = doc.y;
    if (i % 2 === 1) {
      doc.rect(MARGIN, y, CONTENT_WIDTH, ROW_H).fill(ROW_ALT);
    }
    const textY = y + 6;
    doc.font("Helvetica").fontSize(9).fillColor(INK);
    doc.text(shortDate(row.date), MARGIN + COLS.date.x + 4, textY, {
      width: COLS.date.w - 6,
    });
    doc.text(cap(row.tag), MARGIN + COLS.tag.x + 4, textY, {
      width: COLS.tag.w - 6,
      ellipsis: true,
      lineBreak: false,
    });
    doc.fillColor(MUTED).text(row.description, MARGIN + COLS.desc.x + 4, textY, {
      width: COLS.desc.w - 6,
      ellipsis: true,
      lineBreak: false,
    });
    doc
      .font("Helvetica-Bold")
      .fillColor(accent)
      .text(rupees(row.amount), MARGIN + COLS.amount.x, textY, {
        width: COLS.amount.w - 4,
        align: "right",
      });
    doc.y = y + ROW_H;
  });

  // Total row
  const ty = doc.y;
  doc
    .moveTo(MARGIN, ty)
    .lineTo(MARGIN + CONTENT_WIDTH, ty)
    .lineWidth(1)
    .strokeColor(BORDER)
    .stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(10)
    .fillColor(INK)
    .text("Total", MARGIN + COLS.desc.x + 4, ty + 7, {
      width: COLS.desc.w - 6,
    });
  doc
    .fillColor(accent)
    .text(rupees(total), MARGIN + COLS.amount.x, ty + 7, {
      width: COLS.amount.w - 4,
      align: "right",
    });

  doc.y = ty + ROW_H + 14;
  doc.x = MARGIN;
}

function drawTableHeader(doc: any) {
  const y = doc.y;
  doc.rect(MARGIN, y, CONTENT_WIDTH, HEADER_H).fill("#eef2f7");
  doc.font("Helvetica-Bold").fontSize(8).fillColor(MUTED);
  const ty = y + 8;
  doc.text("DATE", MARGIN + COLS.date.x + 4, ty, { width: COLS.date.w - 6 });
  doc.text("CATEGORY", MARGIN + COLS.tag.x + 4, ty, { width: COLS.tag.w - 6 });
  doc.text("DESCRIPTION", MARGIN + COLS.desc.x + 4, ty, {
    width: COLS.desc.w - 6,
  });
  doc.text("AMOUNT", MARGIN + COLS.amount.x, ty, {
    width: COLS.amount.w - 4,
    align: "right",
  });
  doc.y = y + HEADER_H;
}

function drawPageFooters(doc: any) {
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    const y = PAGE_HEIGHT - 38;
    doc
      .moveTo(MARGIN, y)
      .lineTo(MARGIN + CONTENT_WIDTH, y)
      .lineWidth(0.5)
      .strokeColor(BORDER)
      .stroke();
    doc
      .font("Helvetica")
      .fontSize(8)
      .fillColor(MUTED)
      .text("Generated by Expense Tracker", MARGIN, y + 8, {
        width: CONTENT_WIDTH / 2,
        lineBreak: false,
      });
    doc.text(`Page ${i + 1} of ${range.count}`, MARGIN + CONTENT_WIDTH / 2, y + 8, {
      width: CONTENT_WIDTH / 2,
      align: "right",
      lineBreak: false,
    });
  }
}

// ── Helpers ────────────────────────────────────────────────

function ensureSpace(doc: any, needed: number) {
  if (doc.y + needed > PAGE_HEIGHT - 60) {
    doc.addPage();
    doc.y = MARGIN + 10;
  }
}

function cap(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
