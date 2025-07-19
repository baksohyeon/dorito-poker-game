// apps/dedicated-server/src/index.ts
import { DedicatedServer } from './server';
import { config } from './config';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';

async function bootstrap() {
    try {
        logger.info('🚀 Starting Enhanced Dedicated Server...');

        // Connect to database
        await databaseService.connect();
        logger.info('✅ Database connected');

        // Create and start server
        const server = new DedicatedServer();
        
        // Setup graceful shutdown handlers
        server.setupGracefulShutdown();
        
        await server.start();

        logger.info(`🎮 Enhanced Dedicated Server running on port ${config.port}`);
        logger.info(`🆔 Server ID: ${config.serverId}`);
        logger.info(`🏭 Machine ID: ${config.machineId}`);

    } catch (error) {
        logger.error('❌ Failed to start Enhanced Dedicated Server:', error);
        process.exit(1);
    }
}

bootstrap();