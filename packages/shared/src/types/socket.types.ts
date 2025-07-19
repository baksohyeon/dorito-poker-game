import { PlayerAction, GameState, PlayerState } from './game.types';
import { PlayerSettings } from './player.types';
import { Table } from './table.types';

// packages/shared/src/types/socket.types.ts
export interface SocketEvent {
  type: string;
  data: any;
  timestamp: number;
  playerId?: string;
  tableId?: string;
  gameId?: string;
}

export interface ClientToServerEvents {
  // Connection
  'player:join-table': (data: { tableId: string; position?: number }) => void;
  'player:leave-table': () => void;
  'player:reconnect': (data: { reconnectToken: string }) => void;

  // Game Actions
  'game:action': (data: { action: PlayerAction }) => void;
  'game:ready': () => void;

  // Chat
  'chat:message': (data: { message: string; type?: 'chat' | 'emote' }) => void;

  // Settings
  'player:update-settings': (data: Partial<PlayerSettings>) => void;

  // Heartbeat
  heartbeat: () => void;
  ping: () => void;
}

export interface ServerToClientEvents {
  // Game State
  'game:state-update': (data: { gameState: GameState }) => void;
  'game:state-sync': (data: { fullState: GameState }) => void;
  'game:action-required': (data: {
    timeLimit: number;
    validActions: string[];
  }) => void;
  'game:action-result': (data: {
    action: PlayerAction;
    success: boolean;
    error?: string;
  }) => void;

  // Table Events
  'table:player-joined': (data: { player: PlayerState }) => void;
  'table:player-left': (data: { playerId: string }) => void;
  'table:updated': (data: { table: Table }) => void;

  // Player Events
  'player:disconnected': (data: {
    playerId: string;
    timeoutRemaining: number;
  }) => void;
  'player:reconnected': (data: { playerId: string }) => void;
  'player:chips-updated': (data: { playerId: string; chips: number }) => void;

  // Chat
  'chat:message': (data: {
    playerId: string;
    message: string;
    timestamp: number;
  }) => void;
  'chat:system-message': (data: {
    message: string;
    type: 'info' | 'warning' | 'error';
  }) => void;

  // Notifications
  notification: (data: {
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
  }) => void;

  // Connection
  heartbeat_ack: () => void;
  heartbeat_request: () => void;
  pong: (data: { timestamp: number; serverId: string }) => void;

  // Errors
  error: (data: { code: string; message: string; details?: any }) => void;
}
