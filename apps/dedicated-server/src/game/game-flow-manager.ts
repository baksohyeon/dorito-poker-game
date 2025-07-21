import {
    GameState,
    GameFlow,
    GameTransition,
    GamePhase,
    TransitionTrigger,
    PlayerState,
    PlayerAction,
    BettingOptions,
    HandRound,
    PokerSession
} from '@poker-game/shared';
import { IGameFlow } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';
import { EventEmitter } from 'events';

export class GameFlowManager extends EventEmitter implements IGameFlow {
    private activeFlows: Map<string, GameFlow> = new Map();
    private phaseTimers: Map<string, NodeJS.Timeout> = new Map();

    constructor() {
        super();
    }
    
    canAdvancePhase(gameState: GameState): boolean {
        const activePlayers = this.getActivePlayers(gameState);
        
        // Cannot advance if game is finished
        if (gameState.phase === 'finished' || gameState.phase === 'cancelled') {
            return false;
        }

        // Only one player left - advance to showdown/finished
        if (activePlayers.length <= 1) {
            return true;
        }

        // Check if all active players have completed their actions
        const waitingPlayers = this.getWaitingPlayers(gameState);
        return waitingPlayers.length === 0;
    }

    getNextPhase(currentPhase: GamePhase): GamePhase | null {
        const phaseTransitions: Record<GamePhase, GamePhase | null> = {
            'preflop': 'flop',
            'flop': 'turn', 
            'turn': 'river',
            'river': 'showdown',
            'showdown': 'finished',
            'finished': null,
            'paused': 'preflop', // Resume to current phase
            'cancelled': null
        };

        return phaseTransitions[currentPhase] || null;
    }

    shouldShowdown(gameState: GameState): boolean {
        const activePlayers = this.getActivePlayers(gameState);
        
        // Need at least 2 players for showdown
        if (activePlayers.length < 2) {
            return false;
        }

        // Must be at river or later phase
        if (['preflop', 'flop', 'turn'].includes(gameState.phase)) {
            return false;
        }

        // Check if all remaining players are all-in (no more betting possible)
        const playersCanAct = activePlayers.filter(p => 
            p.status === 'active' && p.chips > 0
        );

        return playersCanAct.length <= 1;
    }

    isHandComplete(gameState: GameState): boolean {
        return gameState.phase === 'finished' || 
               gameState.phase === 'cancelled' ||
               this.getActivePlayers(gameState).length <= 1;
    }

    getWaitingPlayers(gameState: GameState): string[] {
        const waitingPlayers: string[] = [];
        const currentPhaseActions = this.getCurrentPhaseActions(gameState);
        const playersActedThisPhase = new Set(currentPhaseActions.map(a => a.playerId));

        for (const [playerId, player] of gameState.players) {
            if (player.status === 'active' && 
                !playersActedThisPhase.has(playerId) &&
                player.chips > 0) {
                waitingPlayers.push(playerId);
            }
        }

        return waitingPlayers;
    }

    updateFlow(gameState: GameState, action: PlayerAction): GameFlow {
        const now = Date.now();
        
        // Update action history for current phase
        const phaseActions = [...this.getCurrentPhaseActions(gameState), action];
        
        // Calculate completed and pending actions
        const completedActions = new Map<string, PlayerAction>();
        const pendingActions = new Map<string, BettingOptions>();
        
        // Track who has acted this phase
        const actedPlayers = new Set(phaseActions.map(a => a.playerId));
        
        for (const [playerId, player] of gameState.players) {
            if (player.status === 'active') {
                const lastAction = phaseActions
                    .filter(a => a.playerId === playerId)
                    .pop();
                    
                if (lastAction) {
                    completedActions.set(playerId, lastAction);
                } else if (player.chips > 0) {
                    // Player hasn't acted and can still act
                    pendingActions.set(playerId, this.calculateBettingOptions(gameState, playerId));
                }
            }
        }

        return {
            currentPhase: gameState.phase,
            nextPhase: this.getNextPhase(gameState.phase) || undefined,
            canAdvancePhase: this.canAdvancePhase(gameState),
            phaseActions,
            phaseDuration: now - (gameState.actionStartTime || gameState.createdAt),
            phaseStartTime: gameState.actionStartTime || gameState.createdAt,
            waitingForPlayers: this.getWaitingPlayers(gameState),
            completedActions,
            pendingActions
        };
    }

