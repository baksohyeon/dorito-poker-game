
// apps/master-server/src/middleware/validation.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '@poker-game/logger';

export function validationMiddleware(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
        try {
            schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    field: err.path.join('.'),
                    message: err.message
                }));

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors
                });
            } else {
                logger.error('Validation middleware error:', error);
                res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        }
    };
}