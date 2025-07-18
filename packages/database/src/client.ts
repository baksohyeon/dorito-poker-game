// packages/database/src/client.ts
import { PrismaClient } from './generated';
import { logger } from '@poker-game/logger';

class DatabaseClient {
  private static instance: PrismaClient;
  private static isConnected = false;

  static getInstance(): PrismaClient {
    if (!DatabaseClient.instance) {
      DatabaseClient.instance = new PrismaClient();

      // Setup logging
      DatabaseClient.instance.$on('query', (e: any) => {
        logger.debug('Database Query', {
          query: e.query,
          params: e.params,
          duration: e.duration,
        });
      });

      DatabaseClient.instance.$on('error', (e: any) => {
        logger.error('Database Error', e);
      });

      DatabaseClient.instance.$on('info', (e: any) => {
        logger.info('Database Info', e);
      });

      DatabaseClient.instance.$on('warn', (e: any) => {
        logger.warn('Database Warning', e);
      });
    }

    return DatabaseClient.instance;
  }

  static async connect(): Promise<void> {
    if (DatabaseClient.isConnected) {
      return;
    }

    try {
      const client = DatabaseClient.getInstance();
      await client.$connect();
      DatabaseClient.isConnected = true;
      logger.info('Database connected successfully');
    } catch (error) {
      logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  static async disconnect(): Promise<void> {
    if (!DatabaseClient.isConnected) {
      return;
    }

    try {
      const client = DatabaseClient.getInstance();
      await client.$disconnect();
      DatabaseClient.isConnected = false;
      logger.info('Database disconnected successfully');
    } catch (error) {
      logger.error('Failed to disconnect from database', error);
      throw error;
    }
  }

  static async healthCheck(): Promise<boolean> {
    try {
      const client = DatabaseClient.getInstance();
      await client.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      logger.error('Database health check failed', error);
      return false;
    }
  }

  static isConnectionActive(): boolean {
    return DatabaseClient.isConnected;
  }
}

export { DatabaseClient };
export const prisma = DatabaseClient.getInstance();
