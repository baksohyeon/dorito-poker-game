
// apps/master-server/src/server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { errorHandler } from './middleware/error.middleware';
import { ServerManager } from './services/server-manager.service';
import { PlayerMatchingService } from './services/player-matching.service';
import { AuthService } from './services/auth.service';
import { HashRingService } from './services/hash-ring.service';
import { setupRoutes } from './routes';
import { MasterServerConfig } from './config';

export class MasterServer {
    private app: express.Application;
    private httpServer: any;
    private serverManager!: ServerManager;
    private playerMatchingService!: PlayerMatchingService;
    private authService!: AuthService;
    private hashRingService!: HashRingService;
    private isRunning = false;

    constructor(private config: MasterServerConfig) {
        this.app = express();
        this.httpServer = createServer(this.app);

        this.setupServices();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupErrorHandling();
    }

    private setupServices(): void {
        this.hashRingService = new HashRingService();
        this.serverManager = new ServerManager(this.hashRingService);
        this.playerMatchingService = new PlayerMatchingService(this.serverManager);
        this.authService = new AuthService();
    }

    private setupMiddleware(): void {
        // Security middleware
        this.app.use(helmet());
        this.app.use(cors({
            origin: this.config.corsOrigins,
            credentials: true
        }));

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // limit each IP to 100 requests per windowMs
            message: 'Too many requests from this IP, please try again later.',
            standardHeaders: true,
            legacyHeaders: false,
        });
        this.app.use('/api/', limiter);

        // Body parsing
        this.app.use(express.json({ limit: '10mb' }));
        this.app.use(express.urlencoded({ extended: true }));

        // Request logging
        this.app.use((req, res, next) => {
            logger.debug(`${req.method} ${req.path}`, {
                ip: req.ip,
                userAgent: req.get('User-Agent')
            });
            next();
        });
    }

    private setupRoutes(): void {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                servers: this.serverManager.getServerCount(),
                activePlayers: this.playerMatchingService.getActivePlayerCount()
            });
        });

        // Setup API routes
        setupRoutes(this.app, {
            serverManager: this.serverManager,
            playerMatchingService: this.playerMatchingService,
            authService: this.authService,
            hashRingService: this.hashRingService
        });
    }

    private setupErrorHandling(): void {
        // 404 handler
        this.app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                error: 'Route not found'
            });
        });

        // Global error handler
        this.app.use(errorHandler);
    }

    async start(): Promise<void> {
        if (this.isRunning) {
            throw new Error('Server is already running');
        }

        return new Promise((resolve, reject) => {
            this.httpServer.listen(this.config.port, () => {
                this.isRunning = true;

                // Start background services
                this.startBackgroundServices();

                resolve();
            }).on('error', reject);
        });
    }

    async stop(): Promise<void> {
        if (!this.isRunning) {
            return;
        }

        logger.info('🛑 Stopping Master Server...');

        // Stop background services
        this.stopBackgroundServices();

        return new Promise((resolve) => {
            this.httpServer.close(() => {
                this.isRunning = false;
                logger.info('✅ Master Server stopped');
                resolve();
            });
        });
    }

    private startBackgroundServices(): void {
        // Start server health monitoring
        this.serverManager.startHealthMonitoring();

        // Start metrics collection
        this.startMetricsCollection();

        // Start database cleanup
        this.startDatabaseCleanup();
    }

    private stopBackgroundServices(): void {
        this.serverManager.stopHealthMonitoring();
    }

    private startMetricsCollection(): void {
        setInterval(() => {
            const metrics = {
                servers: this.serverManager.getServerStats(),
                players: this.playerMatchingService.getPlayerStats(),
                system: {
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage()
                }
            };

            logger.info('System metrics', metrics);
        }, 60000); // Every minute
    }

    private startDatabaseCleanup(): void {
        setInterval(async () => {
            try {
                await databaseService.runMaintenance();
                logger.debug('Database maintenance completed');
            } catch (error) {
                logger.error('Database maintenance failed:', error);
            }
        }, 24 * 60 * 60 * 1000); // Every 24 hours
    }
}
