// apps/ai-server/src/server.ts
import express from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import * as Redis from 'redis';
import { config } from './config';
import { logger } from '@poker-game/logger';
import { AIAnalysisService } from './services/analysis.service';
import { HandAnalyzer } from './services/hand-analyzer.service';

export class AIServer {
    private app: express.Application;
    private server: any;
    private io: SocketIOServer;
    private redis: any;
    private analysisService: AIAnalysisService;
    private handAnalyzer: HandAnalyzer;

    constructor() {
        this.app = express();
        this.server = createServer(this.app);
        this.io = new SocketIOServer(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });
        
        this.analysisService = new AIAnalysisService();
        this.handAnalyzer = new HandAnalyzer();
        
        this.setupMiddleware();
        this.setupRoutes();
        this.setupSocketHandlers();
    }

    private setupMiddleware() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    private setupRoutes() {
        // Health check
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                service: 'ai-server',
                timestamp: new Date().toISOString(),
                workers: config.workerCount
            });
        });

        // Hand analysis endpoint
        this.app.post('/api/analyze', async (req, res) => {
            try {
                const { holeCards, communityCards, position, potSize, betToCall } = req.body;
                
                const analysis = await this.handAnalyzer.analyzeHand({
                    holeCards,
                    communityCards,
                    position,
                    potSize,
                    betToCall
                });
                
                res.json({
                    success: true,
                    analysis
                });
            } catch (error) {
                logger.error('Hand analysis failed:', error);
                res.status(500).json({
                    success: false,
                    error: 'Analysis failed'
                });
            }
        });

        // Get player recommendations
        this.app.post('/api/recommend', async (req, res) => {
            try {
                const analysis = await this.analysisService.getRecommendation(req.body);
                res.json({
                    success: true,
                    recommendation: analysis
                });
            } catch (error) {
                logger.error('Recommendation failed:', error);
                res.status(500).json({
                    success: false,
                    error: 'Recommendation failed'
                });
            }
        });
    }

    private setupSocketHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`AI client connected: ${socket.id}`);

            socket.on('analyze-hand', async (data) => {
                try {
                    const analysis = await this.handAnalyzer.analyzeHand(data);
                    socket.emit('analysis-result', analysis);
                } catch (error) {
                    logger.error('Socket hand analysis failed:', error);
                    socket.emit('analysis-error', { error: 'Analysis failed' });
                }
            });

            socket.on('disconnect', () => {
                logger.info(`AI client disconnected: ${socket.id}`);
            });
        });
    }

    private async connectRedis() {
        try {
            this.redis = Redis.createClient({ url: config.redisUrl });
            await this.redis.connect();
            logger.info('Connected to Redis');
        } catch (error) {
            logger.error('Failed to connect to Redis:', error);
            throw error;
        }
    }

    async start() {
        await this.connectRedis();
        
        return new Promise<void>((resolve) => {
            this.server.listen(config.port, () => {
                logger.info(`AI Server listening on port ${config.port}`);
                resolve();
            });
        });
    }

    async stop() {
        if (this.redis) {
            await this.redis.disconnect();
        }
        
        return new Promise<void>((resolve) => {
            this.server.close(() => {
                logger.info('AI Server stopped');
                resolve();
            });
        });
    }
}