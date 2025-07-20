// apps/master-server/src/schemas/server.schemas.ts
import { z } from 'zod';

export const serverRegistrationSchema = z.object({
    id: z.string().min(1),
    type: z.enum(['master', 'dedicated', 'ai']),
    host: z.string().min(1),
    port: z.number().min(1).max(65535),
    region: z.string().optional(),
    metrics: z.object({
        currentTables: z.number().min(0).optional(),
        currentPlayers: z.number().min(0).optional(),
        maxTables: z.number().min(0).optional(),
        maxPlayers: z.number().min(0).optional(),
        cpuUsage: z.number().min(0).max(100).optional(),
        memoryUsage: z.number().min(0).max(100).optional(),
        networkLatency: z.number().min(0).optional()
    }).optional()
});

export const serverMetricsSchema = z.object({
    currentTables: z.number().min(0),
    currentPlayers: z.number().min(0),
    cpuUsage: z.number().min(0).max(100),
    memoryUsage: z.number().min(0).max(100),
    networkLatency: z.number().min(0).optional()
});

export const tableCreationSchema = z.object({
    name: z.string().min(1).max(50),
    type: z.enum(['cash', 'tournament', 'sit-n-go']),
    gameType: z.enum(['texas-holdem', 'omaha', 'seven-card-stud']).default('texas-holdem'),
    maxPlayers: z.number().min(2).max(10).default(9),
    minBuyIn: z.number().min(0),
    maxBuyIn: z.number().min(0),
    smallBlind: z.number().min(1),
    bigBlind: z.number().min(1),
    timeBank: z.number().min(10).max(300).default(30),
    isPrivate: z.boolean().default(false),
    isHighStakes: z.boolean().default(false),
    isFastPaced: z.boolean().default(false),
    password: z.string().optional(),
    region: z.string().optional(),
    autoStart: z.boolean().default(false),
    startingChips: z.number().min(100).default(1000),
    tournamentConfig: z.object({
        buyIn: z.number().min(0).optional(),
        prizePool: z.number().min(0).optional(),
        blindStructure: z.array(z.object({
            level: z.number(),
            smallBlind: z.number(),
            bigBlind: z.number(),
            duration: z.number()
        })).optional(),
        payoutStructure: z.array(z.object({
            position: z.number(),
            percentage: z.number().min(0).max(100)
        })).optional()
    }).optional()
});

export const tableJoinSchema = z.object({
    position: z.number().min(0).max(9).optional(),
    buyIn: z.number().min(0).optional(),
    password: z.string().optional()
});

export const tableUpdateSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    maxPlayers: z.number().min(2).max(10).optional(),
    isPrivate: z.boolean().optional(),
    password: z.string().optional()
});
