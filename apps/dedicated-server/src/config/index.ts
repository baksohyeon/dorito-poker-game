
// apps/dedicated-server/src/config/index.ts
import { DedicatedServerConfig } from '@poker-game/shared/src/types';

export const config: DedicatedServerConfig = {
    serverId: process.env.SERVER_ID || 'dedicated-server-1',
    machineId: parseInt(process.env.MACHINE_ID || '1'),
    maxTables: parseInt(process.env.MAX_TABLES || '20'),
    maxPlayersPerTable: parseInt(process.env.MAX_PLAYERS_PER_TABLE || '9'),
    masterServerUrl: process.env.MASTER_SERVER_URL || 'http://localhost:3001',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    port: parseInt(process.env.DEDICATED_SERVER_PORT || '3002'),
    host: process.env.HOST || 'localhost',
    region: process.env.REGION || 'us-east-1'
};

// Security configuration
export const securityConfig = {
    maxConnectionsPerIP: parseInt(process.env.MAX_CONNECTIONS_PER_IP || '10'),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '60000'),
    maxActionsPerWindow: parseInt(process.env.MAX_ACTIONS_PER_WINDOW || '100'),
    enableDDoSProtection: process.env.ENABLE_DDOS_PROTECTION === 'true',
    jwtSecret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '1800000'), // 30 minutes
    enableRequestLogging: process.env.ENABLE_REQUEST_LOGGING === 'true'
};

// Performance configuration
export const performanceConfig = {
    enableCompression: process.env.ENABLE_COMPRESSION !== 'false',
    maxPayloadSize: parseInt(process.env.MAX_PAYLOAD_SIZE || '1048576'), // 1MB
    connectionTimeout: parseInt(process.env.CONNECTION_TIMEOUT || '60000'),
    pingInterval: parseInt(process.env.PING_INTERVAL || '25000'),
    pingTimeout: parseInt(process.env.PING_TIMEOUT || '60000')
};