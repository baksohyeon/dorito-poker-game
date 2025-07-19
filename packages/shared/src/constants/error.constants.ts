export const ERROR_CODES = {
  // Authentication errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_INSUFFICIENT_PERMISSIONS: 'AUTH_INSUFFICIENT_PERMISSIONS',

  // Player errors
  PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
  PLAYER_ALREADY_EXISTS: 'PLAYER_ALREADY_EXISTS',
  PLAYER_INSUFFICIENT_CHIPS: 'PLAYER_INSUFFICIENT_CHIPS',
  PLAYER_NOT_AT_TABLE: 'PLAYER_NOT_AT_TABLE',
  PLAYER_ALREADY_AT_TABLE: 'PLAYER_ALREADY_AT_TABLE',

  // Table errors
  TABLE_NOT_FOUND: 'TABLE_NOT_FOUND',
  TABLE_FULL: 'TABLE_FULL',
  TABLE_PRIVATE_PASSWORD_REQUIRED: 'TABLE_PRIVATE_PASSWORD_REQUIRED',
  TABLE_PRIVATE_INVALID_PASSWORD: 'TABLE_PRIVATE_INVALID_PASSWORD',
  TABLE_MINIMUM_PLAYERS_NOT_MET: 'TABLE_MINIMUM_PLAYERS_NOT_MET',

  // Game errors
  GAME_NOT_FOUND: 'GAME_NOT_FOUND',
  GAME_NOT_IN_PROGRESS: 'GAME_NOT_IN_PROGRESS',
  GAME_INVALID_ACTION: 'GAME_INVALID_ACTION',
  GAME_NOT_PLAYER_TURN: 'GAME_NOT_PLAYER_TURN',
  GAME_INVALID_BET_AMOUNT: 'GAME_INVALID_BET_AMOUNT',
  GAME_ACTION_TIMEOUT: 'GAME_ACTION_TIMEOUT',

  // Server errors
  SERVER_NOT_FOUND: 'SERVER_NOT_FOUND',
  SERVER_OVERLOADED: 'SERVER_OVERLOADED',
  SERVER_MAINTENANCE: 'SERVER_MAINTENANCE',
  SERVER_INTERNAL_ERROR: 'SERVER_INTERNAL_ERROR',

  // Connection errors
  CONNECTION_LOST: 'CONNECTION_LOST',
  CONNECTION_TIMEOUT: 'CONNECTION_TIMEOUT',
  CONNECTION_REJECTED: 'CONNECTION_REJECTED',
  RECONNECTION_FAILED: 'RECONNECTION_FAILED',

  // Validation errors
  VALIDATION_INVALID_INPUT: 'VALIDATION_INVALID_INPUT',
  VALIDATION_MISSING_REQUIRED_FIELD: 'VALIDATION_MISSING_REQUIRED_FIELD',
  VALIDATION_FIELD_TOO_LONG: 'VALIDATION_FIELD_TOO_LONG',
  VALIDATION_FIELD_TOO_SHORT: 'VALIDATION_FIELD_TOO_SHORT',

  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
} as const;

export const ERROR_MESSAGES: Record<keyof typeof ERROR_CODES, string> = {
  AUTH_INVALID_CREDENTIALS: 'Invalid email or password',
  AUTH_TOKEN_EXPIRED: 'Your session has expired. Please log in again.',
  AUTH_TOKEN_INVALID: 'Invalid authentication token',
  AUTH_INSUFFICIENT_PERMISSIONS:
    'You do not have permission to perform this action',

  PLAYER_NOT_FOUND: 'Player not found',
  PLAYER_ALREADY_EXISTS: 'A player with this email or username already exists',
  PLAYER_INSUFFICIENT_CHIPS: 'Insufficient chips to perform this action',
  PLAYER_NOT_AT_TABLE: 'Player is not seated at this table',
  PLAYER_ALREADY_AT_TABLE: 'Player is already seated at a table',

  TABLE_NOT_FOUND: 'Table not found',
  TABLE_FULL: 'Table is full',
  TABLE_PRIVATE_PASSWORD_REQUIRED:
    'This is a private table. Password required.',
  TABLE_PRIVATE_INVALID_PASSWORD: 'Invalid password for private table',
  TABLE_MINIMUM_PLAYERS_NOT_MET:
    'Minimum number of players not met to start game',

  GAME_NOT_FOUND: 'Game not found',
  GAME_NOT_IN_PROGRESS: 'Game is not currently in progress',
  GAME_INVALID_ACTION: 'Invalid action for current game state',
  GAME_NOT_PLAYER_TURN: 'It is not your turn to act',
  GAME_INVALID_BET_AMOUNT: 'Invalid bet amount',
  GAME_ACTION_TIMEOUT: 'Action timed out',

  SERVER_NOT_FOUND: 'Server not found',
  SERVER_OVERLOADED: 'Server is currently overloaded. Please try again later.',
  SERVER_MAINTENANCE: 'Server is under maintenance. Please try again later.',
  SERVER_INTERNAL_ERROR: 'Internal server error. Please try again.',

  CONNECTION_LOST: 'Connection to server lost',
  CONNECTION_TIMEOUT: 'Connection timed out',
  CONNECTION_REJECTED: 'Connection rejected by server',
  RECONNECTION_FAILED: 'Failed to reconnect to server',

  VALIDATION_INVALID_INPUT: 'Invalid input provided',
  VALIDATION_MISSING_REQUIRED_FIELD: 'Required field is missing',
  VALIDATION_FIELD_TOO_LONG: 'Field value is too long',
  VALIDATION_FIELD_TOO_SHORT: 'Field value is too short',

  RATE_LIMIT_EXCEEDED: 'Rate limit exceeded. Please slow down.',
  TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
};
