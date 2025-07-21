
import {
    PokerSession,
    HandRound,
    SessionPlayer,
    SessionConfig,
    PlayerAction,
    SessionStatus,
    HandStatus
} from '@poker-game/shared';
import { SessionManager } from './session-manager';
import { HandRoundManager } from './hand-round-manager';
import { SessionStatisticsManager } from './session-statistics';
import { SessionLifecycleManager } from './session-lifecycle';
import { UnlimitedHoldemEngine } from '../game/unlimited-holdem-engine';
import { ActionTimerManager } from '../game/action-timer-manager';
import { StatisticsTracker } from '../game/statistics-tracker';
import { GameFlowManager } from '../game/game-flow-manager';
import { logger } from '@poker-game/logger';
import { EventEmitter } from 'events';
import { ISessionLookup } from './interfaces/session-lookup';

export class PokerSessionOrchestrator extends EventEmitter implements ISessionLookup {
    private sessionManager: SessionManager;
    private handRoundManager: HandRoundManager;
    private statisticsManager: SessionStatisticsManager;
    private lifecycleManager: SessionLifecycleManager;
    private unlimitedHoldemEngine: UnlimitedHoldemEngine;
    private actionTimerManager: ActionTimerManager;
    private statisticsTracker: StatisticsTracker;
    private gameFlowManager: GameFlowManager;
    private monitoringInterval: NodeJS.Timeout | null = null;

    constructor() {
        super();

        this.sessionManager = new SessionManager();
        this.handRoundManager = new HandRoundManager(this);
        this.statisticsManager = new SessionStatisticsManager();
        this.lifecycleManager = new SessionLifecycleManager();
        this.unlimitedHoldemEngine = new UnlimitedHoldemEngine();
        this.actionTimerManager = new ActionTimerManager();
        this.statisticsTracker = new StatisticsTracker();
        this.gameFlowManager = new GameFlowManager();

        this.setupEventListeners();
        this.startSessionMonitoring();
    }

    // Main Session Operations

    async createSession(config: SessionConfig, tableId: string): Promise<PokerSession> {
        try {
            const session = this.sessionManager.createSession(config, tableId);
            this.statisticsManager.registerSession(session);

            logger.info(`Created poker session ${session.id} for unlimited hold'em`);
            this.emit('sessionCreated', session);

            return session;
        } catch (error) {
            logger.error('Error creating poker session:', error);
            throw error;
        }
    }

    async joinSession(sessionId: string, player: SessionPlayer): Promise<boolean> {
        try {
            const success = this.sessionManager.addPlayer(sessionId, player);
            if (success) {
                const session = this.sessionManager.getSession(sessionId);
                if (session) {
                    // Check if session can auto-start
                    if (this.lifecycleManager.canStartSession(session)) {
                        await this.startSession(sessionId);
                    }

                    this.emit('playerJoined', { sessionId, playerId: player.playerId });
                }
            }
            return success;
        } catch (error) {
            logger.error(`Error joining session ${sessionId}:`, error);
            return false;
        }
    }

    async leaveSession(sessionId: string, playerId: string): Promise<boolean> {
        try {
            const session = this.sessionManager.getSession(sessionId);
            if (!session) return false;

            // Handle current hand if player is involved
            const currentHand = this.handRoundManager.getCurrentHand(sessionId);
            if (currentHand && currentHand.participants.includes(playerId)) {
                // Auto-fold player if it's their turn
                if (currentHand.gameState.currentPlayer === playerId) {
                    await this.processAction(sessionId, {
                        type: 'fold',
                        playerId,
                        timestamp: Date.now()
                    });
                }
            }

            const success = this.sessionManager.removePlayer(sessionId, playerId);
            if (success) {
                this.emit('playerLeft', { sessionId, playerId });

                // Check if session should be paused/ended
                await this.checkSessionViability(sessionId);
            }

            return success;
        } catch (error) {
            logger.error(`Error leaving session ${sessionId}:`, error);
            return false;
        }
    }

