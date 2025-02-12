import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwtUtils';

interface AuthenticatedRequest extends Request {
    userId?: number;
}

export const authMiddleware = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
):Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
       res.status(401).json({ error: 'Access token is required' });
       return;
    }

    try {
        const decoded = await verifyToken(token);
        req.userId = decoded.userId;
        next();
    } catch (error) {
         res.status(403).json({ error: 'Invalid or expired token' });
         return;
    }
}