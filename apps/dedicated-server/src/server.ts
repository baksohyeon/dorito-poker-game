
// apps/dedicated-server/src/server.ts
import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import express from 'express';
import { logger } from '@poker-game/logger';
import { ConnectionManager } from './managers/connection-manager';
import { TableManager } from './managers/table-manager';
import { GameManager } from './managers/game-manager';
import { EventManager } from './managers/event-manager';
import { SecurityManager } from './managers/security-manager';
import { MonitoringManager } from './managers/monitoring-manager';
import { PersistenceManager } from './managers/persistence-manager';
import { config, securityConfig, performanceConfig } from './config';

// Define types locally to avoid import issues
interface ClientToServerEvents {
    'player:join-table': (data: { tableId: string; position?: number }) => void;
    'player:leave-table': () => void;
    'player:reconnect': (data: { reconnectToken: string }) => void;
    'game:action': (data: { action: any }) => void;
    'game:ready': () => void;
    'chat:message': (data: { message: string; type?: 'chat' | 'emote' }) => void;
    'heartbeat': () => void;
    'ping': () => void;
}

interface ServerToClientEvents {
    'notification': (data: { type: string; message: string }) => void;
    'error': (data: { code: string; message: string }) => void;
    'table:player-joined': (data: any) => void;
    'table:player-left': (data: any) => void;
    'table:updated': (data: any) => void;
    'game:action-result': (data: any) => void;
    'game:state-update': (data: any) => void;
    'game:state-sync': (data: any) => void;
    'player:reconnected': (data: any) => void;
    'player:disconnected': (data: any) => void;
    'chat:message': (data: any) => void;
    'heartbeat_ack': () => void;
    'pong': (data: { timestamp: number; serverId: string }) => void;
}

export class DedicatedServer {
    private app: express.Application;
    private httpServer: any;
    private io!: SocketIOServer<ClientToServerEvents, ServerToClientEvents>;
    private connectionManager!: ConnectionManager;
    private tableManager!: TableManager;
    private gameManager!: GameManager;
    private eventManager!: EventManager;
    private securityManager!: SecurityManager;
    private monitoringManager!: MonitoringManager;
    private persistenceManager!: PersistenceManager;
    private isRunning = false;

    constructor() {
        this.app = express();
        this.httpServer = createServer(this.app);
        this.setupSocketIO();
        this.setupManagers();
        this.setupRoutes();
        this.setupSocketHandlers();
        this.setupMonitoring();
    }