    async startSession(sessionId: string): Promise<boolean> {
        try {
            const session = this.sessionManager.getSession(sessionId);
            if (!session) {
                logger.error(`Session not found: ${sessionId}`);
                return false;
            }

            if (!this.lifecycleManager.canStartSession(session)) {
                logger.warn(`Cannot start session ${sessionId}: requirements not met`);
                return false;
            }

            const success = this.sessionManager.startSession(sessionId);
            if (success) {
                // Initialize game flow for this session
                this.gameFlowManager.startSessionFlow(sessionId, session);
                
                this.emit('sessionStarted', session);

                // Start first hand automatically
                await this.startNewHand(sessionId);
            }

            return success;
        } catch (error) {
            logger.error(`Error starting session ${sessionId}:`, error);
            return false;
        }
    }

    // Hand Management

    async startNewHand(sessionId: string): Promise<HandRound | null> {
        try {
            const session = this.sessionManager.getSession(sessionId);
            if (!session) {
                logger.error(`Session not found: ${sessionId}`);
                return null;
            }

            // Update player positions for new hand
            this.lifecycleManager.updatePlayerPositions(session);

            // Create and deal new hand
            const hand = this.handRoundManager.startNewHand(sessionId);
            hand.handNumber = session.handNumber + 1;
            hand.dealerPosition = session.dealerPosition;
            hand.smallBlindPosition = session.smallBlindPosition;
            hand.bigBlindPosition = session.bigBlindPosition;

            session.currentHand = hand;
            session.handNumber++;

            // Deal the hand
            const dealtHand = this.handRoundManager.dealHand(hand.id);

            // Initialize game flow for this hand
            const flow = this.gameFlowManager.processHandFlow(sessionId, dealtHand);

            // Start action timer for first player
            const currentPlayerId = dealtHand.gameState.currentPlayer;
            if (currentPlayerId) {
                this.startActionTimer(currentPlayerId, session.config.timeSettings.actionTimeLimit);
            }

            logger.info(`Started new hand ${hand.id} (Hand #${hand.handNumber}) in session ${sessionId}`);
            this.emit('handStarted', { session, hand: dealtHand });

            return dealtHand;
        } catch (error) {
            logger.error(`Error starting new hand for session ${sessionId}:`, error);
            return null;
        }
    }

    async processAction(sessionId: string, action: PlayerAction): Promise<boolean> {
        try {
            if (!sessionId || !action || !action.playerId) {
                logger.warn('Invalid action parameters');
                return false;
            }

            logger.debug(`Processing action: ${action.type} by ${action.playerId} in session ${sessionId}`);

            const currentHand = this.handRoundManager.getCurrentHand(sessionId);
            if (!currentHand) {
                logger.warn(`No active hand for session ${sessionId}`);
                return false;
            }

            logger.debug(`Current hand ${currentHand.id} status: ${currentHand.status}`);
            if (currentHand.status !== 'betting') {
                logger.warn(`Cannot process action: hand ${currentHand.id} status is ${currentHand.status}`);
                return false;
            }

            // Validate it's the player's turn
            logger.debug(`Current player: ${currentHand.gameState.currentPlayer}, Action by: ${action.playerId}`);
            if (currentHand.gameState.currentPlayer !== action.playerId) {
                logger.warn(`Not ${action.playerId}'s turn to act. Current player: ${currentHand.gameState.currentPlayer}`);
                return false;
            }

            // Stop current action timer
            this.actionTimerManager.stopTimer(action.playerId);

            // Skip unlimited hold'em validation for basic actions (call, fold, check)
            // Only validate betting amounts for bet/raise actions
            if ((action.type === 'bet' || action.type === 'raise') && action.amount) {
                logger.debug(`Validating ${action.type} of ${action.amount} for player ${action.playerId}`);
                try {
                    const player = currentHand.gameState.players.get(action.playerId);
                    if (player && action.amount > player.chips) {
                        logger.warn(`Bet ${action.amount} exceeds player chips ${player.chips}`);
                        return false;
                    }
                } catch (error) {
                    logger.debug(`Bet validation error (continuing): ${error}`);
                }
            }

            // Process action through hand manager
            let updatedHand: HandRound;
            try {
                updatedHand = this.handRoundManager.processHandAction(currentHand.id, action);
            } catch (error) {
                logger.error(`Hand manager failed to process action: ${error}`);
                throw error;
            }

            // Update game flow with the action
            this.gameFlowManager.handleActionFlow(sessionId, updatedHand.id, action, updatedHand.gameState);

            // Update session with the updated hand
            const session = this.sessionManager.getSession(sessionId);
            if (session) {
                session.currentHand = updatedHand;
                this.statisticsTracker.updatePlayerStats(action.playerId, action, updatedHand.gameState);
                this.statisticsManager.trackPlayerAction(sessionId, action.playerId, action, currentHand.id);
            }

            // Handle next action or hand completion
            if (updatedHand.status === 'complete' || updatedHand.gameState.phase === 'finished') {
                await this.completeHand(sessionId, updatedHand);
            } else if (updatedHand.gameState.currentPlayer) {
                // Start timer for next player
                this.startActionTimer(
                    updatedHand.gameState.currentPlayer,
                    session?.config.timeSettings.actionTimeLimit || 30
                );
            } else {
                // No current player - check if hand should be completed
                const activePlayers = Array.from(updatedHand.gameState.players.values())
                    .filter(p => p.status === 'active' || p.status === 'all-in');
                if (activePlayers.length <= 1) {
                    await this.completeHand(sessionId, updatedHand);
                }
            }

            logger.debug(`Action processed successfully: ${action.type} by ${action.playerId}`);
            this.emit('actionProcessed', { sessionId, action, hand: updatedHand });
            return true;
        } catch (error) {
            logger.error(`Error processing action in session ${sessionId}:`, error);
            if (error instanceof Error) {
                logger.error(`Error details:`, error.stack);
            }
            return false;
        }
    }

