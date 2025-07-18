// packages/database/src/services/database.service.ts
import { DatabaseClient } from '../client';
import { UserRepository } from '../repositories/user.repository';
import { SessionRepository } from '../repositories/session.repository';
import { GameRepository } from '../repositories/game.repository';
import { TableRepository } from '../repositories/table.repository';
import { AIAnalysisRepository } from '../repositories/ai-analysis.repository';
import { ServerStatusRepository } from '../repositories/server-status.repository';

export class DatabaseService {
  public readonly users: UserRepository;
  public readonly sessions: SessionRepository;
  public readonly games: GameRepository;
  public readonly tables: TableRepository;
  public readonly aiAnalyses: AIAnalysisRepository;
  public readonly serverStatus: ServerStatusRepository;

  constructor() {
    this.users = new UserRepository();
    this.sessions = new SessionRepository();
    this.games = new GameRepository();
    this.tables = new TableRepository();
    this.aiAnalyses = new AIAnalysisRepository();
    this.serverStatus = new ServerStatusRepository();
  }

  async connect(): Promise<void> {
    await DatabaseClient.connect();
  }

  async disconnect(): Promise<void> {
    await DatabaseClient.disconnect();
  }

  async healthCheck(): Promise<boolean> {
    return DatabaseClient.healthCheck();
  }

  async runMaintenance(): Promise<{
    expiredSessionsCleanup: number;
    staleServersCleanup: number;
    oldAnalysesCleanup: number;
  }> {
    const [expiredSessionsCleanup, staleServersCleanup, oldAnalysesCleanup] =
      await Promise.all([
        this.sessions.cleanupExpiredSessions(),
        this.serverStatus.cleanupStaleServers(5), // 5 minutes
        this.aiAnalyses.deleteOldAnalyses(90), // 90 days
      ]);

    return {
      expiredSessionsCleanup,
      staleServersCleanup,
      oldAnalysesCleanup,
    };
  }

  async getSystemStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    totalGames: number;
    activeGames: number;
    totalTables: number;
    activeTables: number;
    systemOverview: Record<string, any>;
  }> {
    const [
      totalUsers,
      activeUsers,
      totalGames,
      activeGames,
      totalTables,
      activeTables,
      systemOverview,
    ] = await Promise.all([
      this.users.count(),
      this.users.count({
        sessions: {
          some: {
            isActive: true,
            expiresAt: { gt: new Date() },
          },
        },
      }),
      this.games.count(),
      this.games.count({
        status: { in: ['WAITING', 'STARTING', 'IN_PROGRESS'] },
      }),
      this.tables.count(),
      this.tables.count({
        status: { in: ['WAITING', 'ACTIVE'] },
      }),
      this.serverStatus.getSystemOverview(),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalGames,
      activeGames,
      totalTables,
      activeTables,
      systemOverview,
    };
  }
}

// Singleton instance
export const databaseService = new DatabaseService();
