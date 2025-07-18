// Temporary placeholder for Prisma generated types
// This file should be replaced by actual Prisma generated types after running 'prisma generate'

export interface User {
  id: string;
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  chips: number;
  level: number;
  rank: string;
  totalWinnings: number;
  totalLosses: number;
  gamesPlayed: number;
  gamesWon: number;
  experience: number;
  avatar?: string;
  soundEnabled: boolean;
  animationsEnabled: boolean;
  autoMuckEnabled: boolean;
  aiAssistEnabled: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
  sessions?: UserSession[];
  gameParticipations?: GameParticipation[];
}

export interface UserSession {
  id: string;
  userId: string;
  sessionToken: string;
  isActive: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface Table {
  id: string;
  serverId: string;
  name?: string;
  gameType: 'TEXAS_HOLDEM' | 'OMAHA' | 'OMAHA_HI_LO' | 'SEVEN_CARD_STUD';
  maxPlayers: number;
  minPlayers: number;
  smallBlind: number;
  bigBlind: number;
  buyInMin: number;
  buyInMax: number;
  isPrivate: boolean;
  password?: string;
  timeLimit: number;
  status: 'WAITING' | 'ACTIVE' | 'PAUSED' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
  games?: Game[];
}

export interface Game {
  id: string;
  tableId: string;
  gameNumber: number;
  status: 'WAITING' | 'STARTING' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED';
  currentRound: number;
  currentPhase: 'PREFLOP' | 'FLOP' | 'TURN' | 'RIVER' | 'SHOWDOWN' | 'FINISHED';
  pot: number;
  sidePots: any;
  communityCards: any;
  currentPlayerId?: string;
  dealerPosition: number;
  smallBlindPos: number;
  bigBlindPos: number;
  actionStartTime?: Date;
  winnerId?: string;
  winningHand?: any;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  table?: Table;
  participants?: GameParticipation[];
  events?: GameEvent[];
}

export interface GameParticipation {
  id: string;
  userId: string;
  gameId: string;
  position: number;
  chips: number;
  bet: number;
  status: 'ACTIVE' | 'FOLDED' | 'ALL_IN' | 'DISCONNECTED';
  cards: any;
  joinedAt: Date;
  leftAt?: Date;
  finalPosition?: number;
  winnings?: number;
  user?: User;
  game?: Game;
}

export interface GameEvent {
  id: string;
  gameId: string;
  version: number;
  type: string;
  data: any;
  timestamp: Date;
  game?: Game;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  gameId: string;
  round: number;
  analysis: any;
  confidence: number;
  recommendation: string;
  winProbability: number;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  game?: Game;
}

export interface ServerStatus {
  id: string;
  serverId: string;
  serverType: 'MASTER' | 'DEDICATED' | 'AI';
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE';
  host: string;
  port: number;
  currentTables: number;
  maxTables: number;
  currentPlayers: number;
  maxPlayers: number;
  cpuUsage: number;
  memoryUsage: number;
  lastHeartbeat: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Friendship {
  id: string;
  fromUserId: string;
  toUserId: string;
  status: 'PENDING' | 'ACCEPTED' | 'BLOCKED';
  createdAt: Date;
  updatedAt: Date;
  fromUser?: User;
  toUser?: User;
}

// Prisma namespace types
export namespace Prisma {
  export interface UserWhereInput {
    id?: string;
    email?: string | { contains?: string; mode?: 'insensitive' };
    username?: string | { contains?: string; mode?: 'insensitive' };
    level?: number;
    rank?: string;
    country?: string;
    sessions?: {
      some?: {
        isActive?: boolean;
        expiresAt?: { gt?: Date };
      };
      none?: {
        isActive?: boolean;
        expiresAt?: { gt?: Date };
      };
    };
    OR?: UserWhereInput[];
    AND?: UserWhereInput[];
    totalWinnings?: { gt?: number };
  }

  export interface TableWhereInput {
    id?: string;
    serverId?: string;
    gameType?: string;
    status?: string;
    isPrivate?: boolean;
    maxPlayers?: { lte?: number };
    bigBlind?: { gte?: number; lte?: number };
    buyInMax?: { lte?: number };
    buyInMin?: { gte?: number };
    AND?: TableWhereInput[];
  }

  export interface GameWhereInput {
    id?: string;
    tableId?: string;
    status?: string | { in?: string[] };
    createdAt?: { gte?: Date; lte?: Date };
    participants?: {
      some?: {
        userId?: string;
      };
    };
  }