    private async completeHand(sessionId: string, hand: HandRound): Promise<void> {
        try {
            const session = this.sessionManager.getSession(sessionId);
            if (!session) return;

            // Complete hand through hand manager (only if not already complete)
            let completedHand = hand;
            if (hand.status !== 'complete') {
                completedHand = this.handRoundManager.completeHand(hand.id);
            }

            // Complete hand flow
            this.gameFlowManager.completeHandFlow(sessionId, completedHand);

            // Update session statistics
            this.statisticsManager.updateHandStatistics(session, completedHand);

            // Add to hand history
            if (!session.handHistory) {
                session.handHistory = [];
            }
            session.handHistory.push(completedHand);
            session.currentHand = undefined;

            // Update session totals
            session.totalHands = (session.totalHands || 0) + 1;
            session.totalPot = (session.totalPot || 0) + completedHand.finalPot;
            session.totalRake = (session.totalRake || 0) + completedHand.rake;

            // Save session state
            this.sessionManager.updateSession(session);

            logger.info(`Completed hand ${completedHand.id} in session ${sessionId}`);
            this.emit('handCompleted', { session, hand: completedHand });

            // Schedule next hand if session is still active
            if (session.status === 'active' && this.lifecycleManager.shouldAutoStartHand(session)) {
                this.lifecycleManager.scheduleNextHand(session, session.config.handBreakDuration);

                // Auto-start next hand after delay
                setTimeout(() => {
                    if (this.lifecycleManager.shouldAutoStartHand(session)) {
                        this.startNewHand(sessionId).catch(error => {
                            logger.error(`Error auto-starting next hand: ${error}`);
                        });
                    }
                }, Math.max(100, session.config.handBreakDuration * 1000)); // Minimum 100ms delay
            }

        } catch (error) {
            logger.error(`Error completing hand ${hand.id}:`, error);
        }
    }

    // Player Connection Management

    handlePlayerDisconnection(sessionId: string, playerId: string): void {
        this.lifecycleManager.handlePlayerDisconnection(sessionId, playerId);

        // Stop any active timers for this player
        this.actionTimerManager.stopTimer(playerId);

        // Auto-fold if it's their turn
        const currentHand = this.handRoundManager.getCurrentHand(sessionId);
        if (currentHand && currentHand.gameState.currentPlayer === playerId) {
            setTimeout(() => {
                // Auto-fold after grace period
                this.processAction(sessionId, {
                    type: 'fold',
                    playerId,
                    timestamp: Date.now()
                });
            }, 5000); // 5 second grace period
        }

        this.emit('playerDisconnected', { sessionId, playerId });
    }

    handlePlayerReconnection(sessionId: string, playerId: string): void {
        this.lifecycleManager.handlePlayerReconnection(sessionId, playerId);
        this.emit('playerReconnected', { sessionId, playerId });
    }

    // Utility Methods

    getSession(sessionId: string): PokerSession | null {
        return this.sessionManager.getSession(sessionId);
    }

    getActiveSessions(): PokerSession[] {
        return this.sessionManager.getAllSessions().filter(s => s.status === 'active');
    }

