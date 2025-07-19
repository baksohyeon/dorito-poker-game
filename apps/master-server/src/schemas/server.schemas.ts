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
