
// apps/master-server/src/routes/matching.routes.ts
import { Router } from 'express';
import { PlayerMatchingService } from '../services/player-matching.service';
import { authMiddleware } from '../middleware/auth.middleware';
import { validationMiddleware } from '../middleware/validation.middleware';
import { matchingCriteriaSchema } from '../schemas/matching.schemas';
import { logger } from '@poker-game/logger';

export function matchingRoutes({ playerMatchingService }: { playerMatchingService: PlayerMatchingService }) {
    const router = Router();

    // All matching routes require authentication
    router.use(authMiddleware);

    // POST /api/matching/find-table
    router.post('/find-table', validationMiddleware(matchingCriteriaSchema), async (req, res) => {
        try {
            const playerId = (req as any).userId;
            const criteria = req.body;

            const result = await playerMatchingService.findTableForPlayer(playerId, criteria);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        tableId: result.tableId,
                        serverId: result.serverId,
                        serverEndpoint: result.serverEndpoint
                    }
                });
            } else {
                res.status(404).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Find table route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // POST /api/matching/join-table/:tableId
    router.post('/join-table/:tableId', async (req, res) => {
        try {
            const playerId = (req as any).userId;
            const { tableId } = req.params;

            const result = await playerMatchingService.joinPlayerToTable(playerId, tableId);

            if (result.success) {
                res.json({
                    success: true,
                    data: {
                        serverEndpoint: result.serverEndpoint
                    }
                });
            } else {
                res.status(400).json({
                    success: false,
                    error: result.error
                });
            }
        } catch (error) {
            logger.error('Join table route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    // GET /api/matching/tables
    router.get('/tables', async (req, res) => {
        try {
            const { page = 1, limit = 20, gameType, isPrivate, maxPlayers } = req.query;

            const criteria = {
                gameType: gameType as any,
                isPrivate: isPrivate === 'true',
                maxPlayers: maxPlayers ? parseInt(maxPlayers as string) : undefined
            };

            const result = await playerMatchingService.getAvailableTables(
                criteria,
                parseInt(page as string),
                parseInt(limit as string)
            );

            res.json({
                success: true,
                data: result
            });
        } catch (error) {
            logger.error('Get tables route error:', error);
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    });

    return router;
}
