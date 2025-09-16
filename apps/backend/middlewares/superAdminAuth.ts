import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'agromerce_secret';

export const superAdminAuth = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization token not provided.' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Token format is invalid.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };
        if (decoded.role !== 'super_admin') {
            return res.status(403).json({ error: 'Access denied. Only super admins can perform this action.' });
        }
        (req as any).user = decoded; 
        next();

    } catch (error) {
        console.error('Super admin authentication failed:', error);
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
};