import {
    PokerSession,
    SessionPlayer,
    SessionConfig,
    SessionType,
    SessionStatus,
    SessionStatistics,
    TimeSettings,
    RakeStructure,
    BlindStructure
} from '@poker-game/shared';
import { ISessionManager } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class SessionManager implements ISessionManager {
    private sessions: Map<string, PokerSession> = new Map();
    private sessionsByTable: Map<string, string> = new Map();

    createSession(config: SessionConfig, tableId: string): PokerSession {
        if (!tableId || typeof tableId !== 'string') {
            throw new Error('Valid tableId is required');
        }

        // Check if table already has an active session
        const existingSessionId = this.sessionsByTable.get(tableId);
        if (existingSessionId) {
            const existingSession = this.sessions.get(existingSessionId);
            if (existingSession && (existingSession.status === 'active' || existingSession.status === 'waiting')) {
                throw new Error(`Table ${tableId} already has an active session`);
            }
        }

        const sessionId = this.generateSessionId();
        const now = Date.now();

        // Validate configuration
        this.validateSessionConfig(config);

        const session: PokerSession = {
            id: sessionId,
            tableId,
            sessionType: config.gameType === 'texas-holdem' ? 'cash-game' : 'tournament',
            status: 'waiting',
            players: new Map(),
            currentHand: undefined,
            handHistory: [],
            handNumber: 0,
            startTime: now,
            duration: 0,
            totalHands: 0,
            totalPot: 0,
            totalRake: 0,
            dealerPosition: 0,
            smallBlindPosition: 1,
            bigBlindPosition: 2,
            config,
            statistics: this.createEmptyStatistics(),
            autoStart: config.autoStartDelay > 0,
            nextHandStartTime: undefined
        };

        this.sessions.set(sessionId, session);
        this.sessionsByTable.set(tableId, sessionId);

        logger.info(`Created new poker session: ${sessionId} for table ${tableId}`);
        return session;
    }

    startSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        if (session.status !== 'waiting') {
            logger.warn(`Cannot start session ${sessionId}: invalid status ${session.status}`);
            return false;
        }

        // Check if we have minimum players
        const activePlayers = Array.from(session.players.values()).filter(p => p.isActive);
        if (activePlayers.length < session.config.minPlayers) {
            logger.warn(`Cannot start session ${sessionId}: insufficient players (${activePlayers.length}/${session.config.minPlayers})`);
            return false;
        }

        session.status = 'active';
        session.startTime = Date.now();
        session.dealerPosition = Math.floor(Math.random() * activePlayers.length);
        this.updatePlayerPositions(session);

        logger.info(`Started poker session: ${sessionId} with ${activePlayers.length} players`);
        return true;
    }

    pauseSession(sessionId: string, reason?: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        if (session.status !== 'active') {
            logger.warn(`Cannot pause session ${sessionId}: not active`);
            return false;
        }

        session.status = 'paused';
        session.pausedAt = Date.now();
        session.pauseReason = reason;

        logger.info(`Paused session ${sessionId}${reason ? `: ${reason}` : ''}`);
        return true;
    }

    resumeSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        if (session.status !== 'paused') {
            logger.warn(`Cannot resume session ${sessionId}: not paused`);
            return false;
        }

        const pauseDuration = session.pausedAt ? Date.now() - session.pausedAt : 0;
        session.status = 'active';
        session.duration += pauseDuration;
        session.pausedAt = undefined;
        session.pauseReason = undefined;

        logger.info(`Resumed session ${sessionId} after ${pauseDuration}ms pause`);
        return true;
    }

    endSession(sessionId: string): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        session.status = 'finished';
        session.endTime = Date.now();
        session.duration = session.endTime - session.startTime;

        // Update final statistics
        this.updateFinalStatistics(session);

        logger.info(`Ended session ${sessionId} after ${session.duration}ms, ${session.totalHands} hands`);
        return true;
    }

    addPlayer(sessionId: string, player: SessionPlayer): boolean {
        // Input validation
        if (!sessionId || !player || !player.playerId) {
            logger.error('Invalid input: sessionId and valid player required');
            return false;
        }

        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        // Check session status
        if (session.status === 'finished' || session.status === 'cancelled') {
            logger.warn(`Cannot add player to ${session.status} session ${sessionId}`);
            return false;
        }

        // Check if session is full
        if (session.players.size >= session.config.maxPlayers) {
            logger.warn(`Cannot add player to session ${sessionId}: session full`);
            return false;
        }

        // Check seat number availability
        if (player.seatNumber !== undefined) {
            const seatTaken = Array.from(session.players.values())
                .some(p => p.seatNumber === player.seatNumber && p.isActive);
            if (seatTaken) {
                logger.warn(`Seat ${player.seatNumber} already occupied in session ${sessionId}`);
                return false;
            }
        }

        // Check if player is already in session
        const existingPlayer = session.players.get(player.playerId);
        if (existingPlayer && existingPlayer.isActive) {
            logger.warn(`Player ${player.playerId} already active in session ${sessionId}`);
            return false;
        }

        // Validate buy-in amount
        if (!this.validateBuyIn(player.buyInAmount, session.config.buyInLimits)) {
            logger.warn(`Invalid buy-in amount for player ${player.playerId}: ${player.buyInAmount}`);
            return false;
        }

        // Validate stack size
        if (player.currentStack !== player.buyInAmount) {
            logger.warn(`Stack mismatch for player ${player.playerId}: expected ${player.buyInAmount}, got ${player.currentStack}`);
            player.currentStack = player.buyInAmount;
        }

        session.players.set(player.playerId, {
            ...player,
            joinedAt: Date.now(),
            isActive: true,
            currentStack: player.buyInAmount,
            profit: 0,
            handsPlayed: 0,
            handsWon: 0,
            timeBank: session.config.timeSettings.timeBankDefault
        });

        logger.info(`Added player ${player.playerId} to session ${sessionId} with buy-in ${player.buyInAmount}`);
        return true;
    }

    removePlayer(sessionId: string, playerId: string): boolean {
        if (!sessionId || !playerId) {
            logger.error('Invalid input: sessionId and playerId required');
            return false;
        }

        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        const player = session.players.get(playerId);
        if (!player) {
            logger.warn(`Player ${playerId} not found in session ${sessionId}`);
            return false;
        }

        if (!player.isActive) {
            logger.warn(`Player ${playerId} already inactive in session ${sessionId}`);
            return false;
        }

        // Mark as inactive and set leave time
        player.isActive = false;
        player.leftAt = Date.now();
        player.profit = player.currentStack - player.buyInAmount;

        // Update session activity timestamp
        session.duration = Date.now() - session.startTime;

        // Don't actually remove from map to preserve statistics
        logger.info(`Removed player ${playerId} from session ${sessionId} with stack ${player.currentStack}, profit: ${player.profit}`);
        return true;
    }

    getSession(sessionId: string): PokerSession | null {
        return this.sessions.get(sessionId) || null;
    }

    getAllSessions(): PokerSession[] {
        return Array.from(this.sessions.values());
    }

    getActiveSessionsForTable(tableId: string): PokerSession[] {
        return Array.from(this.sessions.values()).filter(s =>
            s.tableId === tableId && (s.status === 'active' || s.status === 'waiting')
        );
    }

    updateSessionConfig(sessionId: string, config: Partial<SessionConfig>): boolean {
        const session = this.sessions.get(sessionId);
        if (!session) {
            logger.error(`Session not found: ${sessionId}`);
            return false;
        }

        // Only allow certain config changes during active session
        if (session.status === 'active') {
            const allowedUpdates = ['timeSettings', 'rakeStructure'];
            const updates = Object.keys(config);
            const invalidUpdates = updates.filter(key => !allowedUpdates.includes(key));

            if (invalidUpdates.length > 0) {
                logger.warn(`Cannot update config for active session ${sessionId}: ${invalidUpdates.join(', ')}`);
                return false;
            }
        }

        session.config = { ...session.config, ...config };
        logger.info(`Updated config for session ${sessionId}`);
        return true;
    }

    updateSession(session: PokerSession): boolean {
        if (!session.id || !this.sessions.has(session.id)) {
            logger.error(`Session not found: ${session.id}`);
            return false;
        }

        this.sessions.set(session.id, session);
        return true;
    }

    private generateSessionId(): string {
        const timestamp = Date.now();
        const randomPart = Math.random().toString(36).substr(2, 9);
        return `session_${timestamp}_${randomPart}`;
    }

    private validateSessionConfig(config: SessionConfig): void {
        if (config.minPlayers < 2) {
            throw new Error('Minimum players must be at least 2');
        }
        if (config.maxPlayers > 10) {
            throw new Error('Maximum players cannot exceed 10 for Texas Hold\'em');
        }
        if (config.minPlayers > config.maxPlayers) {
            throw new Error('Minimum players cannot exceed maximum players');
        }
        if (config.buyInLimits.min <= 0) {
            throw new Error('Buy-in minimum must be positive');
        }
        if (config.buyInLimits.max < config.buyInLimits.min) {
            throw new Error('Buy-in maximum must be >= minimum');
        }
    }

    private validateBuyIn(amount: number, limits: any): boolean {
        if (typeof amount !== 'number' || amount <= 0) {
            return false;
        }
        if (!limits || typeof limits.min !== 'number' || typeof limits.max !== 'number') {
            return false;
        }
        return amount >= limits.min && amount <= limits.max;
    }

    private createEmptyStatistics(): SessionStatistics {
        return {
            totalHandsDealt: 0,
            averageHandDuration: 0,
            averagePotSize: 0,
            playersPerFlop: 0,
            showdownPercentage: 0,
            rakeCollected: 0,
            biggestPot: 0,
            longestHand: 0,
            fastestHand: Number.MAX_VALUE,
            playerTurnover: 0
        };
    }

    private updatePlayerPositions(session: PokerSession): void {
        const activePlayers = Array.from(session.players.values()).filter(p => p.isActive);
        const playerCount = activePlayers.length;

        if (playerCount >= 2) {
            session.smallBlindPosition = (session.dealerPosition + 1) % playerCount;
            session.bigBlindPosition = (session.dealerPosition + 2) % playerCount;
        }
    }

    private updateFinalStatistics(session: PokerSession): void {
        const totalDuration = session.endTime! - session.startTime;
        session.duration = totalDuration;

        if (session.totalHands > 0) {
            session.statistics.averageHandDuration = totalDuration / session.totalHands;
            session.statistics.averagePotSize = session.totalPot / session.totalHands;
        }

        // Calculate player turnover
        const totalPlayersJoined = session.players.size;
        const currentActivePlayers = Array.from(session.players.values()).filter(p => p.isActive).length;
        session.statistics.playerTurnover = totalPlayersJoined - currentActivePlayers;
    }
}