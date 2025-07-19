// packages/shared/src/constants/server.constants.ts

// Server types
export const SERVER_TYPES = {
  MASTER: 'master',
  DEDICATED: 'dedicated',
  AI: 'ai',
} as const;

// Server status
export const SERVER_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  MAINTENANCE: 'maintenance',
  OVERLOADED: 'overloaded',
} as const;

// Network constants
export const NETWORK_CONSTANTS = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  CONNECTION_TIMEOUT: 60000, // 60 seconds
  RECONNECTION_ATTEMPTS: 3,
  RECONNECTION_DELAY: 5000, // 5 seconds
  MAX_PACKET_SIZE: 1024 * 1024, // 1MB
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 60000, // 1 minute
} as const;

// Server capacity limits
export const SERVER_LIMITS = {
  MAX_TABLES_PER_SERVER: 50,
  MAX_PLAYERS_PER_TABLE: 10,
  MAX_CONCURRENT_GAMES: 100,
  MAX_WEBSOCKET_CONNECTIONS: 1000,
  MEMORY_WARNING_THRESHOLD: 80, // percentage
  CPU_WARNING_THRESHOLD: 80, // percentage
  DISK_WARNING_THRESHOLD: 90, // percentage
} as const;

// Load balancing
export const LOAD_BALANCING = {
  HEALTH_CHECK_INTERVAL: 15000, // 15 seconds
  SERVER_SELECTION_ALGORITHM: 'least-connections',
  FAILOVER_TIMEOUT: 5000, // 5 seconds
  MIN_HEALTHY_SERVERS: 1,
} as const;

// Error retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY: 1000, // 1 second
  MAX_DELAY: 30000, // 30 seconds
  BACKOFF_MULTIPLIER: 2,
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 300, // 5 minutes
  USER_SESSION_TTL: 3600, // 1 hour
  GAME_STATE_TTL: 60, // 1 minute
  TABLE_INFO_TTL: 30, // 30 seconds
  METRICS_TTL: 300, // 5 minutes
} as const;

// Database configuration
export const DATABASE_CONFIG = {
  CONNECTION_POOL_MIN: 5,
  CONNECTION_POOL_MAX: 20,
  CONNECTION_TIMEOUT: 30000, // 30 seconds
  QUERY_TIMEOUT: 15000, // 15 seconds
  TRANSACTION_TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
} as const;

// Security constants
export const SECURITY_CONFIG = {
  JWT_EXPIRES_IN: '1h',
  REFRESH_TOKEN_EXPIRES_IN: '7d',
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 900000, // 15 minutes
  SESSION_TIMEOUT: 3600000, // 1 hour
} as const;

// API rate limiting
export const API_RATE_LIMITS = {
  GLOBAL: {
    REQUESTS_PER_MINUTE: 1000,
    REQUESTS_PER_HOUR: 10000,
  },
  USER: {
    REQUESTS_PER_MINUTE: 60,
    REQUESTS_PER_HOUR: 1000,
  },
  AUTHENTICATION: {
    REQUESTS_PER_MINUTE: 5,
    REQUESTS_PER_HOUR: 100,
  },
  GAME_ACTIONS: {
    REQUESTS_PER_MINUTE: 300,
    REQUESTS_PER_HOUR: 5000,
  },
} as const;

// Monitoring thresholds
export const MONITORING_THRESHOLDS = {
  RESPONSE_TIME_WARNING: 1000, // 1 second
  RESPONSE_TIME_CRITICAL: 5000, // 5 seconds
  ERROR_RATE_WARNING: 5, // 5%
  ERROR_RATE_CRITICAL: 10, // 10%
  MEMORY_USAGE_WARNING: 70, // 70%
  MEMORY_USAGE_CRITICAL: 90, // 90%
  CPU_USAGE_WARNING: 70, // 70%
  CPU_USAGE_CRITICAL: 90, // 90%
} as const;
