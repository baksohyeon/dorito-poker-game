// packages/shared/src/types/error.types.ts

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
  path?: string;
}

export interface ValidationError extends ApiError {
  code: 'VALIDATION_ERROR';
  field: string;
  value: any;
  constraints: string[];
}

export interface GameError extends ApiError {
  gameId?: string;
  tableId?: string;
  playerId?: string;
  phase?: string;
}

export interface ServerError extends ApiError {
  serverId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
}

export type ErrorCode =
  // Authentication errors
  | 'AUTH_REQUIRED'
  | 'AUTH_INVALID'
  | 'AUTH_EXPIRED'
  | 'PERMISSION_DENIED'

  // Game errors
  | 'GAME_NOT_FOUND'
  | 'GAME_FULL'
  | 'GAME_ALREADY_STARTED'
  | 'INVALID_ACTION'
  | 'ACTION_OUT_OF_TURN'
  | 'INSUFFICIENT_CHIPS'
  | 'PLAYER_NOT_IN_GAME'
  | 'GAME_PAUSED'

  // Table errors
  | 'TABLE_NOT_FOUND'
  | 'TABLE_FULL'
  | 'TABLE_PRIVATE'
  | 'INVALID_SEAT'
  | 'SEAT_OCCUPIED'

  // Server errors
  | 'SERVER_UNAVAILABLE'
  | 'SERVER_OVERLOADED'
  | 'MAINTENANCE_MODE'
  | 'RATE_LIMITED'

  // Validation errors
  | 'VALIDATION_FAILED'
  | 'INVALID_INPUT'
  | 'MISSING_REQUIRED_FIELD'

  // Network errors
  | 'CONNECTION_LOST'
  | 'TIMEOUT'
  | 'NETWORK_ERROR'

  // General errors
  | 'INTERNAL_ERROR'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'BAD_REQUEST';

export interface ErrorResponse {
  error: ApiError;
  success: false;
}

export interface SuccessResponse<T = any> {
  data: T;
  success: true;
  message?: string;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryableErrors: ErrorCode[];
}
