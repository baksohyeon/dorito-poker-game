// apps/master-server/src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '@poker-game/logger';

export function errorHandler(
    error: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void {
    logger.error('Unhandled error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body
    });

    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
}