    getSessionStatistics(sessionId: string) {
        return this.statisticsManager.calculateSessionStats(sessionId);
    }

    getPlayerStatistics(sessionId: string, playerId: string) {
        return this.statisticsManager.getPlayerStats(sessionId, playerId);
    }

    generateSessionReport(sessionId: string) {
        return this.statisticsManager.generateSessionReport(sessionId);
    }

    exportSessionData(sessionId: string) {
        return this.statisticsManager.exportSessionData(sessionId);
    }

    private startActionTimer(playerId: string, timeLimit: number): void {
        const timer = {
            playerId,
            actionId: `action_${Date.now()}`,
            startTime: Date.now(),
            timeLimit,
            timeBank: 60, // Default time bank
            warningTime: 10,
            onTimeout: () => {
                logger.warn(`Action timeout for player ${playerId}`);
                this.emit('actionTimeout', { playerId });
            },
            onWarning: () => {
                logger.debug(`Action warning for player ${playerId}`);
                this.emit('actionWarning', { playerId });
            }
        };

        this.actionTimerManager.startTimer(timer);
    }

    private async checkSessionViability(sessionId: string): Promise<void> {
        const session = this.sessionManager.getSession(sessionId);
        if (!session) return;

        const activePlayers = Array.from(session.players.values()).filter(p => p.isActive);

        if (activePlayers.length < session.config.minPlayers) {
            if (session.status === 'active') {
                this.lifecycleManager.pauseSession(session, 'Insufficient players');
                this.emit('sessionPaused', { sessionId, reason: 'Insufficient players' });
            }
        }
    }

    private setupEventListeners(): void {
        // Set up internal event handling
        this.on('handCompleted', ({ session, hand }) => {
            // Additional cleanup or processing after hand completion
        });

        this.on('actionTimeout', ({ playerId }) => {
            // Handle action timeouts
        });

        // Game flow event handlers
        this.gameFlowManager.on('phaseChanged', ({ sessionId, handId, phase, nextPhase }) => {
            logger.info(`Phase changed in session ${sessionId}, hand ${handId}: ${phase} -> ${nextPhase}`);
            this.emit('phaseChanged', { sessionId, handId, phase, nextPhase });
        });

        this.gameFlowManager.on('flowStateChange', ({ sessionId, handId, action, newState, activePlayers }) => {
            logger.info(`Flow state change in session ${sessionId}: ${action.type} -> ${newState} (${activePlayers} active)`);
            this.emit('gameFlowStateChange', { sessionId, handId, action, newState, activePlayers });
        });

        this.gameFlowManager.on('autoAdvancePhase', ({ sessionId, handId }) => {
            logger.info(`Auto-advancing phase for session ${sessionId}, hand ${handId}`);
            // Could trigger automatic phase advancement logic here
        });

        this.gameFlowManager.on('handFlowCompleted', ({ sessionId, handId, finalState, winners, potDistribution }) => {
            logger.info(`Hand flow completed for ${handId} in session ${sessionId}. Winners: ${winners.join(', ')}`);
            this.emit('handFlowCompleted', { sessionId, handId, finalState, winners, potDistribution });
        });
    }

    private startSessionMonitoring(): void {
        // Monitor session health every minute
        this.monitoringInterval = setInterval(() => {
            for (const session of this.getActiveSessions()) {
                const health = this.lifecycleManager.checkSessionHealth(session);
                if (!health.healthy) {
                    logger.warn(`Session ${session.id} health issues:`, health.issues);
                    this.emit('sessionHealthIssue', { sessionId: session.id, issues: health.issues });
                }
            }
        }, 60 * 1000);
    }

    // Enhanced utility methods
    
    getGameFlowState(sessionId: string): any {
        return this.gameFlowManager.getClientGameState(sessionId);
    }

    endSession(sessionId: string): void {
        // End game flow for session
        this.gameFlowManager.endSessionFlow(sessionId);
        
        // Clean up session data
        const session = this.sessionManager.getSession(sessionId);
        if (session) {
            this.emit('sessionEnded', { sessionId, session });
        }
    }

    // Cleanup
    destroy(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.actionTimerManager.cleanup();
        this.lifecycleManager.destroy();
        this.gameFlowManager.cleanup();
        this.removeAllListeners();
        logger.info('Poker session orchestrator destroyed');
    }
}