import {
    HandRound,
    PokerSession,
    PlayerAction,
    GameState,
    PlayerState,
    HandStatus,
    HandWinner,
    BettingRound,
    Card,
    TableConfig,
    SessionConfig
} from '@poker-game/shared';
import { IHandRoundManager } from '@poker-game/shared';
import { PokerGameEngine } from '../game/poker-game-engine';
import { logger } from '@poker-game/logger';
import { ISessionLookup } from './interfaces/session-lookup';

export class HandRoundManager implements IHandRoundManager {
    private hands: Map<string, HandRound> = new Map();
    private sessionHands: Map<string, string[]> = new Map();
    private gameEngine: PokerGameEngine;
    private sessionLookup: ISessionLookup;

    constructor(sessionLookup: ISessionLookup) {
        this.gameEngine = new PokerGameEngine();
        this.sessionLookup = sessionLookup;
    }

    startNewHand(sessionId: string): HandRound {
        if (!sessionId) {
            throw new Error('Session ID is required');
        }

        const session = this.getSessionForHand({ sessionId } as HandRound);
        if (session.status !== 'active') {
            throw new Error(`Cannot start hand in ${session.status} session`);
        }

        // Check if there's already an active hand
        const existingHand = this.getCurrentHand(sessionId);
        if (existingHand) {
            throw new Error(`Session ${sessionId} already has an active hand: ${existingHand.id}`);
        }

        const handId = this.generateHandId();
        const now = Date.now();

        const handRound: HandRound = {
            id: handId,
            sessionId,
            handNumber: 0, // Will be set by session manager
            gameState: {} as GameState, // Will be initialized when dealing
            startTime: now,
            duration: 0,
            status: 'dealing',
            phase: 'preflop',
            dealerPosition: 0,
            smallBlindPosition: 0,
            bigBlindPosition: 0,
            participants: [],
            winners: [],
            finalPot: 0,
            rake: 0,
            showdownReached: false,
            communityCards: [],
            playerHands: new Map(),
            actionSequence: [],
            bettingRounds: []
        };

        this.hands.set(handId, handRound);

        // Track session hands
        if (!this.sessionHands.has(sessionId)) {
            this.sessionHands.set(sessionId, []);
        }
        this.sessionHands.get(sessionId)!.push(handId);

        logger.info(`Started new hand ${handId} for session ${sessionId}`);
        return handRound;
    }

