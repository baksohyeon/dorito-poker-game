
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