  export interface ServerStatusWhereInput {
    id?: string;
    serverId?: string;
    serverType?: string;
    status?: string;
    lastHeartbeat?: { lt?: Date; gte?: Date };
  }

  export interface AIAnalysisWhereInput {
    id?: string;
    userId?: string;
    gameId?: string;
    recommendation?: string;
    confidence?: { gte?: number; lte?: number };
    createdAt?: { lt?: Date; gte?: Date; lte?: Date };
  }

  export interface UserSessionWhereInput {
    id?: string;
    userId?: string;
    isActive?: boolean;
    expiresAt?: { lt?: Date };
  }
}

// Prisma Client placeholder
export class PrismaClient {
  user = {
    findMany: async (args?: any) => [] as User[],
    findUnique: async (args?: any) => null as User | null,
    findFirst: async (args?: any) => null as User | null,
    create: async (args?: any) => ({}) as User,
    update: async (args?: any) => ({}) as User,
    delete: async (args?: any) => ({}) as User,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  table = {
    findMany: async (args?: any) => [] as Table[],
    findUnique: async (args?: any) => null as Table | null,
    findFirst: async (args?: any) => null as Table | null,
    create: async (args?: any) => ({}) as Table,
    update: async (args?: any) => ({}) as Table,
    delete: async (args?: any) => ({}) as Table,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  game = {
    findMany: async (args?: any) => [] as Game[],
    findUnique: async (args?: any) => null as Game | null,
    findFirst: async (args?: any) => null as Game | null,
    create: async (args?: any) => ({}) as Game,
    update: async (args?: any) => ({}) as Game,
    delete: async (args?: any) => ({}) as Game,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  gameParticipation = {
    findMany: async (args?: any) => [] as GameParticipation[],
    findUnique: async (args?: any) => null as GameParticipation | null,
    findFirst: async (args?: any) => null as GameParticipation | null,
    create: async (args?: any) => ({}) as GameParticipation,
    update: async (args?: any) => ({}) as GameParticipation,
    delete: async (args?: any) => ({}) as GameParticipation,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  gameEvent = {
    findMany: async (args?: any) => [] as GameEvent[],
    findUnique: async (args?: any) => null as GameEvent | null,
    findFirst: async (args?: any) => null as GameEvent | null,
    create: async (args?: any) => ({}) as GameEvent,
    update: async (args?: any) => ({}) as GameEvent,
    delete: async (args?: any) => ({}) as GameEvent,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  aIAnalysis = {
    findMany: async (args?: any) => [] as AIAnalysis[],
    findUnique: async (args?: any) => null as AIAnalysis | null,
    findFirst: async (args?: any) => null as AIAnalysis | null,
    create: async (args?: any) => ({}) as AIAnalysis,
    update: async (args?: any) => ({}) as AIAnalysis,
    delete: async (args?: any) => ({}) as AIAnalysis,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  serverStatus = {
    findMany: async (args?: any) => [] as ServerStatus[],
    findUnique: async (args?: any) => null as ServerStatus | null,
    findFirst: async (args?: any) => null as ServerStatus | null,
    create: async (args?: any) => ({}) as ServerStatus,
    update: async (args?: any) => ({}) as ServerStatus,
    delete: async (args?: any) => ({}) as ServerStatus,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
    updateMany: async (args?: any) => ({ count: 0 }),
    fields: {
      maxTables: {},
      maxPlayers: {},
    },
  };

  userSession = {
    findMany: async (args?: any) => [] as UserSession[],
    findUnique: async (args?: any) => null as UserSession | null,
    findFirst: async (args?: any) => null as UserSession | null,
    create: async (args?: any) => ({}) as UserSession,
    update: async (args?: any) => ({}) as UserSession,
    delete: async (args?: any) => ({}) as UserSession,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
    updateMany: async (args?: any) => ({ count: 0 }),
  };

  friendship = {
    findMany: async (args?: any) => [] as Friendship[],
    findUnique: async (args?: any) => null as Friendship | null,
    findFirst: async (args?: any) => null as Friendship | null,
    create: async (args?: any) => ({}) as Friendship,
    update: async (args?: any) => ({}) as Friendship,
    delete: async (args?: any) => ({}) as Friendship,
    count: async (args?: any) => 0,
    deleteMany: async (args?: any) => ({ count: 0 }),
  };

  $connect = async () => {};
  $disconnect = async () => {};
  $queryRaw = async (query: any) => [];
  $on = (event: string, callback: (e: any) => void) => {};
}
