
// apps/master-server/src/config/index.ts
export interface MasterServerConfig {
    port: number;
    nodeEnv: string;
    corsOrigins: string[];
    jwtSecret: string;
    jwtExpiresIn: string;
    redisUrl: string;
    bcryptSaltRounds: number;
    rateLimit: {
        windowMs: number;
        maxRequests: number;
    };
}

export const config: MasterServerConfig = {
    port: parseInt(process.env.MASTER_SERVER_PORT || '3001'),
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000'],
    jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12'),
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100')
    }
};