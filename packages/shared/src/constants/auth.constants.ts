// packages/shared/src/constants/auth.constants.ts

// Authentication error codes
export const AUTH_ERROR_CODES = {
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  EMAIL_NOT_VERIFIED: 'EMAIL_NOT_VERIFIED',
  ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  PASSWORD_EXPIRED: 'PASSWORD_EXPIRED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  RATE_LIMITED: 'RATE_LIMITED',
  SERVER_ERROR: 'SERVER_ERROR',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  WEAK_PASSWORD: 'WEAK_PASSWORD',
  INVALID_EMAIL: 'INVALID_EMAIL',
  INVALID_USERNAME: 'INVALID_USERNAME',
  TERMS_NOT_ACCEPTED: 'TERMS_NOT_ACCEPTED',
} as const;

// User roles and permissions
export const USER_ROLES = {
  PLAYER: 'player',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  DEALER: 'dealer',
  OBSERVER: 'observer',
} as const;

export const USER_PERMISSIONS = {
  // Game permissions
  JOIN_GAME: 'join_game',
  CREATE_TABLE: 'create_table',
  SPECTATE: 'spectate',

  // Chat permissions
  SEND_MESSAGE: 'send_message',
  SEND_EMOTE: 'send_emote',
  MODERATE_CHAT: 'moderate_chat',

  // User management
  VIEW_USER_PROFILES: 'view_user_profiles',
  EDIT_USER_PROFILES: 'edit_user_profiles',
  BAN_USERS: 'ban_users',
  SUSPEND_USERS: 'suspend_users',

  // System permissions
  VIEW_ANALYTICS: 'view_analytics',
  MANAGE_SERVERS: 'manage_servers',
  MANAGE_TOURNAMENTS: 'manage_tournaments',
  SYSTEM_MAINTENANCE: 'system_maintenance',
} as const;

// Password requirements
export const PASSWORD_REQUIREMENTS = {
  MIN_LENGTH: 8,
  MAX_LENGTH: 128,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: true,
  FORBIDDEN_PATTERNS: ['password', '123456', 'qwerty', 'admin', 'user'],
} as const;

// Username requirements
export const USERNAME_REQUIREMENTS = {
  MIN_LENGTH: 3,
  MAX_LENGTH: 20,
  ALLOWED_CHARS: /^[a-zA-Z0-9_-]+$/,
  FORBIDDEN_WORDS: [
    'admin',
    'moderator',
    'system',
    'dealer',
    'bot',
    'null',
    'undefined',
  ],
} as const;

// Session configuration
export const SESSION_CONFIG = {
  DEFAULT_DURATION: 3600000, // 1 hour
  EXTENDED_DURATION: 86400000, // 24 hours (remember me)
  MAX_SESSIONS_PER_USER: 5,
  CLEANUP_INTERVAL: 300000, // 5 minutes
  HEARTBEAT_INTERVAL: 60000, // 1 minute
} as const;

// Two-factor authentication
export const TWO_FACTOR_CONFIG = {
  TOTP_WINDOW: 30, // seconds
  BACKUP_CODES_COUNT: 10,
  QR_CODE_SIZE: 200,
  SECRET_LENGTH: 32,
  ISSUER: 'PokerDorito',
} as const;

// Rate limiting for authentication
export const AUTH_RATE_LIMITS = {
  LOGIN_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    WINDOW: 900000, // 15 minutes
    LOCKOUT_DURATION: 900000, // 15 minutes
  },
  REGISTRATION_ATTEMPTS: {
    MAX_ATTEMPTS: 3,
    WINDOW: 3600000, // 1 hour
  },
  PASSWORD_RESET_ATTEMPTS: {
    MAX_ATTEMPTS: 3,
    WINDOW: 3600000, // 1 hour
  },
  EMAIL_VERIFICATION_ATTEMPTS: {
    MAX_ATTEMPTS: 5,
    WINDOW: 3600000, // 1 hour
  },
} as const;

// Token configuration
export const TOKEN_CONFIG = {
  ACCESS_TOKEN: {
    EXPIRES_IN: '1h',
    ALGORITHM: 'HS256',
  },
  REFRESH_TOKEN: {
    EXPIRES_IN: '7d',
    ALGORITHM: 'HS256',
  },
  EMAIL_VERIFICATION_TOKEN: {
    EXPIRES_IN: '24h',
    LENGTH: 32,
  },
  PASSWORD_RESET_TOKEN: {
    EXPIRES_IN: '1h',
    LENGTH: 32,
  },
} as const;

// Account status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  BANNED: 'banned',
  DELETED: 'deleted',
  PENDING_VERIFICATION: 'pending_verification',
} as const;

// Email templates
export const EMAIL_TEMPLATES = {
  WELCOME: 'welcome',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  ACCOUNT_SUSPENDED: 'account_suspended',
  SECURITY_ALERT: 'security_alert',
  TOURNAMENT_INVITATION: 'tournament_invitation',
} as const;

// Device tracking
export const DEVICE_TYPES = {
  DESKTOP: 'desktop',
  MOBILE: 'mobile',
  TABLET: 'tablet',
  UNKNOWN: 'unknown',
} as const;

// Security events
export const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  PASSWORD_CHANGED: 'password_changed',
  EMAIL_CHANGED: 'email_changed',
  TWO_FACTOR_ENABLED: 'two_factor_enabled',
  TWO_FACTOR_DISABLED: 'two_factor_disabled',
  ACCOUNT_LOCKED: 'account_locked',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
} as const;
