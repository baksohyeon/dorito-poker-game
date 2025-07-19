
// apps/master-server/src/routes/auth.routes.ts
import { Router } from 'express';
import { AuthService } from '../services/auth.service';
import { validationMiddleware } from '../middleware/validation.middleware';
import { loginSchema, registerSchema } from '../schemas/auth.schemas';
import { logger } from '@poker-game/logger';

export function authRoutes({ authService }: { authService: AuthService }) {
    const router = Router();

    // POST /api/auth/login
    router.post('/login', validationMiddleware(loginSchema), async (req, res) => {
        try {
            const result = await authService.login(req.body);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        token: result.token,
                        refreshToken: result.refreshToken,
                        user: result.user
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Login route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/auth/register
    router.post('/register', validationMiddleware(registerSchema), async (req, res) => {
        try {
            const result = await authService.register(req.body);

            if (result.success) {
                res.status(201).json({
                    success: true,
                    data: {
                        token: result.token,
                        refreshToken: result.refreshToken,
                        user: result.user
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Register route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/auth/refresh
    router.post('/refresh', async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (!refreshToken) {
                return res.status(400).json({
                    success: false,
                    error: 'Refresh token required'
                });
            }

            const result = await authService.refreshToken(refreshToken);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        token: result.token,
                        user: result.user
                    }
                });
            } else {
                res.status(401).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Refresh route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/auth/logout
    router.post('/logout', async (req, res) => {
        try {
            const { refreshToken } = req.body;

            if (refreshToken) {
                await authService.logout(refreshToken);
            }

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            logger.error('Logout route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    return router;
}