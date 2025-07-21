import {
    GameState,
    PlayerAction,
    PlayerState,
    SidePot,
    BettingLimit
} from '@poker-game/shared';
import { IUnlimitedHoldemEngine } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class UnlimitedHoldemEngine implements IUnlimitedHoldemEngine {
    
    validateBet(gameState: GameState, playerId: string, amount: number): boolean {
        const player = gameState.players.get(playerId);
        if (!player) {
            logger.warn(`Player not found: ${playerId}`);
            return false;
        }

        // Basic validations
        if (amount <= 0) {
            logger.warn(`Invalid bet amount: ${amount}`);
            return false;
        }

        if (amount > player.chips) {
            logger.warn(`Bet amount exceeds available chips: ${amount} > ${player.chips}`);
            return false;
        }

        // No limit specific validations
        if (gameState.bettingLimit === 'no-limit') {
            return this.validateNoLimitBet(gameState, playerId, amount);
        }

        // Pot limit specific validations
        if (gameState.bettingLimit === 'pot-limit') {
            return this.validatePotLimitBet(gameState, playerId, amount);
        }

        return true;
    }

    calculateMinRaise(gameState: GameState): number {
        const players = Array.from(gameState.players.values());
        const currentMaxBet = Math.max(...players.map(p => p.currentBet));
        
        // In no-limit, minimum raise is the size of the previous bet/raise
        // If no previous bet, minimum raise is the big blind
        if (currentMaxBet === 0) {
            return gameState.blinds.big;
        }

        // Find the last aggressor and their raise amount
        const lastRaiseAmount = this.getLastRaiseAmount(gameState);
        return currentMaxBet + Math.max(lastRaiseAmount, gameState.blinds.big);
    }

    calculateMaxBet(gameState: GameState, playerId: string): number {
        const player = gameState.players.get(playerId);
        if (!player) {
            return 0;
        }

        if (gameState.bettingLimit === 'no-limit') {
            // In no-limit, max bet is all of player's chips
            return player.chips + player.currentBet;
        }

        if (gameState.bettingLimit === 'pot-limit') {
            // In pot-limit, max bet is the size of the pot + any call amount
            return this.calculatePotLimitMaxBet(gameState, playerId);
        }

        // Fixed limit (not typically "unlimited" but included for completeness)
        if (gameState.bettingLimit === 'fixed-limit') {
            return this.calculateFixedLimitMaxBet(gameState);
        }

        return player.chips + player.currentBet;
    }

    processAllInScenario(gameState: GameState, playerId: string): GameState {
        const player = gameState.players.get(playerId);
        if (!player) {
            throw new Error(`Player not found: ${playerId}`);
        }

        const newState = { ...gameState };
        const newPlayer = newState.players.get(playerId)!;

        // Move all chips to current bet
        const allInAmount = newPlayer.chips;
        newPlayer.chips = 0;
        newPlayer.currentBet += allInAmount;
        newPlayer.totalBet += allInAmount;
        newPlayer.totalInvested += allInAmount;
        newPlayer.status = 'all-in';

        // Update pot
        newState.pot += allInAmount;

        // Recalculate side pots
        newState.sidePots = this.calculateSidePots(newState);

        logger.info(`Player ${playerId} went all-in for ${allInAmount} chips`);
        return newState;
    }

    calculateSidePots(gameState: GameState): SidePot[] {
        const players = Array.from(gameState.players.values());
        const activePlayers = players.filter(p => 
            p.status === 'active' || p.status === 'all-in'
        );

        if (activePlayers.length < 2) {
            return [];
        }

        // Group players by their total investment levels
        const investmentLevels = [...new Set(activePlayers.map(p => p.totalBet))].sort((a, b) => a - b);
        const sidePots: SidePot[] = [];

        let previousLevel = 0;
        
        for (let i = 0; i < investmentLevels.length; i++) {
            const currentLevel = investmentLevels[i];
            const levelContribution = currentLevel - previousLevel;
            
            if (levelContribution > 0) {
                // Find players eligible for this side pot level
                const eligiblePlayers = activePlayers.filter(p => p.totalBet >= currentLevel);
                const potAmount = levelContribution * eligiblePlayers.length;

                if (potAmount > 0) {
                    sidePots.push({
                        id: `sidepot_${Date.now()}_${i}`,
                        amount: potAmount,
                        eligiblePlayers: eligiblePlayers.map(p => p.id),
                        winners: [],
                        isMainPot: i === 0,
                        maxContribution: currentLevel
                    });
                }
            }
            
            previousLevel = currentLevel;
        }

        return sidePots;
    }

    isNoLimitAction(action: PlayerAction, gameState: GameState): boolean {
        if (gameState.bettingLimit !== 'no-limit') {
            return false;
        }

        const player = gameState.players.get(action.playerId);
        if (!player) {
            return false;
        }

        // Check if this is a significant bet relative to pot size
        const potSize = gameState.pot;
        const betAmount = action.amount || 0;
        
        // Consider it a "no-limit" style action if:
        // 1. All-in
        // 2. Bet/raise is more than pot-sized
        // 3. Bet/raise puts significant pressure on opponents
        
        if (action.type === 'all-in') {
            return true;
        }

        if ((action.type === 'bet' || action.type === 'raise') && betAmount > potSize) {
            return true;
        }

        // Large bet relative to stack sizes
        const avgStack = this.getAverageStackSize(gameState);
        if (betAmount > avgStack * 0.5) {
            return true;
        }

        return false;
    }

    // Additional utility methods for unlimited hold'em

    getEffectiveStackSizes(gameState: GameState): Map<string, number> {
        const effectiveStacks = new Map<string, number>();
        const players = Array.from(gameState.players.values());

        for (const player of players) {
            const otherPlayers = players.filter(p => p.id !== player.id && p.status !== 'folded');
            const minOpponentStack = Math.min(...otherPlayers.map(p => p.chips + p.currentBet));
            
            const effectiveStack = Math.min(player.chips + player.currentBet, minOpponentStack || 0);
            effectiveStacks.set(player.id, effectiveStack);
        }

        return effectiveStacks;
    }

    calculatePotOdds(gameState: GameState, callAmount: number): number {
        const potSize = gameState.pot;
        return callAmount / (potSize + callAmount);
    }

    calculateImpliedOdds(gameState: GameState, playerId: string, callAmount: number): number {
        const player = gameState.players.get(playerId);
        if (!player) return 0;

        const currentPot = gameState.pot;
        const potentialFutureWinnings = this.estimateFutureWinnings(gameState, playerId);
        const totalPotential = currentPot + potentialFutureWinnings;
        
        return callAmount / (totalPotential + callAmount);
    }

    isStackSizeAppropriate(gameState: GameState, playerId: string): boolean {
        const player = gameState.players.get(playerId);
        if (!player) return false;

        const bigBlind = gameState.blinds.big;
        const stackInBB = player.chips / bigBlind;

        // Generally, 20-100+ BB is considered a reasonable stack size
        return stackInBB >= 20;
    }

    private validateNoLimitBet(gameState: GameState, playerId: string, amount: number): boolean {
        const player = gameState.players.get(playerId)!;
        const players = Array.from(gameState.players.values());
        const currentMaxBet = Math.max(...players.map(p => p.currentBet));

        // If this is a raise, check minimum raise requirements
        if (currentMaxBet > player.currentBet) {
            const minRaise = this.calculateMinRaise(gameState);
            if (amount < minRaise && amount < player.chips + player.currentBet) {
                logger.warn(`Raise too small: ${amount} < ${minRaise}`);
                return false;
            }
        }

        return true;
    }

    private validatePotLimitBet(gameState: GameState, playerId: string, amount: number): boolean {
        const maxBet = this.calculatePotLimitMaxBet(gameState, playerId);
        
        if (amount > maxBet) {
            logger.warn(`Bet exceeds pot limit: ${amount} > ${maxBet}`);
            return false;
        }

        return true;
    }

    private calculatePotLimitMaxBet(gameState: GameState, playerId: string): number {
        const player = gameState.players.get(playerId)!;
        const players = Array.from(gameState.players.values());
        const currentMaxBet = Math.max(...players.map(p => p.currentBet));
        const callAmount = Math.max(0, currentMaxBet - player.currentBet);
        
        // In pot limit, you can bet the size of the pot after calling
        const potAfterCall = gameState.pot + callAmount;
        const maxRaise = potAfterCall;
        
        return Math.min(player.chips + player.currentBet, currentMaxBet + maxRaise);
    }

    private calculateFixedLimitMaxBet(gameState: GameState): number {
        // Fixed limit betting amounts depend on the round
        const bigBlind = gameState.blinds.big;
        
        if (gameState.phase === 'preflop' || gameState.phase === 'flop') {
            return bigBlind; // Small bet
        } else {
            return bigBlind * 2; // Big bet (turn/river)
        }
    }

    private getLastRaiseAmount(gameState: GameState): number {
        // Look through action history to find the last raise amount
        const recentActions = gameState.actionHistory.slice(-10); // Look at recent actions
        
        for (let i = recentActions.length - 1; i >= 0; i--) {
            const action = recentActions[i];
            if (action.type === 'raise' && action.amount) {
                const players = Array.from(gameState.players.values());
                const previousMaxBet = Math.max(...players.map(p => p.currentBet)) - (action.amount || 0);
                return (action.amount || 0) - previousMaxBet;
            }
        }

        return gameState.blinds.big; // Default to big blind
    }

    private getAverageStackSize(gameState: GameState): number {
        const players = Array.from(gameState.players.values()).filter(p => p.status !== 'folded');
        const totalChips = players.reduce((sum, p) => sum + p.chips + p.currentBet, 0);
        
        return players.length > 0 ? totalChips / players.length : 0;
    }

    private estimateFutureWinnings(gameState: GameState, playerId: string): number {
        // Simplified estimation - in reality this would be much more complex
        const players = Array.from(gameState.players.values());
        const activePlayers = players.filter(p => p.status !== 'folded' && p.id !== playerId);
        
        // Estimate based on average remaining stack sizes
        const avgRemainingStack = activePlayers.length > 0 
            ? activePlayers.reduce((sum, p) => sum + p.chips, 0) / activePlayers.length 
            : 0;
        
        // Assume you might win ~30% of remaining stacks on average (very rough estimate)
        return avgRemainingStack * 0.3;
    }
}