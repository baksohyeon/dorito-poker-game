// apps/master-server/src/schemas/matching.schemas.ts
import { z } from 'zod';

export const matchingCriteriaSchema = z.object({
    gameType: z.enum(['texas-holdem', 'omaha']).optional(),
    blindRange: z.object({
        min: z.number().min(1),
        max: z.number().min(1)
    }).optional(),
    maxPlayers: z.number().min(2).max(10).optional(),
    isPrivate: z.boolean().optional(),
    region: z.string().optional()
});
