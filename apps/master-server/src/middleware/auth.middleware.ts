
// apps/master-server/src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { logger } from '@poker-game/logger';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
    userId?: string;
    user?: any;
}

export async function authMiddleware(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Authorization token required'
            });
            return;
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        const validation = await authService.validateToken(token);

        if (!validation.valid) {
            res.status(401).json({
                success: false,
                error: validation.error || 'Invalid token'
            });
            return;
        }

        // Attach user ID to request
        req.userId = validation.userId;

        next();
    } catch (error) {
        logger.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: 'Authentication error'
        });
    }
}