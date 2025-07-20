
// apps/master-server/src/routes/server.routes.ts
import { Router } from 'express';
import { ServerManager } from '../services/server-manager.service';
import { validationMiddleware } from '../middleware/validation.middleware';
import {
    serverRegistrationSchema,
    serverMetricsSchema,
    tableCreationSchema,
    tableJoinSchema,
    tableUpdateSchema
} from '../schemas/server.schemas';
import { authMiddleware } from '../middleware/auth.middleware';
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

    // ===== TABLE MANAGEMENT ROUTES =====

    // All table routes require authentication
    router.use('/tables', authMiddleware);

    // POST /api/servers/tables/create
    router.post('/tables/create', validationMiddleware(tableCreationSchema), async (req, res) => {
        try {
            const userId = (req as any).userId;
            const tableData = req.body;

            // Add creator information
            const tableInfo = {
                ...tableData,
                createdBy: userId,
                createdAt: new Date().toISOString(),
                status: 'waiting',
                players: 0,
                playersList: []
            };

            // TODO: Implement actual table creation through server manager
            // const table = await serverManager.createTable(tableInfo);

            // For now, return mock table data
            const mockTable = {
                id: `table-${Date.now()}`,
                ...tableInfo,
                averageStack: tableData.startingChips,
                pot: 0,
                gameStage: null,
                lastAction: null
            };

            logger.info(`Table created by user ${userId}:`, mockTable);

            res.status(201).json({
                success: true,
                data: mockTable,
                message: 'Table created successfully'
            });
        } catch (error) {
            logger.error('Table creation error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create table'
            });
        }
    });

    // GET /api/servers/tables
    router.get('/tables', async (req, res) => {
        try {
            const { type, status, stakes, players } = req.query;

            // TODO: Implement actual table listing from server manager
            // let tables = await serverManager.getAllTables();

            // For now, return mock tables
            const tables = [
                {
                    id: 'table-1',
                    name: 'High Stakes Hold\'em',
                    type: 'cash',
                    status: 'playing',
                    players: 6,
                    maxPlayers: 9,
                    minBuyIn: 1000,
                    maxBuyIn: 5000,
                    smallBlind: 10,
                    bigBlind: 20,
                    averageStack: 2500,
                    pot: 450,
                    gameStage: 'flop',
                    timeBank: 30,
                    isPrivate: false,
                    isHighStakes: true,
                    isFastPaced: false,
                    createdBy: 'PokerKing',
                    createdAt: '2024-01-15T10:00:00Z',
                    lastAction: 'River card dealt',
                    playersList: []
                },
                {
                    id: 'table-2',
                    name: 'Quick Play Tournament',
                    type: 'tournament',
                    status: 'starting',
                    players: 8,
                    maxPlayers: 9,
                    minBuyIn: 100,
                    maxBuyIn: 100,
                    smallBlind: 5,
                    bigBlind: 10,
                    averageStack: 1500,
                    pot: 0,
                    timeBank: 15,
                    isPrivate: false,
                    isHighStakes: false,
                    isFastPaced: true,
                    createdBy: 'TournamentHost',
                    createdAt: '2024-01-15T14:30:00Z',
                    playersList: []
                }
            ];

            // Apply filters
            let filteredTables = tables;

            if (type && type !== 'all') {
                filteredTables = filteredTables.filter(t => t.type === type);
            }

            if (status && status !== 'all') {
                filteredTables = filteredTables.filter(t => t.status === status);
            }

            if (stakes && stakes !== 'all') {
                filteredTables = filteredTables.filter(t => {
                    const stakesLevel = t.bigBlind >= 50 ? 'high' : t.bigBlind >= 10 ? 'medium' : 'low';
                    return stakesLevel === stakes;
                });
            }

            if (players && players !== 'all') {
                filteredTables = filteredTables.filter(t => {
                    if (players === 'empty') return t.players === 0;
                    if (players === 'full') return t.players === t.maxPlayers;
                    if (players === 'available') return t.players < t.maxPlayers;
                    return true;
                });
            }

            res.json({
                success: true,
                data: filteredTables
            });
        } catch (error) {
            logger.error('Get tables error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get tables'
            });
        }
    });

    // GET /api/servers/tables/:tableId
    router.get('/tables/:tableId', async (req, res) => {
        try {
            const { tableId } = req.params;

            // TODO: Implement actual table retrieval
            // const table = await serverManager.getTableById(tableId);

            // For now, return mock table data
            const table = {
                id: tableId,
                name: 'Sample Table',
                type: 'cash',
                status: 'waiting',
                players: 3,
                maxPlayers: 9,
                minBuyIn: 100,
                maxBuyIn: 1000,
                smallBlind: 5,
                bigBlind: 10,
                averageStack: 500,
                pot: 0,
                timeBank: 30,
                isPrivate: false,
                isHighStakes: false,
                isFastPaced: false,
                createdBy: 'SampleUser',
                createdAt: '2024-01-15T12:00:00Z',
                playersList: []
            };

            if (!table) {
                return res.status(404).json({
                    success: false,
                    error: 'Table not found'
                });
            }

            res.json({
                success: true,
                data: table
            });
        } catch (error) {
            logger.error('Get table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get table'
            });
        }
    });

    // POST /api/servers/tables/:tableId/join
    router.post('/tables/:tableId/join', validationMiddleware(tableJoinSchema), async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;
            const { position, buyIn, password } = req.body;

            // TODO: Implement actual table joining logic
            // const result = await serverManager.joinTable(tableId, userId, { position, buyIn, password });

            logger.info(`User ${userId} joining table ${tableId}`, { position, buyIn });

            res.json({
                success: true,
                message: 'Joined table successfully',
                data: {
                    tableId,
                    position: position || 0,
                    buyIn: buyIn || 1000
                }
            });
        } catch (error) {
            logger.error('Join table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to join table'
            });
        }
    });

    // POST /api/servers/tables/:tableId/leave
    router.post('/tables/:tableId/leave', async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;

            // TODO: Implement actual table leaving logic
            // await serverManager.leaveTable(tableId, userId);

            logger.info(`User ${userId} leaving table ${tableId}`);

            res.json({
                success: true,
                message: 'Left table successfully'
            });
        } catch (error) {
            logger.error('Leave table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to leave table'
            });
        }
    });

    // PUT /api/servers/tables/:tableId
    router.put('/tables/:tableId', validationMiddleware(tableUpdateSchema), async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;
            const updateData = req.body;

            // TODO: Implement actual table update logic
            // const table = await serverManager.updateTable(tableId, userId, updateData);

            logger.info(`User ${userId} updating table ${tableId}`, updateData);

            res.json({
                success: true,
                message: 'Table updated successfully',
                data: {
                    id: tableId,
                    ...updateData
                }
            });
        } catch (error) {
            logger.error('Update table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update table'
            });
        }
    });

    // DELETE /api/servers/tables/:tableId
    router.delete('/tables/:tableId', async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;

            // TODO: Implement actual table deletion logic
            // await serverManager.deleteTable(tableId, userId);

            logger.info(`User ${userId} deleting table ${tableId}`);

            res.json({
                success: true,
                message: 'Table deleted successfully'
            });
        } catch (error) {
            logger.error('Delete table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete table'
            });
        }
    });

    return router;
}
