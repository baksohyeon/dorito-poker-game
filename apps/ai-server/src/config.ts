// apps/ai-server/src/config.ts
export interface AIServerConfig {
    port: number;
    nodeEnv: string;
    redisUrl: string;
    workerCount: number;
    analysisEnabled: boolean;
}

export const config: AIServerConfig = {
    port: parseInt(process.env.AI_SERVER_PORT || '3003'),
    nodeEnv: process.env.NODE_ENV || 'development',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    workerCount: parseInt(process.env.AI_WORKER_COUNT || '4'),
    analysisEnabled: process.env.AI_ANALYSIS_ENABLED === 'true' || true,
};