    createTransition(gameState: GameState, trigger: TransitionTrigger, data?: any): GameTransition {
        const from = gameState.phase;
        const to = this.getNextPhase(from) || 'finished';
        const activePlayers = this.getActivePlayers(gameState);

        return {
            from,
            to,
            trigger,
            timestamp: Date.now(),
            playersInvolved: activePlayers.map(p => p.id),
            data: {
                pot: gameState.pot,
                communityCards: gameState.communityCards.length,
                activePlayers: activePlayers.length,
                handNumber: gameState.handNumber,
                ...data
            }
        };
    }

    validatePhaseTransition(gameState: GameState, targetPhase: GamePhase): boolean {
        const currentPhase = gameState.phase;
        
        // Cannot transition from finished/cancelled states
        if (currentPhase === 'finished' || currentPhase === 'cancelled') {
            return false;
        }

        // Can only advance to next logical phase
        const nextPhase = this.getNextPhase(currentPhase);
        if (targetPhase !== nextPhase) {
            return false;
        }

        // Must meet phase advancement criteria
        return this.canAdvancePhase(gameState);
    }

    getPhaseTimeLimits(): Record<GamePhase, number> {
        return {
            'preflop': GAME_CONSTANTS.ACTION_TIMERS.DEFAULT_ACTION_TIME * 1000,
            'flop': GAME_CONSTANTS.ACTION_TIMERS.DEFAULT_ACTION_TIME * 1000,
            'turn': GAME_CONSTANTS.ACTION_TIMERS.DEFAULT_ACTION_TIME * 1000,
            'river': GAME_CONSTANTS.ACTION_TIMERS.DEFAULT_ACTION_TIME * 1000,
            'showdown': 5000, // 5 seconds for showdown
            'finished': 0,
            'paused': 0,
            'cancelled': 0
        };
    }

    private getActivePlayers(gameState: GameState): PlayerState[] {
        return Array.from(gameState.players.values()).filter(p => 
            p.status === 'active' || p.status === 'all-in'
        );
    }

    private getCurrentPhaseActions(gameState: GameState): PlayerAction[] {
        // In a real implementation, you'd filter by phase
        // For now, return actions from the current betting round
        const phaseStartTime = gameState.actionStartTime || gameState.createdAt;
        return gameState.actionHistory.filter(action => 
            action.timestamp >= phaseStartTime
        );
    }

    private calculateBettingOptions(gameState: GameState, playerId: string): BettingOptions {
        const player = gameState.players.get(playerId);
        if (!player || player.status !== 'active') {
            return {
                canFold: false,
                canCheck: false,
                canCall: false,
                canBet: false,
                canRaise: false,
                canAllIn: false,
                callAmount: 0,
                minBet: 0,
                minRaise: 0,
                maxRaise: 0,
                potSize: gameState.pot
            };
        }

        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map(p => p.currentBet));
        const callAmount = maxBet - player.currentBet;
        const minBet = gameState.blinds.big;
        const minRaise = Math.max(gameState.minRaise, maxBet + gameState.blinds.big);

