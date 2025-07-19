
// apps/master-server/src/routes/server.routes.ts
import { Router } from 'express';
import { ServerManager } from '../services/server-manager.service';
import { validationMiddleware } from '../middleware/validation.middleware';
import { serverRegistrationSchema, serverMetricsSchema } from '../schemas/server.schemas';
import { logger } from '@poker-game/logger';

export function serverRoutes({ serverManager }: { serverManager: ServerManager }) {
    const router = Router();

    // POST /api/servers/register
    router.post('/register', validationMiddleware(serverRegistrationSchema), async (req, res) => {
        try {
            const serverInfo = await serverManager.registerServer(req.body);

            res.status(201).json({
                success: true,
                data: serverInfo
            });
        } catch (error) {
            logger.error('Server registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to register server'
            });
        }
    });

    // DELETE /api/servers/:serverId
    router.delete('/:serverId', async (req, res) => {
        try {
            const { serverId } = req.params;
            await serverManager.unregisterServer(serverId);

            res.json({
                success: true,
                message: 'Server unregistered successfully'
            });
        } catch (error) {
            logger.error('Server unregistration error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to unregister server'
            });
        }
    });

    // PUT /api/servers/:serverId/heartbeat
    router.put('/:serverId/heartbeat', validationMiddleware(serverMetricsSchema), async (req, res) => {
        try {
            const { serverId } = req.params;
            await serverManager.updateServerMetrics(serverId, req.body);

            res.json({
                success: true,
                message: 'Heartbeat received'
            });
        } catch (error) {
            logger.error('Server heartbeat error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process heartbeat'
            });
        }
    });

    // GET /api/servers
    router.get('/', async (req, res) => {
        try {
            const { type, status } = req.query;

            let servers = serverManager.getAllServers();

            if (type) {
                servers = servers.filter(s => s.type === type);
            }

            if (status) {
                servers = servers.filter(s => s.status === status);
            }

            res.json({
                success: true,
                data: servers
            });
        } catch (error) {
            logger.error('Get servers error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get servers'
            });
        }
    });

    // GET /api/servers/:serverId
    router.get('/:serverId', async (req, res) => {
        try {
            const { serverId } = req.params;
            const server = serverManager.getServerById(serverId);

            if (!server) {
                return res.status(404).json({
                    success: false,
                    error: 'Server not found'
                });
            }

            res.json({
                success: true,
                data: server
            });
        } catch (error) {
            logger.error('Get server error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get server'
            });
        }
    });

    // GET /api/servers/stats
    router.get('/stats', async (req, res) => {
        try {
            const stats = serverManager.getServerStats();

            res.json({
                success: true,
                data: stats
            });
        } catch (error) {
            logger.error('Get server stats error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get server stats'
            });
        }
    });

    return router;
}

// apps/master-server/src/routes/player.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { databaseService } from '@poker-game/database';
import { logger } from '@poker-game/logger';

export function playerRoutes(services: any) {
    const router = Router();

    // All player routes require authentication
    router.use(authMiddleware);

    // GET /api/players/profile
    router.get('/profile', async (req, res) => {
        try {
            const userId = (req as any).userId;
            const user = await databaseService.users.findWithStats(userId);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }

            res.json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    chips: user.chips,
                    level: user.level,
                    rank: user.rank,
                    experience: user.experience,
                    stats: {
                        gamesPlayed: user.gamesPlayed,
                        gamesWon: user.gamesWon,
                        totalWinnings: user.totalWinnings,
                        totalLosses: user.totalLosses
                    },
                    settings: {
                        soundEnabled: user.soundEnabled,
                        animationsEnabled: user.animationsEnabled,
                        autoMuckEnabled: user.autoMuckEnabled,
                        aiAssistEnabled: user.aiAssistEnabled
                    }
                }
            });
        } catch (error) {
            logger.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get profile'
            });
        }
    });

    // PUT /api/players/profile
    router.put('/profile', async (req, res) => {
        try {
            const userId = (req as any).userId;
            const updates = req.body;

            // Remove sensitive fields
            delete updates.password;
            delete updates.chips;
            delete updates.level;
            delete updates.experience;

            const updatedUser = await databaseService.users.updateUser(userId, updates);

            res.json({
                success: true,
                data: {
                    id: updatedUser.id,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    firstName: updatedUser.firstName,
                    lastName: updatedUser.lastName,
                    country: updatedUser.country
                }
            });
        } catch (error) {
            logger.error('Update profile error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
    });

    // GET /api/players/game-history
    router.get('/game-history', async (req, res) => {
        try {
            const userId = (req as any).userId;
            const { page = 1, limit = 20 } = req.query;

            const result = await databaseService.games.getPlayerGameHistory(
                userId,
                {
                    page: parseInt(page as string),
                    limit: parseInt(limit as string)
                }
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Get game history error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get game history'
            });
        }
    });

    // GET /api/players/leaderboard
    router.get('/leaderboard', async (req, res) => {
        try {
            const { limit = 50 } = req.query;
            const topPlayers = await databaseService.users.getTopPlayers(parseInt(limit as string));

            res.json({
                success: true,
                data: topPlayers
            });
        } catch (error) {
            logger.error('Get leaderboard error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get leaderboard'
            });
        }
    });

    // GET /api/players/ranking
    router.get('/ranking', async (req, res) => {
        try {
            const userId = (req as any).userId;
            const ranking = await databaseService.users.getUserRanking(userId);

            res.json({
                success: true,
                data: { ranking }
            });
        } catch (error) {
            logger.error('Get ranking error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get ranking'
            });
        }
    });

    return router;
}
