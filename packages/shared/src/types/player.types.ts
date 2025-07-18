// packages/shared/src/types/player.types.ts
export interface Player {
    id: string;
    username: string;
    email: string;
    chips: number;
    avatar?: string;
    level: number;
    experience: number;
    rank: string;
    stats: PlayerStats;
    settings: PlayerSettings;
    createdAt: Date;
    lastLogin?: Date;
}

export interface PlayerStats {
    gamesPlayed: number;
    gamesWon: number;
    handsPlayed: number;
    handsWon: number;
    totalWinnings: number;
    totalLosses: number;
    netProfit: number;
    biggestWin: number;
    biggestLoss: number;

    // Advanced stats
    vpip: number; // Voluntarily Put In Pot %
    pfr: number; // Pre-flop Raise %
    aggression: number; // Aggression factor
    wtsd: number; // Went To Showdown %
    wmsd: number; // Won Money at Showdown %
}

export interface PlayerSettings {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    autoMuckEnabled: boolean;
    aiAssistEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: string;
}

export interface PlayerSession {
    id: string;
    playerId: string;
    sessionId: string;
    deviceInfo?: {
        userAgent: string;
        platform: string;
        isMobile: boolean;
    };
    ipAddress: string;
    isActive: boolean;
    expiresAt: Date;
    createdAt: Date;
    lastUsedAt: Date;
}
