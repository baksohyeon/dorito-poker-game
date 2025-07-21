import {
    GameState,
    GameFlow,
    GameTransition,
    GamePhase,
    TransitionTrigger,
    PlayerState,
    PlayerAction,
    BettingOptions
} from '@poker-game/shared';
import { IGameFlow } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class GameFlowManager implements IGameFlow {
    
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
}