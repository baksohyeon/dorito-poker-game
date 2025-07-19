// packages/shared/src/constants/game.constants.ts

// Card constants
export const SUITS = ['hearts', 'diamonds', 'clubs', 'spades'] as const;
export const RANKS = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const;

// Card values for game logic
export const CARD_VALUES: Record<string, number> = {
  'A': 14,
  'K': 13,
  'Q': 12,
  'J': 11,
  '10': 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
} as const;

// Hand ranking constants
export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
} as const;

// Game phase constants
export const GAME_PHASES = {
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown',
  FINISHED: 'finished',
} as const;

// Player action constants
export const PLAYER_ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  ALL_IN: 'all-in',
} as const;

// Player status constants
export const PLAYER_STATUS = {
  ACTIVE: 'active',
  FOLDED: 'folded',
  ALL_IN: 'all-in',
  SITTING_OUT: 'sitting-out',
  DISCONNECTED: 'disconnected',
} as const;

// Table status constants
export const TABLE_STATUS = {
  WAITING: 'waiting',
  ACTIVE: 'active',
  PAUSED: 'paused',
  CLOSED: 'closed',
} as const;

// Game type constants
export const GAME_TYPES = {
  TEXAS_HOLDEM: 'texas-holdem',
  OMAHA: 'omaha',
  SEVEN_CARD_STUD: 'seven-card-stud',
} as const;

// Betting limits
export const BETTING_LIMITS = {
  NO_LIMIT: 'no-limit',
  POT_LIMIT: 'pot-limit',
  FIXED_LIMIT: 'fixed-limit',
} as const;

// Default game settings
export const DEFAULT_GAME_SETTINGS = {
  MAX_PLAYERS: 9,
  MIN_PLAYERS: 2,
  ACTION_TIME_LIMIT: 30, // seconds
  SMALL_BLIND_RATIO: 0.5,
  DEFAULT_STARTING_CHIPS: 1000,
  MIN_BUY_IN_BB: 20, // big blinds
  MAX_BUY_IN_BB: 100, // big blinds
} as const;

// Tournament constants
export const TOURNAMENT_STATUS = {
  REGISTERING: 'registering',
  STARTING: 'starting',
  IN_PROGRESS: 'in-progress',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
} as const;

export const TOURNAMENT_TYPES = {
  SIT_N_GO: 'sit-n-go',
  SCHEDULED: 'scheduled',
  FREEROLL: 'freeroll',
  SATELLITE: 'satellite',
} as const;

// Blind structure constants
export const STANDARD_BLIND_LEVELS = [
  { level: 1, smallBlind: 10, bigBlind: 20, duration: 10 },
  { level: 2, smallBlind: 15, bigBlind: 30, duration: 10 },
  { level: 3, smallBlind: 25, bigBlind: 50, duration: 10 },
  { level: 4, smallBlind: 50, bigBlind: 100, duration: 10 },
  { level: 5, smallBlind: 75, bigBlind: 150, duration: 10 },
  { level: 6, smallBlind: 100, bigBlind: 200, duration: 10 },
  { level: 7, smallBlind: 150, bigBlind: 300, duration: 10 },
  { level: 8, smallBlind: 200, bigBlind: 400, duration: 10 },
  { level: 9, smallBlind: 300, bigBlind: 600, duration: 10 },
  { level: 10, smallBlind: 400, bigBlind: 800, duration: 10 },
] as const;

// Chat constants
export const CHAT_MESSAGE_TYPES = {
  TEXT: 'text',
  EMOTE: 'emote',
  SYSTEM: 'system',
  ACTION: 'action',
  DEALER: 'dealer',
} as const;

export const CHAT_LIMITS = {
  MAX_MESSAGE_LENGTH: 500,
  MAX_MESSAGES_PER_MINUTE: 10,
  SLOW_MODE_MIN_INTERVAL: 3, // seconds
} as const;

// Combined game constants object
export const GAME_CONSTANTS = {
  SUITS,
  RANKS,
  CARD_VALUES,
  HAND_RANKINGS,
  GAME_PHASES,
  PLAYER_ACTIONS,
  PLAYER_STATUS,
  TABLE_STATUS,
  GAME_TYPES,
  BETTING_LIMITS,
  DEFAULT_GAME_SETTINGS,
  TOURNAMENT_STATUS,
  TOURNAMENT_TYPES,
  STANDARD_BLIND_LEVELS,
  CHAT_MESSAGE_TYPES,
  CHAT_LIMITS,
} as const;