    dealHand(handId: string): HandRound {
        if (!handId) {
            throw new Error('Hand ID is required');
        }

        const hand = this.hands.get(handId);
        if (!hand) {
            throw new Error(`Hand not found: ${handId}`);
        }

        if (hand.status !== 'dealing') {
            throw new Error(`Cannot deal hand ${handId}: invalid status ${hand.status}`);
        }

        // Validate hand state before dealing
        if (!hand.sessionId) {
            throw new Error(`Hand ${handId} has invalid session ID`);
        }

        try {
            // Initialize game state with session players
            const session = this.getSessionForHand(hand);
            const activePlayers = this.getActivePlayersForHand(session);

            if (activePlayers.length < 2) {
                hand.status = 'cancelled';
                throw new Error(`Cannot deal hand: insufficient active players (${activePlayers.length})`);
            }

            // Validate player states
            for (const player of activePlayers) {
                if (!player.playerId || player.currentStack <= 0) {
                    hand.status = 'cancelled';
                    throw new Error(`Invalid player state for ${player.playerId}: stack ${player.currentStack}`);
                }
            }

            // Convert session players to game players
            const gamePlayers = this.convertToGamePlayers(activePlayers);

            // Convert session config to table config
            const tableConfig: TableConfig = {
                id: session.id,
                name: `Table ${session.id}`,
                maxPlayers: session.config.maxPlayers,
                minPlayers: session.config.minPlayers,
                blinds: session.config.blindStructure,
                buyIn: session.config.buyInLimits,
                gameType: session.config.gameType,
                bettingLimit: session.config.bettingLimit,
                isPrivate: false,
                timeLimit: session.config.timeSettings.actionTimeLimit,
                timeBankSeconds: session.config.timeSettings.timeBankDefault,
                rakePercent: session.config.rakeStructure.percentage,
                rakeCap: session.config.rakeStructure.capAmount,
                allowRebuy: session.config.allowRebuy,
                rebuyLimit: session.config.rebuyLimits.maxRebuys,
                allowObservers: session.config.allowObservers,
                autoStartMinPlayers: session.config.minPlayers,
                tags: [],
                createdBy: '',
                createdAt: session.startTime,
                status: 'active',
                isTournament: session.sessionType === 'tournament'
            };

            // Create game state
            hand.gameState = this.gameEngine.createGame(tableConfig, gamePlayers);
            hand.participants = activePlayers.map(p => p.playerId);
            hand.dealerPosition = session.dealerPosition;
            hand.smallBlindPosition = session.smallBlindPosition;
            hand.bigBlindPosition = session.bigBlindPosition;

            // Deal cards
            hand.gameState = this.gameEngine.dealCards(hand.gameState);

            // Store player hands
            for (const [playerId, player] of hand.gameState.players) {
                hand.playerHands.set(playerId, [...player.cards]);
            }

            hand.status = 'betting';
            hand.phase = hand.gameState.phase;

            // Initialize first betting round
            this.startBettingRound(hand);

            logger.info(`Dealt hand ${handId} to ${activePlayers.length} players`);
            return hand;

        } catch (error) {
            logger.error(`Error dealing hand ${handId}:`, error);
            hand.status = 'cancelled';
            throw error;
        }
    }

    processHandAction(handId: string, action: PlayerAction): HandRound {
        if (!handId || !action || !action.playerId) {
            throw new Error('Valid hand ID and action with player ID required');
        }

        const hand = this.hands.get(handId);
        if (!hand) {
            throw new Error(`Hand not found: ${handId}`);
        }

        if (hand.status !== 'betting') {
            throw new Error(`Cannot process action for hand ${handId}: invalid status ${hand.status}`);
        }

        // Validate action timing
        if (action.timestamp && Date.now() - action.timestamp > 60000) {
            throw new Error(`Action timestamp too old: ${action.timestamp}`);
        }

        // Validate player is in hand
        if (!hand.participants.includes(action.playerId)) {
            throw new Error(`Player ${action.playerId} is not a participant in hand ${handId}`);
        }

        try {
            // Add timestamp to action
            action.timestamp = Date.now();

            // Validate and process action through game engine
            const validation = this.gameEngine.validateAction(hand.gameState, action);
            if (!validation.isValid) {
                throw new Error(`Invalid action: ${validation.message}`);
            }

            // Process action
            const previousPhase = hand.gameState.phase;
            hand.gameState = this.gameEngine.processAction(hand.gameState, action);
            hand.actionSequence.push(action);

            // Update current betting round
            this.updateBettingRound(hand, action);

            // Check for phase change
            if (hand.gameState.phase !== previousPhase) {
                this.completeBettingRound(hand);
                hand.communityCards = [...hand.gameState.communityCards];

                // Start new betting round if not finished
                if (hand.gameState.phase !== 'finished' && hand.gameState.phase !== 'showdown') {
                    this.startBettingRound(hand);
                }
            }

            // Update hand phase and status
            hand.phase = hand.gameState.phase;

            if (hand.gameState.phase === 'showdown') {
                hand.status = 'showdown';
                hand.showdownReached = true;
            } else if (hand.gameState.phase === 'finished' || this.gameEngine.isGameFinished(hand.gameState)) {
                return this.completeHand(handId);
            }

            // Check if only one player remains active
            const activePlayers = Array.from(hand.gameState.players.values())
                .filter(p => p.status === 'active' || p.status === 'all-in');
            if (activePlayers.length <= 1) {
                return this.completeHand(handId);
            }

            logger.debug(`Processed action ${action.type} for player ${action.playerId} in hand ${handId}`);
            return hand;

        } catch (error) {
            logger.error(`Error processing action in hand ${handId}:`, error);
            throw error;
        }
    }

