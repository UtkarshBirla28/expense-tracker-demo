"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.router = void 0;
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const pdfController_1 = require("../controllers/pdfController");
exports.router = (0, express_1.Router)();
exports.router.get("/export", authMiddleware_1.authMiddleware, pdfController_1.exportToPdf);
exports.default = exports.router;
