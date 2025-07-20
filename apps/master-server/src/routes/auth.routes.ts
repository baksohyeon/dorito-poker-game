
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

    // GET /api/auth/profile (requires auth middleware)
    router.get('/profile', async (req, res) => {
        try {
            // TODO: Add auth middleware to extract userId
            res.status(501).json({
                success: false,
                error: 'Profile endpoint not implemented'
            });
        } catch (error) {
            logger.error('Profile route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // PUT /api/auth/profile (requires auth middleware)
    router.put('/profile', async (req, res) => {
        try {
            // TODO: Add auth middleware and profile update logic
            res.status(501).json({
                success: false,
                error: 'Profile update endpoint not implemented'
            });
        } catch (error) {
            logger.error('Profile update route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // PUT /api/auth/password (requires auth middleware)
    router.put('/password', async (req, res) => {
        try {
            // TODO: Add auth middleware and password change logic
            res.status(501).json({
                success: false,
                error: 'Password change endpoint not implemented'
            });
        } catch (error) {
            logger.error('Password change route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/auth/password-reset
    router.post('/password-reset', async (req, res) => {
        try {
            // TODO: Implement password reset logic
            res.status(501).json({
                success: false,
                error: 'Password reset endpoint not implemented'
            });
        } catch (error) {
            logger.error('Password reset route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/auth/verify-email
    router.post('/verify-email', async (req, res) => {
        try {
            // TODO: Implement email verification logic
            res.status(501).json({
                success: false,
                error: 'Email verification endpoint not implemented'
            });
        } catch (error) {
            logger.error('Email verification route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    return router;
}