"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jwtUtils_1 = require("../utils/jwtUtils");
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Access token is required' });
        return;
    }
    try {
        const decoded = await (0, jwtUtils_1.verifyToken)(token);
        req.userId = decoded.userId;
        next();
    }
    catch (error) {
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
    }
};
exports.authMiddleware = authMiddleware;
