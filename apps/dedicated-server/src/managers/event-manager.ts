
// apps/dedicated-server/src/managers/event-manager.ts
import { EventEmitter } from 'events';
import { GameEvent } from '@poker-game/shared/src/types';
import { logger } from '@poker-game/logger';

export class EventManager extends EventEmitter {
    private eventHistory: Map<string, GameEvent[]> = new Map();

    constructor() {
        super();
        this.setMaxListeners(100); // Increase listener limit
    }

    emitGameEvent(tableId: string, event: GameEvent): void {
        // Store event in history
        if (!this.eventHistory.has(tableId)) {
            this.eventHistory.set(tableId, []);
        }
        this.eventHistory.get(tableId)!.push(event);

        // Emit event
        this.emit('gameEvent', tableId, event);
        this.emit(`gameEvent:${tableId}`, event);
        this.emit(`gameEvent:${event.type}`, tableId, event);

        logger.debug(`Game event emitted: ${event.type} for table ${tableId}`);
    }

    getEventHistory(tableId: string): GameEvent[] {
        return this.eventHistory.get(tableId) || [];
    }

    clearEventHistory(tableId: string): void {
        this.eventHistory.delete(tableId);
    }

    onGameEvent(tableId: string, callback: (event: GameEvent) => void): void {
        this.on(`gameEvent:${tableId}`, callback);
    }

    onGameEventType(eventType: string, callback: (tableId: string, event: GameEvent) => void): void {
        this.on(`gameEvent:${eventType}`, callback);
    }

    removeGameEventListeners(tableId: string): void {
        this.removeAllListeners(`gameEvent:${tableId}`);
    }
}