// packages/shared/src/utils/index.ts
export { SnowflakeGenerator } from './snowflake';
export { ConsistentHashRing, type AffectedRange, type HashRingStatus } from './consistent-hash';
export { ValidationHelper, CardSchema, PlayerActionSchema, TableConfigSchema, PlayerSchema } from './validation';
export { CryptoHelper } from './crypto';

// packages/shared/src/constants/game.constants.ts
export const GAME_CONSTANTS = {
    // Card values
    CARD_VALUES: {
        'A': 14, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
        '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13
    } as const,

    // Hand rankings
    HAND_RANKINGS: {
        'high-card': 1,
        'pair': 2,
        'two-pair': 3,
        'three-of-a-kind': 4,
        'straight': 5,
        'flush': 6,
        'full-house': 7,
        'four-of-a-kind': 8,
        'straight-flush': 9,
        'royal-flush': 10
    } as const,

    // Game phases
    PHASES: {
        PREFLOP: 'preflop',
        FLOP: 'flop',
        TURN: 'turn',
        RIVER: 'river',
        SHOWDOWN: 'showdown',
        FINISHED: 'finished'
    } as const,

    // Player statuses
    PLAYER_STATUS: {
        ACTIVE: 'active',
        FOLDED: 'folded',
        ALL_IN: 'all-in',
        SITTING_OUT: 'sitting-out',
        DISCONNECTED: 'disconnected'
    } as const,

    // Action types
    ACTIONS: {
        FOLD: 'fold',
        CHECK: 'check',
        CALL: 'call',
        BET: 'bet',
        RAISE: 'raise',
        ALL_IN: 'all-in'
    } as const,

    // Table limits
    TABLE_LIMITS: {
        MIN_PLAYERS: 2,
        MAX_PLAYERS: 9,
        MIN_BLINDS: 1,
        MAX_BLINDS: 10000,
        MIN_BUY_IN: 20,
        MAX_BUY_IN: 1000000,
        MIN_ACTION_TIME: 10,
        MAX_ACTION_TIME: 300,
        DEFAULT_ACTION_TIME: 30
    } as const,

    // Server limits
    SERVER_LIMITS: {
        MAX_TABLES_PER_SERVER: 50,
        MAX_PLAYERS_PER_SERVER: 450,
        HEARTBEAT_INTERVAL: 5000,
        CONNECTION_TIMEOUT: 30000,
        RECONNECTION_TIMEOUT: 300000
    } as const,

    // Experience and levels
    EXPERIENCE: {
        LEVEL_MULTIPLIER: 100,
        WIN_BONUS: 50,
        PARTICIPATION_BONUS: 10
    } as const
} as const;