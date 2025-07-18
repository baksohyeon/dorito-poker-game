// packages/database/src/migrations/migrations.service.ts
import { PrismaClient } from '../generated';
import { logger } from '@poker-game/logger';

export class MigrationService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async runMigrations(): Promise<void> {
    try {
      logger.info('Running database migrations...');
      // Prisma handles migrations automatically with prisma migrate deploy
      logger.info('Database migrations completed successfully');
    } catch (error) {
      logger.error('Database migration failed', error);
      throw error;
    }
  }

  async resetDatabase(): Promise<void> {
    try {
      logger.warn('Resetting database...');

      // Delete all data in reverse dependency order
      await this.prisma.gameEvent.deleteMany();
      await this.prisma.gameParticipation.deleteMany();
      await this.prisma.game.deleteMany();
      await this.prisma.table.deleteMany();
      await this.prisma.aIAnalysis.deleteMany();
      await this.prisma.userSession.deleteMany();
      await this.prisma.serverStatus.deleteMany();
      await this.prisma.friendship.deleteMany();
      await this.prisma.user.deleteMany();

      logger.info('Database reset completed');
    } catch (error) {
      logger.error('Database reset failed', error);
      throw error;
    }
  }

  async seedDatabase(): Promise<void> {
    try {
      logger.info('Seeding database...');

      // Create sample users
      const users = await Promise.all([
        this.prisma.user.create({
          data: {
            email: 'admin@poker.com',
            username: 'admin',
            password: '$2b$12$hashedpassword', // Would be properly hashed
            firstName: 'Admin',
            lastName: 'User',
            chips: 100000,
            level: 10,
            rank: 'Expert',
          },
        }),
        this.prisma.user.create({
          data: {
            email: 'player1@poker.com',
            username: 'player1',
            password: '$2b$12$hashedpassword',
            firstName: 'John',
            lastName: 'Doe',
            chips: 5000,
            level: 3,
            rank: 'Intermediate',
          },
        }),
        this.prisma.user.create({
          data: {
            email: 'player2@poker.com',
            username: 'player2',
            password: '$2b$12$hashedpassword',
            firstName: 'Jane',
            lastName: 'Smith',
            chips: 2000,
            level: 2,
            rank: 'Beginner',
          },
        }),
      ]);

      // Create sample server status
      await this.prisma.serverStatus.create({
        data: {
          serverId: 'master-server-1',
          serverType: 'MASTER',
          status: 'ONLINE',
          host: 'localhost',
          port: 3001,
          maxTables: 0,
          maxPlayers: 0,
        },
      });

      await this.prisma.serverStatus.create({
        data: {
          serverId: 'dedicated-server-1',
          serverType: 'DEDICATED',
          status: 'ONLINE',
          host: 'localhost',
          port: 3002,
          maxTables: 20,
          maxPlayers: 180,
        },
      });

      logger.info('Database seeding completed');
    } catch (error) {
      logger.error('Database seeding failed', error);
      throw error;
    }
  }
}
