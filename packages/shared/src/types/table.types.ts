import { PlayerState, TableConfig } from "packages/shared/src/types/game.types";

// packages/shared/src/types/table.types.ts
export interface Table {
    id: string; // Snowflake ID
    serverId: string;
    name?: string;
    config: TableConfig;
    status: 'waiting' | 'active' | 'paused' | 'closed';
    players: Map<string, PlayerState>;
    currentGame?: string; // Game ID
    gamesPlayed: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface TableInfo {
    id: string;
    name?: string;
    playerCount: number;
    maxPlayers: number;
    blinds: {
        small: number;
        big: number;
    };
    averagePot: number;
    handsPerHour: number;
    waitingList: number;
    isPrivate: boolean;
}