    private setupSocketIO(): void {
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: process.env.CORS_ORIGIN || "*",
                methods: ["GET", "POST"],
                credentials: true
            },
            transports: ['websocket', 'polling'],
            pingTimeout: performanceConfig.pingTimeout,
            pingInterval: performanceConfig.pingInterval,
            maxHttpBufferSize: performanceConfig.maxPayloadSize,
            allowEIO3: true
        });

        // Socket.IO middleware for basic validation
        this.io.use((socket, next) => {
            try {
                // Basic validation
                if (!socket.handshake.headers['user-agent']) {
                    return next(new Error('User agent required'));
                }
                next();
            } catch (error) {
                logger.error('Socket authentication error:', error);
                next(new Error('Authentication failed'));
            }
        });
    }

    private setupManagers(): void {
        this.eventManager = new EventManager();
        this.tableManager = new TableManager(config.serverId, config.machineId);
        this.gameManager = new GameManager();
        this.securityManager = new SecurityManager();
        this.monitoringManager = new MonitoringManager();
        this.persistenceManager = new PersistenceManager(config.redisUrl);
        this.connectionManager = new ConnectionManager(this.io);
        // this.masterServerClient = new MasterServerClient(config.masterServerUrl);

        // Connect managers
        this.connectionManager.setTableManager(this.tableManager);
        this.connectionManager.setGameManager(this.gameManager);
        this.connectionManager.setEventManager(this.eventManager);
        this.connectionManager.setSecurityManager(this.securityManager);

        this.tableManager.setEventManager(this.eventManager);
        this.gameManager.setEventManager(this.eventManager);

        // Setup monitoring event listeners
        this.monitoringManager.on('alert', (alertData) => {
            logger.warn('Performance alert triggered:', alertData);
            // Could send to external monitoring service here
        });
    }

    private setupMonitoring(): void {
        // Start performance monitoring
        this.monitoringManager.startMonitoring();

        // Start auto-save for game states
        this.persistenceManager.startAutoSave();

        // Update monitoring with external metrics every 5 seconds
        setInterval(() => {
            this.monitoringManager.updateExternalMetrics({
                activeConnections: this.connectionManager.getPlayerCount(),
                activeTables: this.tableManager.getTableCount(),
                activeGames: this.gameManager.getActiveGameCount()
            });
        }, 5000);

        // Log performance summary every minute
        setInterval(() => {
            const metrics = this.monitoringManager.getCurrentMetrics();
            const health = this.monitoringManager.getHealthStatus();
            
            logger.info('Performance summary:', {
                cpu: `${metrics.cpuUsage.toFixed(1)}%`,
                memory: `${metrics.memoryUsage.toFixed(1)}%`,
                connections: metrics.activeConnections,
                tables: metrics.activeTables,
                games: metrics.activeGames,
                avgResponseTime: `${metrics.averageResponseTime.toFixed(0)}ms`,
                health: health.status
            });
        }, 60000);
    }

    private setupRoutes(): void {
        this.app.use(express.json({ 
            limit: `${performanceConfig.maxPayloadSize}b`,
            strict: true
        }));

        // Health check endpoint
        this.app.get('/health', (req, res) => {
            const startTime = Date.now();
            
            try {
                const health = this.monitoringManager.getHealthStatus();
                const stats = this.getServerStats();
                
                res.json({
                    status: health.status,
                    serverId: config.serverId,
                    ...stats,
                    health,
                    timestamp: Date.now()
                });
                
                this.monitoringManager.recordRequestTime(startTime);
            } catch (error) {
                logger.error('Health check error:', error);
                this.monitoringManager.recordError();
                res.status(500).json({ error: 'Health check failed' });
            }
        });

        // Detailed metrics endpoint
        this.app.get('/metrics', (req, res) => {
            const startTime = Date.now();
            
            try {
                const metrics = this.monitoringManager.exportMetrics();
                const connectionStats = this.connectionManager.getConnectionStats();
                
                res.json({
                    ...metrics,
                    connections: connectionStats,
                    server: {
                        serverId: config.serverId,
                        region: config.region,
                        version: process.env.npm_package_version || '1.0.0'
                    }
                });
                
                this.monitoringManager.recordRequestTime(startTime);
            } catch (error) {
                logger.error('Metrics endpoint error:', error);
                this.monitoringManager.recordError();
                res.status(500).json({ error: 'Metrics unavailable' });
            }
        });

        // Table management endpoints
        this.app.post('/api/tables', async (req, res) => {
            const startTime = Date.now();
            
            try {
                // Validate request
                if (!req.body || typeof req.body !== 'object') {
                    return res.status(400).json({ 
                        success: false, 
                        error: 'Invalid request body' 
                    });
                }

                const table = await this.tableManager.createTable(req.body);
                res.json({ success: true, table });
                
                this.monitoringManager.recordRequestTime(startTime);
            } catch (error) {
                logger.error('Failed to create table:', error);
                this.monitoringManager.recordError();
                res.status(500).json({ 
                    success: false, 
                    error: error instanceof Error ? error.message : 'Failed to create table' 
                });
            }
        });

        // Security endpoints
        this.app.get('/api/security/stats', (req, res) => {
            try {
                const securityMetrics = this.securityManager.getMetrics();
                res.json(securityMetrics);
            } catch (error) {
                logger.error('Security stats error:', error);
                res.status(500).json({ error: 'Security stats unavailable' });
            }
        });

        // Error handling middleware
        this.app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
            logger.error('Express error:', error);
            this.monitoringManager.recordError();
            
            res.status(error.status || 500).json({
                error: error instanceof Error ? error.message : 'Internal server error',
                timestamp: Date.now()
            });
        });

        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({ 
                error: 'Endpoint not found',
                timestamp: Date.now()
            });
        });
    }

    private setupSocketHandlers(): void {
        this.io.on('connection', (socket) => {
            logger.debug(`New socket connection: ${socket.id}`);
            
            try {
                this.connectionManager.handleConnection(socket);
            } catch (error) {
                logger.error('Error handling socket connection:', error);
                this.monitoringManager.recordError();
                socket.disconnect(true);
            }
        });

        this.io.on('connect_error', (error) => {
            logger.error('Socket connection error:', error);
            this.monitoringManager.recordError();
        });
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            throw new Error('Server is already running');
        }

        return new Promise((resolve, reject) => {
            this.httpServer.listen(config.port, config.host, () => {
                this.isRunning = true;

                logger.info(`🚀 Enhanced Dedicated Server started`);
                logger.info(`📍 Host: ${config.host}:${config.port}`);
                logger.info(`🆔 Server ID: ${config.serverId}`);
                logger.info(`🌍 Region: ${config.region}`);
                logger.info(`🔒 Security: Enhanced`);
                logger.info(`📊 Monitoring: Active`);

                // Register with master server
                // this.registerWithMaster();

                // Start heartbeat
                // this.startHeartbeat();

                resolve();
            }).on('error', (error: any) => {
                logger.error('Server startup error:', error);
                reject(error);
            });
        });
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        logger.info('🛑 Stopping Enhanced Dedicated Server...');

        try {
            // Stop monitoring
            this.monitoringManager.stopMonitoring();

            // Stop persistence
            this.persistenceManager.stopAutoSave();
            await this.persistenceManager.disconnect();

            // Unregister from master server
            // await this.masterServerClient.unregister(config.serverId);

            // Close all connections
            this.io.close();

            // Close HTTP server
            await new Promise<void>((resolve) => {
                this.httpServer.close(() => {
                    this.isRunning = false;
                    logger.info('✅ Enhanced Dedicated Server stopped');
                    resolve();
                });
            });
        } catch (error) {
            logger.error('Error during server shutdown:', error);
            throw error;
        }
    }

    // private async registerWithMaster(): Promise<void> {
    //     try {
    //         await this.masterServerClient.register({
    //             serverId: config.serverId,
    //             type: 'dedicated',
    //             status: 'online',
    //             host: config.host,
    //             port: config.port,
    //             region: config.region,
    //             capabilities: {
    //                 maxTables: config.maxTables,
    //                 maxPlayersPerTable: config.maxPlayersPerTable,
    //                 securityEnhanced: true,
    //                 monitoringEnabled: true
    //             },
    //             metrics: this.getServerStats()
    //         });
    //         logger.info('✅ Registered with master server');
    //     } catch (error) {
    //         logger.error('❌ Failed to register with master server:', error);
    //         this.monitoringManager.recordError();
    //     }
    // }

    // private startHeartbeat(): void {
    //     setInterval(async () => {
    //         try {
    //             await this.masterServerClient.heartbeat(config.serverId, this.getServerStats());
    //         } catch (error) {
    //             logger.error('Heartbeat failed:', error);
    //             this.monitoringManager.recordError();
    //         }
    //     }, 30000); // 30 seconds
    // }

    private getServerStats() {
        const currentMetrics = this.monitoringManager.getCurrentMetrics();
        const health = this.monitoringManager.getHealthStatus();
        
        return {
            currentTables: this.tableManager.getTableCount(),
            currentPlayers: this.connectionManager.getPlayerCount(),
            currentGames: this.gameManager.getActiveGameCount(),
            cpuUsage: currentMetrics.cpuUsage,
            memoryUsage: currentMetrics.memoryUsage,
            averageResponseTime: currentMetrics.averageResponseTime,
            uptime: process.uptime(),
            health: health.status,
            version: process.env.npm_package_version || '1.0.0'
        };
    }

    // Graceful shutdown handlers
    setupGracefulShutdown(): void {
        const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
        
        for (const signal of signals) {
            process.on(signal, async () => {
                logger.info(`🛑 Received ${signal}, shutting down gracefully...`);
                
                try {
                    await this.stop();
                    process.exit(0);
                } catch (error) {
                    logger.error('Error during graceful shutdown:', error);
                    process.exit(1);
                }
            });
        }

        // Handle uncaught exceptions
        process.on('uncaughtException', (error) => {
            logger.error('Uncaught exception:', error);
            this.monitoringManager.recordError();
            
            // Attempt graceful shutdown
            this.stop().finally(() => {
                process.exit(1);
            });
        });

        // Handle unhandled promise rejections
        process.on('unhandledRejection', (reason, promise) => {
            logger.error('Unhandled rejection at:', promise, 'reason:', reason);
            this.monitoringManager.recordError();
        });
    }
}