        return {
            canFold: true,
            canCheck: callAmount === 0,
            canCall: callAmount > 0 && callAmount <= player.chips,
            canBet: callAmount === 0 && player.chips >= minBet,
            canRaise: callAmount > 0 && player.chips >= minRaise,
            canAllIn: player.chips > 0,
            callAmount: Math.min(callAmount, player.chips),
            minBet,
            minRaise,
            maxRaise: player.chips + player.currentBet,
            potSize: gameState.pot
        };
    }

    // Session Integration Methods
    
    startSessionFlow(sessionId: string, session: PokerSession): void {
        logger.info(`Starting game flow for session ${sessionId}`);
        
        this.emit('sessionFlowStarted', { sessionId, session });
        
        // Initialize session-level flow tracking
        const flow: GameFlow = {
            currentPhase: 'preflop',
            nextPhase: 'flop',
            canAdvancePhase: false,
            phaseActions: [],
            phaseDuration: 0,
            phaseStartTime: Date.now(),
            waitingForPlayers: [],
            completedActions: new Map(),
            pendingActions: new Map()
        };
        
        this.activeFlows.set(sessionId, flow);
    }

    processHandFlow(sessionId: string, hand: HandRound): GameFlow {
        const gameState = hand.gameState;
        const flow = this.activeFlows.get(sessionId) || this.createDefaultFlow(gameState);
        
        // Update flow with current hand state
        flow.currentPhase = gameState.phase;
        flow.nextPhase = this.getNextPhase(gameState.phase) || undefined;
        flow.canAdvancePhase = this.canAdvancePhase(gameState);
        flow.phaseActions = this.getCurrentPhaseActions(gameState);
        flow.waitingForPlayers = this.getWaitingPlayers(gameState);
        
        // Emit phase events
        if (this.shouldEmitPhaseChange(sessionId, gameState.phase)) {
            this.emit('phaseChanged', {
                sessionId,
                handId: hand.id,
                phase: gameState.phase,
                nextPhase: flow.nextPhase
            });
        }
        
        // Handle automatic phase advancement
        if (flow.canAdvancePhase && flow.waitingForPlayers.length === 0) {
            this.schedulePhaseAdvancement(sessionId, hand.id);
        }
        
        this.activeFlows.set(sessionId, flow);
        return flow;
    }

    handleActionFlow(sessionId: string, handId: string, action: PlayerAction, gameState: GameState): void {
        logger.debug(`Processing action flow: ${action.type} by ${action.playerId}`);
        
        const flow = this.updateFlow(gameState, action);
        this.activeFlows.set(sessionId, flow);
        
        // Emit action flow events
        this.emit('actionFlow', {
            sessionId,
            handId,
            action,
            flow,
            gameState
        });
        
        // Check for flow state changes
        if (this.isFlowStateChange(action, gameState)) {
            this.emit('flowStateChange', {
                sessionId,
                handId,
                action,
                newState: gameState.phase,
                activePlayers: this.getActivePlayers(gameState).length
            });
        }
    }

    completeHandFlow(sessionId: string, hand: HandRound): void {
        logger.info(`Completing hand flow for ${hand.id} in session ${sessionId}`);
        
        // Clear any pending timers
        this.clearPhaseTimer(sessionId);
        
        // Emit completion events
        this.emit('handFlowCompleted', {
            sessionId,
            handId: hand.id,
            finalState: hand.gameState,
            winners: this.determineWinners(hand.gameState),
            potDistribution: hand.finalPot
        });
    }

    endSessionFlow(sessionId: string): void {
        logger.info(`Ending game flow for session ${sessionId}`);
        
        // Cleanup session flow data
        this.activeFlows.delete(sessionId);
        this.clearPhaseTimer(sessionId);
        
        this.emit('sessionFlowEnded', { sessionId });
    }

    // Flow Management Utilities
    
    private createDefaultFlow(gameState: GameState): GameFlow {
        return {
            currentPhase: gameState.phase,
            nextPhase: this.getNextPhase(gameState.phase) || undefined,
            canAdvancePhase: this.canAdvancePhase(gameState),
            phaseActions: [],
            phaseDuration: 0,
            phaseStartTime: Date.now(),
            waitingForPlayers: this.getWaitingPlayers(gameState),
            completedActions: new Map(),
            pendingActions: new Map()
        };
    }

    private shouldEmitPhaseChange(sessionId: string, currentPhase: GamePhase): boolean {
        const flow = this.activeFlows.get(sessionId);
        return !flow || flow.currentPhase !== currentPhase;
    }

    private schedulePhaseAdvancement(sessionId: string, handId: string): void {
        // Clear existing timer
        this.clearPhaseTimer(sessionId);
        
        // Schedule advancement after brief delay
        const timer = setTimeout(() => {
            this.emit('autoAdvancePhase', { sessionId, handId });
        }, 1000); // 1 second delay
        
        this.phaseTimers.set(sessionId, timer);
    }

    private clearPhaseTimer(sessionId: string): void {
        const timer = this.phaseTimers.get(sessionId);
        if (timer) {
            clearTimeout(timer);
            this.phaseTimers.delete(sessionId);
        }
    }

    private isFlowStateChange(action: PlayerAction, gameState: GameState): boolean {
        const activePlayers = this.getActivePlayers(gameState);
        
        return (
            action.type === 'all-in' ||
            action.type === 'fold' ||
            activePlayers.length <= 1 ||
            gameState.phase === 'finished'
        );
    }

    private determineWinners(gameState: GameState): string[] {
        const activePlayers = this.getActivePlayers(gameState);
        return activePlayers.map(p => p.id);
    }

    // Integration with Web Client
    
    getClientGameState(sessionId: string): any {
        const flow = this.activeFlows.get(sessionId);
        if (!flow) return null;
        
        return {
            phase: flow.currentPhase,
            nextPhase: flow.nextPhase,
            canAdvancePhase: flow.canAdvancePhase,
            waitingPlayers: flow.waitingForPlayers,
            phaseDuration: flow.phaseDuration,
            actionCount: flow.phaseActions.length
        };
    }

    // Cleanup
    
    cleanup(): void {
        // Clear all timers
        for (const timer of this.phaseTimers.values()) {
            clearTimeout(timer);
        }
        this.phaseTimers.clear();
        
        // Clear flows
        this.activeFlows.clear();
        
        // Remove listeners
        this.removeAllListeners();
        
        logger.info('Game flow manager cleaned up');
    }
}