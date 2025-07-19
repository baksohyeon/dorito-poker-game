// apps/ai-server/src/index.ts
import { config } from './config';
import { AIServer } from './server';
import { logger } from '@poker-game/logger';

async function startAIServer() {
    try {
        logger.info('Starting AI Server...');
        
        const server = new AIServer();
        await server.start();
        
        logger.info(`🤖 AI Server started on port ${config.port}`);
        
        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('SIGTERM received, shutting down gracefully');
            await server.stop();
            process.exit(0);
        });
        
        process.on('SIGINT', async () => {
            logger.info('SIGINT received, shutting down gracefully');
            await server.stop();
            process.exit(0);
        });
        
    } catch (error) {
        logger.error('Failed to start AI Server:', error);
        process.exit(1);
    }
}

startAIServer();