    completeHand(handId: string): HandRound {
        if (!handId) {
            throw new Error('Hand ID is required');
        }

        const hand = this.hands.get(handId);
        if (!hand) {
            throw new Error(`Hand not found: ${handId}`);
        }

        if (hand.status === 'complete' || hand.status === 'cancelled') {
            logger.warn(`Hand ${handId} already completed with status: ${hand.status}`);
            return hand;
        }

        // Validate hand can be completed
        if (!hand.gameState || Object.keys(hand.gameState).length === 0) {
            throw new Error(`Hand ${handId} has invalid game state`);
        }

        try {
            // Determine winners
            const winners = this.gameEngine.determineWinners(hand.gameState);
            const handResults = this.gameEngine.evaluateHands(hand.gameState);

            // Award pot and calculate rake
            hand.gameState = this.gameEngine.awardPot(hand.gameState, winners);
            const rakeCalculation = this.gameEngine.calculateRake(hand.gameState);

            // Create winner information
            hand.winners = winners.map(playerId => {
                const player = hand.gameState.players.get(playerId);
                const handResult = handResults.get(playerId);
                const winAmount = player ? player.chips - (player.startingChips || 0) : 0;

                return {
                    playerId,
                    winAmount,
                    handResult: handResult!,
                    potType: 'main' as const
                };
            });

            hand.finalPot = hand.gameState.pot + rakeCalculation.rakeAmount;
            hand.rake = rakeCalculation.rakeAmount;
            hand.status = 'complete';
            hand.endTime = Date.now();
            hand.duration = hand.endTime - hand.startTime;

            // Complete final betting round
            this.completeBettingRound(hand);

            logger.info(`Completed hand ${handId} - Winners: ${winners.join(', ')}, Pot: ${hand.finalPot}, Rake: ${hand.rake}`);
            return hand;

        } catch (error) {
            logger.error(`Error completing hand ${handId}:`, error);
            hand.status = 'cancelled';
            throw error;
        }
    }

    cancelHand(handId: string, reason: string): HandRound {
        const hand = this.hands.get(handId);
        if (!hand) {
            throw new Error(`Hand not found: ${handId}`);
        }

        hand.status = 'cancelled';
        hand.endTime = Date.now();
        hand.duration = hand.endTime - hand.startTime;

        logger.warn(`Cancelled hand ${handId}: ${reason}`);
        return hand;
    }

    getHand(handId: string): HandRound | null {
        return this.hands.get(handId) || null;
    }

    getCurrentHand(sessionId: string): HandRound | null {
        const sessionHandIds = this.sessionHands.get(sessionId);
        if (!sessionHandIds || sessionHandIds.length === 0) {
            return null;
        }

        // Get the most recent hand
        const latestHandId = sessionHandIds[sessionHandIds.length - 1];
        const hand = this.hands.get(latestHandId);

        // Return only if hand is active
        if (hand && (hand.status === 'dealing' || hand.status === 'betting' || hand.status === 'showdown')) {
            return hand;
        }

        return null;
    }

    getHandHistory(sessionId: string, limit?: number): HandRound[] {
        const sessionHandIds = this.sessionHands.get(sessionId);
        if (!sessionHandIds) {
            return [];
        }

        const hands = sessionHandIds
            .map(handId => this.hands.get(handId))
            .filter((hand): hand is HandRound => hand !== undefined)
            .sort((a, b) => b.startTime - a.startTime);

        return limit ? hands.slice(0, limit) : hands;
    }

