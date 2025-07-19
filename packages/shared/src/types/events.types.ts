import { GameState } from './game.types';

// packages/shared/src/types/events.types.ts
export interface GameEvent {
  id: string;
  type: GameEventType;
  gameId: string;
  playerId?: string;
  data: any;
  version: number;
  timestamp: number;
  phase?: string;
  round?: number;
}

export type GameEventType =
  | 'GAME_CREATED'
  | 'GAME_STARTED'
  | 'GAME_ENDED'
  | 'PLAYER_JOINED'
  | 'PLAYER_LEFT'
  | 'PLAYER_DISCONNECTED'
  | 'PLAYER_RECONNECTED'
  | 'CARDS_DEALT'
  | 'COMMUNITY_CARDS_DEALT'
  | 'BET_PLACED'
  | 'PLAYER_FOLDED'
  | 'PLAYER_CALLED'
  | 'PLAYER_RAISED'
  | 'PLAYER_ALL_IN'
  | 'PLAYER_CHECKED'
  | 'ROUND_STARTED'
  | 'ROUND_ENDED'
  | 'SHOWDOWN_STARTED'
  | 'WINNER_DETERMINED'
  | 'POT_AWARDED'
  | 'DEALER_MOVED'
  | 'BLINDS_POSTED';

export interface EventStore {
  append(event: Omit<GameEvent, 'id' | 'version' | 'timestamp'>): GameEvent;
  getEvents(fromVersion?: number): GameEvent[];
  getEventsByType(type: GameEventType): GameEvent[];
  replay(events: GameEvent[]): GameState;
}
