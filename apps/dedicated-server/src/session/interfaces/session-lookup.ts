import { PokerSession } from '@poker-game/shared';

export interface ISessionLookup {
    getSession(sessionId: string): PokerSession | null;
} 