    private generateHandId(): string {
        return `hand_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    private getSessionForHand(hand: HandRound): PokerSession {
        const session = this.sessionLookup.getSession(hand.sessionId);
        if (!session) {
            throw new Error(`Session not found: ${hand.sessionId}`);
        }
        return session;
    }

    private getActivePlayersForHand(session: PokerSession): any[] {
        const activePlayers = Array.from(session.players.values())
            .filter(p => {
                if (!p.isActive || p.currentStack <= 0) return false;
                if (p.seatNumber === undefined || p.seatNumber < 0) return false;
                return true;
            })
            .sort((a, b) => a.seatNumber - b.seatNumber);

        // Validate no duplicate seat numbers
        const seatNumbers = activePlayers.map(p => p.seatNumber);
        const uniqueSeats = new Set(seatNumbers);
        if (seatNumbers.length !== uniqueSeats.size) {
            throw new Error('Duplicate seat numbers detected in active players');
        }

        return activePlayers;
    }

    private convertToGamePlayers(sessionPlayers: any[]): PlayerState[] {
        return sessionPlayers.map((sessionPlayer, index) => {
            if (!sessionPlayer.playerId) {
                throw new Error(`Invalid session player: missing playerId`);
            }
            if (sessionPlayer.currentStack <= 0) {
                throw new Error(`Invalid stack size for player ${sessionPlayer.playerId}: ${sessionPlayer.currentStack}`);
            }

            return {
                id: sessionPlayer.playerId,
                name: `Player ${sessionPlayer.playerId}`,
                chips: Math.max(0, sessionPlayer.currentStack),
                startingChips: Math.max(0, sessionPlayer.currentStack),
                currentBet: 0,
                totalBet: 0,
                totalInvested: 0,
                cards: [],
                holeCards: [],
                position: index,
                seatNumber: sessionPlayer.seatNumber || index,
                status: 'active' as const,
                hasActed: false,
                actionsThisRound: 0,
                isDealer: false,
                isSmallBlind: false,
                isBigBlind: false,
                isInPosition: false,
                timeBank: sessionPlayer.timeBank || 60,
                sessionStats: sessionPlayer.sessionStats || {
                    handsPlayed: 0, handsWon: 0, totalProfit: 0, vpip: 0, pfr: 0, aggression: 0,
                    showdownWinRate: 0, foldToBet: 0, foldToRaise: 0, cBetFreq: 0, threeBetFreq: 0, bigBlindsWon: 0
                },
                isObserver: false,
                canRebuy: true,
                rebuyCount: 0
            };
        });
    }

    private startBettingRound(hand: HandRound): void {
        const bettingRound: BettingRound = {
            phase: hand.gameState.phase,
            roundNumber: hand.bettingRounds.length + 1,
            currentBet: 0,
            totalPot: hand.gameState.pot,
            actions: [],
            isComplete: false,
            startTime: Date.now(),
            totalRaises: 0,
            playersActed: new Set(),
            communityCards: [...hand.gameState.communityCards]
        };

        hand.bettingRounds.push(bettingRound);
        logger.debug(`Started betting round ${bettingRound.roundNumber} for hand ${hand.id} (${hand.phase})`);
    }

    private updateBettingRound(hand: HandRound, action: PlayerAction): void {
        const currentRound = hand.bettingRounds[hand.bettingRounds.length - 1];
        if (currentRound) {
            currentRound.actions.push(action);
            currentRound.totalPot = hand.gameState.pot;
            currentRound.playersActed.add(action.playerId);

            if (action.type === 'raise') {
                currentRound.totalRaises++;
                currentRound.aggressorId = action.playerId;
            }
        }
    }

    private completeBettingRound(hand: HandRound): void {
        const currentRound = hand.bettingRounds[hand.bettingRounds.length - 1];
        if (currentRound && !currentRound.isComplete) {
            currentRound.isComplete = true;
            currentRound.endTime = Date.now();
            logger.debug(`Completed betting round ${currentRound.roundNumber} for hand ${hand.id}`);
        }
    }
}