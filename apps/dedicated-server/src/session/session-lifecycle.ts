import {
    PokerSession,
    SessionPlayer,
    SessionStatus,
    HandStatus
} from '@poker-game/shared';
import { ISessionLifecycle } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class SessionLifecycleManager implements ISessionLifecycle {
    private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map();
    private autoStartTimers: Map<string, NodeJS.Timeout> = new Map();
    private cleanupInterval: NodeJS.Timeout;

    constructor() {
        // Start cleanup process every 5 minutes
        this.cleanupInterval = setInterval(() => {
            this.cleanupInactiveSessions();
        }, 5 * 60 * 1000);
    }

    canStartSession(session: PokerSession): boolean {
        if (!session || !session.id) {
            logger.error('Invalid session provided to canStartSession');
            return false;
        }

        // Check if session is in valid state to start
        if (session.status !== 'waiting') {
            logger.debug(`Session ${session.id} cannot start: status is ${session.status}`);
            return false;
        }

        // Check minimum player requirement
        const activePlayers = this.getActivePlayers(session);
        if (activePlayers.length < session.config.minPlayers) {
            logger.debug(`Session ${session.id} cannot start: insufficient players (${activePlayers.length}/${session.config.minPlayers})`);
            return false;
        }

        // Check if all active players have sufficient stacks
        const playersWithSufficientStack = activePlayers.filter(p =>
            p.currentStack >= session.config.blindStructure.big
        );
        if (playersWithSufficientStack.length < session.config.minPlayers) {
            logger.debug(`Session ${session.id} cannot start: insufficient player stacks`);
            return false;
        }

        // Check if there's an active hand
        if (session.currentHand && session.currentHand.status !== 'complete') {
            logger.debug(`Session ${session.id} cannot start: hand in progress`);
            return false;
        }

        return true;
    }

    shouldAutoStartHand(session: PokerSession): boolean {
        if (!session || !session.id) {
            logger.error('Invalid session provided to shouldAutoStartHand');
            return false;
        }

        if (!session.autoStart) {
            return false;
        }

        // Don't auto-start if session is paused or not active
        if (session.status !== 'active') {
            return false;
        }

        // Don't auto-start if there's already a hand in progress
        if (session.currentHand && session.currentHand.status !== 'complete') {
            return false;
        }

        // Check if enough time has passed since last hand
        if (session.nextHandStartTime && Date.now() < session.nextHandStartTime) {
            return false;
        }

        // Check if minimum players are available
        const activePlayers = this.getActivePlayers(session);
        if (activePlayers.length < session.config.minPlayers) {
            return false;
        }

        // Check if all required players are ready (not disconnected)
        const readyPlayers = activePlayers.filter(p => !p.disconnectedAt);
        if (readyPlayers.length < session.config.minPlayers) {
            return false;
        }

        return true;
    }

    getNextDealerPosition(session: PokerSession): number {
        const activePlayers = this.getActivePlayers(session);
        if (activePlayers.length < 2) {
            return 0;
        }

        // Sort players by seat number
        const sortedPlayers = activePlayers.sort((a, b) => a.seatNumber - b.seatNumber);

        // Find current dealer's index in sorted players
        const currentDealerIndex = sortedPlayers.findIndex(p => p.seatNumber === session.dealerPosition);

        // If dealer not found, start from first player
        if (currentDealerIndex === -1) {
            return sortedPlayers[0].seatNumber;
        }

        // Move to next player (with wraparound)
        const nextIndex = (currentDealerIndex + 1) % sortedPlayers.length;
        return sortedPlayers[nextIndex].seatNumber;
    }

    updatePlayerPositions(session: PokerSession): void {
        const activePlayers = this.getActivePlayers(session);
        if (activePlayers.length < 2) {
            return;
        }

        // Sort players by seat number
        const sortedPlayers = activePlayers.sort((a, b) => a.seatNumber - b.seatNumber);

        // Move dealer position to next player (this rotates the button)
        const currentDealerIndex = sortedPlayers.findIndex(p => p.seatNumber === session.dealerPosition);
        let nextDealerIndex = 0;
        
        if (currentDealerIndex !== -1) {
            nextDealerIndex = (currentDealerIndex + 1) % sortedPlayers.length;
        }
        
        session.dealerPosition = sortedPlayers[nextDealerIndex].seatNumber;

        // Calculate blind positions based on new dealer position
        const dealerIndex = nextDealerIndex;
        
        if (sortedPlayers.length === 2) {
            // Heads-up: dealer is small blind
            session.smallBlindPosition = sortedPlayers[dealerIndex].seatNumber;
            session.bigBlindPosition = sortedPlayers[(dealerIndex + 1) % sortedPlayers.length].seatNumber;
        } else {
            // Multi-way: small blind is left of dealer
            session.smallBlindPosition = sortedPlayers[(dealerIndex + 1) % sortedPlayers.length].seatNumber;
            session.bigBlindPosition = sortedPlayers[(dealerIndex + 2) % sortedPlayers.length].seatNumber;
        }

        logger.debug(`Updated positions for session ${session.id}: Dealer=${session.dealerPosition}, SB=${session.smallBlindPosition}, BB=${session.bigBlindPosition}`);
    }

    handlePlayerDisconnection(sessionId: string, playerId: string): void {
        logger.info(`Player ${playerId} disconnected from session ${sessionId}`);

        // Set disconnect timestamp
        this.markPlayerDisconnected(sessionId, playerId);

        // Start grace period timer
        const gracePeriod = GAME_CONSTANTS.ACTION_TIMERS.DISCONNECT_GRACE * 1000;
        const timerId = setTimeout(() => {
            this.handleDisconnectionTimeout(sessionId, playerId);
        }, gracePeriod);

        this.disconnectionTimers.set(`${sessionId}_${playerId}`, timerId);

        logger.debug(`Started ${gracePeriod}ms grace period for disconnected player ${playerId}`);
    }

    handlePlayerReconnection(sessionId: string, playerId: string): void {
        logger.info(`Player ${playerId} reconnected to session ${sessionId}`);

        // Clear disconnect timestamp
        this.markPlayerReconnected(sessionId, playerId);

        // Cancel timeout timer
        const timerKey = `${sessionId}_${playerId}`;
        const timer = this.disconnectionTimers.get(timerKey);
        if (timer) {
            clearTimeout(timer);
            this.disconnectionTimers.delete(timerKey);
            logger.debug(`Cancelled disconnection timeout for player ${playerId}`);
        }
    }

    cleanupInactiveSessions(): void {
        const now = Date.now();
        const inactivityThreshold = 30 * 60 * 1000; // 30 minutes

        // This would typically iterate through all sessions
        // For now, we'll just log the cleanup process
        logger.debug('Running session cleanup process');

        // Clear expired timers
        const expiredTimers: string[] = [];
        for (const [key, timer] of this.disconnectionTimers) {
            // Check if timer is still valid (this is simplified)
            if (typeof timer === 'object') {
                // Timer is still active, leave it
            } else {
                expiredTimers.push(key);
            }
        }

        // Clean up expired timers
        for (const key of expiredTimers) {
            this.disconnectionTimers.delete(key);
        }

        logger.debug(`Cleaned up ${expiredTimers.length} expired timers`);
    }

    // Additional lifecycle management methods

    scheduleNextHand(session: PokerSession, delay?: number): void {
        const handDelay = delay || session.config.handBreakDuration;
        session.nextHandStartTime = Date.now() + (handDelay * 1000);

        if (session.autoStart) {
            const timerId = setTimeout(() => {
                this.triggerAutoHandStart(session.id);
            }, handDelay * 1000);

            this.autoStartTimers.set(session.id, timerId);
            logger.debug(`Scheduled next hand for session ${session.id} in ${handDelay}s`);
        }
    }

    cancelScheduledHand(sessionId: string): void {
        const timer = this.autoStartTimers.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            this.autoStartTimers.delete(sessionId);
            logger.debug(`Cancelled scheduled hand for session ${sessionId}`);
        }
    }

    pauseSession(session: PokerSession, reason: string): void {
        session.status = 'paused';
        session.pausedAt = Date.now();
        session.pauseReason = reason;

        // Cancel any scheduled hands
        this.cancelScheduledHand(session.id);

        logger.info(`Paused session ${session.id}: ${reason}`);
    }

    resumeSession(session: PokerSession): void {
        if (session.status !== 'paused') {
            logger.warn(`Cannot resume session ${session.id}: not paused`);
            return;
        }

        const pauseDuration = session.pausedAt ? Date.now() - session.pausedAt : 0;
        session.status = 'active';
        session.duration += pauseDuration;
        session.pausedAt = undefined;
        session.pauseReason = undefined;

        // Reschedule next hand if auto-start is enabled
        if (session.autoStart && this.shouldAutoStartHand(session)) {
            this.scheduleNextHand(session);
        }

        logger.info(`Resumed session ${session.id} after ${pauseDuration}ms pause`);
    }

    checkSessionHealth(session: PokerSession): { healthy: boolean; issues: string[] } {
        const issues: string[] = [];

        // Check player count
        const activePlayers = this.getActivePlayers(session);
        if (activePlayers.length < session.config.minPlayers) {
            issues.push(`Insufficient active players: ${activePlayers.length}/${session.config.minPlayers}`);
        }

        // Check for stuck hands
        if (session.currentHand) {
            const handAge = Date.now() - session.currentHand.startTime;
            const maxHandDuration = 10 * 60 * 1000; // 10 minutes max per hand
            if (handAge > maxHandDuration) {
                issues.push(`Hand ${session.currentHand.id} running too long: ${handAge}ms`);
            }
        }

        // Check for disconnected players
        const disconnectedPlayers = Array.from(session.players.values())
            .filter(p => p.disconnectedAt && Date.now() - p.disconnectedAt > 5 * 60 * 1000);
        if (disconnectedPlayers.length > 0) {
            issues.push(`${disconnectedPlayers.length} players disconnected for >5 minutes`);
        }

        // Check session duration
        const sessionAge = Date.now() - session.startTime;
        const maxSessionDuration = 24 * 60 * 60 * 1000; // 24 hours max
        if (sessionAge > maxSessionDuration) {
            issues.push(`Session running too long: ${sessionAge}ms`);
        }

        return {
            healthy: issues.length === 0,
            issues
        };
    }

    private getActivePlayers(session: PokerSession): SessionPlayer[] {
        return Array.from(session.players.values())
            .filter(p => p.isActive && p.currentStack > 0);
    }

    private markPlayerDisconnected(sessionId: string, playerId: string): void {
        if (!sessionId || !playerId) {
            logger.error('Invalid sessionId or playerId for disconnection');
            return;
        }
        // This would update the session player's disconnected timestamp
        // Implementation would depend on how sessions are stored/managed
        logger.debug(`Marked player ${playerId} as disconnected from session ${sessionId}`);
    }

    private markPlayerReconnected(sessionId: string, playerId: string): void {
        if (!sessionId || !playerId) {
            logger.error('Invalid sessionId or playerId for reconnection');
            return;
        }
        // This would clear the session player's disconnected timestamp
        // Implementation would depend on how sessions are stored/managed
        logger.debug(`Marked player ${playerId} as reconnected to session ${sessionId}`);
    }

    private handleDisconnectionTimeout(sessionId: string, playerId: string): void {
        logger.warn(`Player ${playerId} disconnection timeout in session ${sessionId}`);

        // This would typically:
        // 1. Mark player as sitting out
        // 2. Auto-fold any active hands
        // 3. Update session state

        // Clean up the timer
        this.disconnectionTimers.delete(`${sessionId}_${playerId}`);
    }

    private triggerAutoHandStart(sessionId: string): void {
        logger.debug(`Triggering auto hand start for session ${sessionId}`);

        // This would typically emit an event or call the hand manager
        // to start a new hand automatically

        // Clean up the timer
        this.autoStartTimers.delete(sessionId);
    }

    // Cleanup on shutdown
    destroy(): void {
        // Clear all timers
        for (const timer of this.disconnectionTimers.values()) {
            clearTimeout(timer);
        }
        this.disconnectionTimers.clear();

        for (const timer of this.autoStartTimers.values()) {
            clearTimeout(timer);
        }
        this.autoStartTimers.clear();

        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }

        logger.info('Session lifecycle manager destroyed');
    }
}