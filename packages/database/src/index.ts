// packages/database/src/index.ts
export { DatabaseClient, prisma } from './client';
export { DatabaseService, databaseService } from './services/database.service';
export { MigrationService } from './migrations/migration.service';

// Repositories
export { UserRepository } from './repositories/user.repository';
export { SessionRepository } from './repositories/session.repository';
export { GameRepository } from './repositories/game.repository';
export { TableRepository } from './repositories/table.repository';
export { AIAnalysisRepository } from './repositories/ai-analysis.repository';
export { ServerStatusRepository } from './repositories/server-status.repository';

// Types
export * from './types/repository.types';
// export * from './generated'; // Prisma generated types - uncomment when Prisma is generated
