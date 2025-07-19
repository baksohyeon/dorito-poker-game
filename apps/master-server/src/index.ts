// apps/master-server/src/index.ts
import { MasterServer } from './server';
import { config } from './config';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';

async function bootstrap() {
    try {
        logger.info('🎯 Starting Master Server...');

        // Connect to database
        await databaseService.connect();
        logger.info('✅ Database connected');

        // Create and start server
        const server = new MasterServer(config);
        await server.start();

        logger.info(`🎯 Master Server running on port ${config.port}`);
        logger.info(`🌐 Environment: ${config.nodeEnv}`);

        // Graceful shutdown
        process.on('SIGTERM', async () => {
            logger.info('🛑 Received SIGTERM, shutting down gracefully...');
            await server.stop();
            await databaseService.disconnect();
            process.exit(0);
        });

        process.on('SIGINT', async () => {
            logger.info('🛑 Received SIGINT, shutting down gracefully...');
            await server.stop();
            await databaseService.disconnect();
            process.exit(0);
        });

    } catch (error) {
        logger.error('❌ Failed to start Master Server:', error);
        process.exit(1);
    }
}

bootstrap();
