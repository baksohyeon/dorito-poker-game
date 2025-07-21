// apps/master-server/src/routes/table.routes.ts
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { logger } from '@poker-game/logger';

interface DedicatedServerConnection {
    id: string;
    host: string;
    port: number;
    status: 'active' | 'inactive' | 'maintenance';
    maxTables: number;
    currentTables: number;
    lastPing: number;
}

interface TableSession {
    id: string;
    tableId: string;
    serverId: string;
    sessionId: string;
    status: 'waiting' | 'active' | 'paused' | 'finished';
    playerCount: number;
    maxPlayers: number;
    gameType: string;
    blinds: { small: number; big: number };
    createdAt: number;
    updatedAt: number;
}

export function tableRoutes(services: any) {
    const router = Router();
    
    // Mock dedicated server registry
    const dedicatedServers: Map<string, DedicatedServerConnection> = new Map([
        ['server-1', {
            id: 'server-1',
            host: 'localhost',
            port: 3001,
            status: 'active',
            maxTables: 10,
            currentTables: 3,
            lastPing: Date.now()
        }],
        ['server-2', {
            id: 'server-2',
            host: 'localhost',
            port: 3002,
            status: 'active',
            maxTables: 10,
            currentTables: 1,
            lastPing: Date.now()
        }]
    ]);
    
    // Mock active sessions
    const activeSessions: Map<string, TableSession> = new Map();

    // All table routes require authentication
    router.use(authMiddleware);

    // GET /api/tables - Get available tables from dedicated servers
    router.get('/', async (req, res) => {
        try {
            const activeServers = Array.from(dedicatedServers.values())
                .filter(server => server.status === 'active');
            
            if (activeServers.length === 0) {
                return res.json({
                    success: true,
                    data: [],
                    message: 'No dedicated servers available'
                });
            }

            // Aggregate tables from all active dedicated servers
            const allTables: any[] = [];
            
            for (const server of activeServers) {
                try {
                    // In production, this would make HTTP requests to dedicated servers
                    const serverTables = [
                        {
                            id: `${server.id}-table-1`,
                            name: 'Texas Hold\'em - Beginner',
                            gameType: 'texas-holdem',
                            blinds: { small: 1, big: 2 },
                            maxPlayers: 9,
                            playerCount: Math.floor(Math.random() * 6),
                            status: 'active',
                            isPrivate: false,
                            averagePot: 45,
                            handsPerHour: 85,
                            serverId: server.id,
                            serverHost: server.host,
                            serverPort: server.port
                        },
                        {
                            id: `${server.id}-table-2`,
                            name: 'Texas Hold\'em - Intermediate',
                            gameType: 'texas-holdem',
                            blinds: { small: 5, big: 10 },
                            maxPlayers: 9,
                            playerCount: Math.floor(Math.random() * 8),
                            status: 'active',
                            isPrivate: false,
                            averagePot: 120,
                            handsPerHour: 78,
                            serverId: server.id,
                            serverHost: server.host,
                            serverPort: server.port
                        }
                    ];
                    
                    allTables.push(...serverTables);
                } catch (serverError) {
                    logger.warn(`Failed to get tables from server ${server.id}:`, serverError);
                }
            }

            res.json({
                success: true,
                data: allTables,
                serverCount: activeServers.length
            });
        } catch (error) {
            logger.error('Get tables error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get tables'
            });
        }
    });

    // GET /api/tables/:tableId - Get specific table details
    router.get('/:tableId', async (req, res) => {
        try {
            const { tableId } = req.params;
            
            // Find which server hosts this table
            const serverId = tableId.split('-')[0] + '-' + tableId.split('-')[1];
            const server = dedicatedServers.get(serverId);
            
            if (!server || server.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    error: 'Table not found or server unavailable'
                });
            }

            // Get active session for this table
            const session = Array.from(activeSessions.values())
                .find(s => s.tableId === tableId);

            const tableDetails = {
                id: tableId,
                name: tableId.includes('table-1') ? 'Texas Hold\'em - Beginner' : 'Texas Hold\'em - Intermediate',
                gameType: 'texas-holdem',
                blinds: tableId.includes('table-1') ? { small: 1, big: 2 } : { small: 5, big: 10 },
                maxPlayers: 9,
                playerCount: Math.floor(Math.random() * 6),
                status: session?.status || 'waiting',
                isPrivate: false,
                serverId: server.id,
                serverHost: server.host,
                serverPort: server.port,
                sessionId: session?.sessionId || null,
                currentHand: session ? Math.floor(Math.random() * 50) : 0,
                pot: session ? Math.floor(Math.random() * 200) : 0,
                phase: session ? ['preflop', 'flop', 'turn', 'river'][Math.floor(Math.random() * 4)] : null
            };

            res.json({
                success: true,
                data: tableDetails
            });
        } catch (error) {
            logger.error('Get table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get table'
            });
        }
    });

    // POST /api/tables/:tableId/join - Join a table
    router.post('/:tableId/join', async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;
            const { buyInAmount, position } = req.body;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            // Find the dedicated server hosting this table
            const serverId = tableId.split('-')[0] + '-' + tableId.split('-')[1];
            const server = dedicatedServers.get(serverId);
            
            if (!server || server.status !== 'active') {
                return res.status(404).json({
                    success: false,
                    error: 'Table not available'
                });
            }

            // Create or get existing session
            let sessionId = `session_${tableId}_${Date.now()}`;
            const existingSession = Array.from(activeSessions.values())
                .find(s => s.tableId === tableId);
            
            if (existingSession) {
                sessionId = existingSession.sessionId;
            } else {
                // Create new session
                const newSession: TableSession = {
                    id: sessionId,
                    tableId,
                    serverId: server.id,
                    sessionId,
                    status: 'waiting',
                    playerCount: 0,
                    maxPlayers: 9,
                    gameType: 'texas-holdem',
                    blinds: tableId.includes('table-1') ? { small: 1, big: 2 } : { small: 5, big: 10 },
                    createdAt: Date.now(),
                    updatedAt: Date.now()
                };
                activeSessions.set(sessionId, newSession);
                logger.info(`Created new session ${sessionId} for table ${tableId}`);
            }

            // In production, forward join request to dedicated server
            const joinResponse = {
                success: true,
                sessionId,
                tableId,
                serverId: server.id,
                serverEndpoint: `ws://${server.host}:${server.port}`,
                position: position || 1,
                buyInAmount: buyInAmount || 200,
                tableConfig: {
                    name: tableId.includes('table-1') ? 'Texas Hold\'em - Beginner' : 'Texas Hold\'em - Intermediate',
                    gameType: 'texas-holdem',
                    blinds: tableId.includes('table-1') ? { small: 1, big: 2 } : { small: 5, big: 10 },
                    maxPlayers: 9,
                    bettingLimit: 'no-limit'
                }
            };

            logger.info(`Player ${userId} joined table ${tableId} on server ${server.id}`);

            res.json({
                success: true,
                data: joinResponse,
                message: 'Successfully joined table'
            });
        } catch (error) {
            logger.error('Join table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to join table'
            });
        }
    });

    // POST /api/tables/:tableId/leave - Leave a table
    router.post('/:tableId/leave', async (req, res) => {
        try {
            const { tableId } = req.params;
            const userId = (req as any).userId;
            
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            // Find the session for this table
            const session = Array.from(activeSessions.values())
                .find(s => s.tableId === tableId);

            if (!session) {
                return res.status(404).json({
                    success: false,
                    error: 'Table session not found'
                });
            }

            // Find the dedicated server
            const server = dedicatedServers.get(session.serverId);
            
            if (!server) {
                return res.status(404).json({
                    success: false,
                    error: 'Dedicated server not available'
                });
            }

            // In production, forward leave request to dedicated server
            logger.info(`Player ${userId} left table ${tableId} on server ${session.serverId}`);
            
            res.json({
                success: true,
                message: 'Successfully left table'
            });
        } catch (error) {
            logger.error('Leave table error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to leave table'
            });
        }
    });

    // POST /api/servers/register - Dedicated server registration
    router.post('/servers/register', async (req, res) => {
        try {
            const { serverId, host, port, maxTables } = req.body;
            
            if (!serverId || !host || !port) {
                return res.status(400).json({
                    success: false,
                    error: 'Missing required server information'
                });
            }

            const server: DedicatedServerConnection = {
                id: serverId,
                host,
                port,
                status: 'active',
                maxTables: maxTables || 10,
                currentTables: 0,
                lastPing: Date.now()
            };

            dedicatedServers.set(serverId, server);
            logger.info(`Dedicated server ${serverId} registered at ${host}:${port}`);

            res.json({
                success: true,
                message: 'Server registered successfully',
                serverId
            });
        } catch (error) {
            logger.error('Server registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to register server'
            });
        }
    });

    // POST /api/servers/:serverId/ping - Server heartbeat
    router.post('/servers/:serverId/ping', async (req, res) => {
        try {
            const { serverId } = req.params;
            const { currentTables } = req.body;
            
            const server = dedicatedServers.get(serverId);
            if (!server) {
                return res.status(404).json({
                    success: false,
                    error: 'Server not registered'
                });
            }

            server.lastPing = Date.now();
            server.currentTables = currentTables || 0;
            server.status = 'active';

            dedicatedServers.set(serverId, server);

            res.json({
                success: true,
                message: 'Ping received'
            });
        } catch (error) {
            logger.error('Server ping error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process ping'
            });
        }
    });

    // GET /api/servers/status - Get server status
    router.get('/servers/status', async (req, res) => {
        try {
            const servers = Array.from(dedicatedServers.values()).map(server => ({
                id: server.id,
                host: server.host,
                port: server.port,
                status: server.status,
                currentTables: server.currentTables,
                maxTables: server.maxTables,
                lastPing: server.lastPing,
                online: Date.now() - server.lastPing < 60000 // 1 minute timeout
            }));

            res.json({
                success: true,
                data: {
                    servers,
                    totalServers: servers.length,
                    activeServers: servers.filter(s => s.online).length,
                    totalTables: servers.reduce((sum, s) => sum + s.currentTables, 0)
                }
            });
        } catch (error) {
            logger.error('Get server status error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get server status'
            });
        }
    });

    return router;
}