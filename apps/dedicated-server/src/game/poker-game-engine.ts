
// apps/dedicated-server/src/game/poker-game-engine.ts
import {
    GameState,
    PlayerAction,
    PlayerState,
    Card,
    HandResult,
    SidePot
} from '@poker-game/shared';
import { IGameEngine } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { Deck } from './deck';
import { HandEvaluator } from './hand-evaluator';
import { logger } from '@poker-game/logger';

export class PokerGameEngine implements IGameEngine {
    private deck: Deck;
    private handEvaluator: HandEvaluator;

    constructor() {
        this.deck = new Deck();
        this.handEvaluator = new HandEvaluator();
    }

    createGame(tableId: string, players: PlayerState[]): GameState {
        if (players.length < 2) {
            throw new Error('At least 2 players required');
        }

        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const gameState: GameState = {
            id: gameId,
            tableId,
            phase: 'preflop',
            pot: 0,
            sidePots: [],
            communityCards: [],
            currentPlayer: null,
            dealerPosition: 0,
            smallBlindPosition: 1 % players.length,
            bigBlindPosition: 2 % players.length,
            players: new Map(players.map(p => [p.id, { ...p }])),
            blinds: { small: 10, big: 20 }, // Should come from table config
            round: 1,
            lastAction: undefined,
            actionStartTime: undefined,
            actionTimeLimit: 30000 // 30 seconds
        };

        // Set dealer, small blind, and big blind
        this.setPositions(gameState);

        logger.info(`Game created: ${gameId} for table ${tableId}`);
        return gameState;
    }

    dealCards(gameState: GameState): GameState {
        const newState = { ...gameState };

        // Shuffle deck
        this.deck.shuffle();

        // Deal 2 cards to each active player
        for (const [playerId, player] of newState.players) {
            if (player.status === 'active') {
                player.cards = this.deck.deal(2);
            }
        }

        // Post blinds
        this.postBlinds(newState);

        // Set first player to act (after big blind)
        newState.currentPlayer = this.getNextActivePlayer(newState, newState.bigBlindPosition.toString());
        newState.actionStartTime = Date.now();

        logger.debug(`Cards dealt for game ${gameState.id}`);
        return newState;
    }

    processAction(gameState: GameState, action: PlayerAction): GameState {
        // Validate action first
        this.validateAction(gameState, action);

        const newState = { ...gameState };
        const player = newState.players.get(action.playerId);

        if (!player) {
            throw new Error('Player not found');
        }

        if (newState.currentPlayer !== action.playerId) {
            throw new Error('Not your turn');
        }

        // Check action timeout
        if (newState.actionStartTime && Date.now() - newState.actionStartTime > newState.actionTimeLimit) {
            // Auto-fold on timeout
            this.processFold(newState, player);
            logger.warn(`Player ${action.playerId} timed out, auto-folding`);
        } else {

            // Process the action
            switch (action.type) {
                case 'fold':
                    this.processFold(newState, player);
                    break;
                case 'check':
                    this.processCheck(newState, player);
                    break;
                case 'call':
                    this.processCall(newState, player);
                    break;
                case 'bet':
                    this.processBet(newState, player, action.amount || 0);
                    break;
                case 'raise':
                    this.processRaise(newState, player, action.amount || 0);
                    break;
                case 'all-in':
                    this.processAllIn(newState, player);
                    break;
                default:
                    throw new Error(`Unknown action type: ${action.type}`);
            }

            // Update last action
            newState.lastAction = action;
            player.hasActed = true;
        }

        // Move to next player or next phase
        this.advanceAction(newState);

        return newState;
    }

    private processFold(gameState: GameState, player: PlayerState): void {
        player.status = 'folded';
        player.cards = []; // Muck cards

        logger.debug(`Player ${player.id} folded`);
    }

    private processCheck(gameState: GameState, player: PlayerState): void {
        // Can only check if no bet to call
        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));
        if (player.currentBet < maxBet) {
            throw new Error('Cannot check, there is a bet to call');
        }

        logger.debug(`Player ${player.id} checked`);
    }

    private processCall(gameState: GameState, player: PlayerState): void {
        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));
        const callAmount = maxBet - player.currentBet;

        if (callAmount <= 0) {
            throw new Error('No bet to call');
        }

        if (callAmount >= player.chips) {
            // All-in call
            this.processAllIn(gameState, player);
            return;
        }

        player.chips -= callAmount;
        player.currentBet += callAmount;
        player.totalBet += callAmount;
        gameState.pot += callAmount;

        logger.debug(`Player ${player.id} called ${callAmount}`);
    }

    private processBet(gameState: GameState, player: PlayerState, amount: number): void {
        // Can only bet if no one else has bet
        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));
        if (maxBet > 0) {
            throw new Error('Cannot bet, there is already a bet');
        }

        if (amount > player.chips) {
            throw new Error('Bet amount exceeds available chips');
        }

        if (amount < gameState.blinds.big) {
            throw new Error('Bet amount too small');
        }

        player.chips -= amount;
        player.currentBet = amount;
        player.totalBet += amount;
        gameState.pot += amount;

        logger.debug(`Player ${player.id} bet ${amount}`);
    }

    private processRaise(gameState: GameState, player: PlayerState, amount: number): void {
        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));

        if (amount <= maxBet) {
            throw new Error('Raise amount must be higher than current bet');
        }

        if (amount > player.chips + player.currentBet) {
            throw new Error('Raise amount exceeds available chips');
        }

        const raiseAmount = amount - player.currentBet;
        player.chips -= raiseAmount;
        player.currentBet = amount;
        player.totalBet += raiseAmount;
        gameState.pot += raiseAmount;

        logger.debug(`Player ${player.id} raised to ${amount}`);
    }

    private processAllIn(gameState: GameState, player: PlayerState): void {
        const allInAmount = player.chips;
        player.chips = 0;
        player.currentBet += allInAmount;
        player.totalBet += allInAmount;
        player.status = 'all-in';
        gameState.pot += allInAmount;

        logger.debug(`Player ${player.id} went all-in for ${allInAmount}`);
    }

    private advanceAction(gameState: GameState): void {
        // Check if betting round is complete
        if (this.isBettingRoundComplete(gameState)) {
            this.advanceToNextPhase(gameState);
        } else {
            // Move to next active player
            gameState.currentPlayer = this.getNextActivePlayer(gameState, gameState.currentPlayer);
            gameState.actionStartTime = Date.now();
        }
    }

    private isBettingRoundComplete(gameState: GameState): boolean {
        const players = Array.from(gameState.players.values());
        const activePlayers = players.filter((p: PlayerState) =>
            p.status === 'active' || p.status === 'all-in'
        );

        if (activePlayers.length <= 1) {
            return true;
        }

        // Check if all active players have acted and bets are equal
        const maxBet = Math.max(...activePlayers.map((p: PlayerState) => p.currentBet));

        return activePlayers.every((p: PlayerState) => {
            return p.hasActed && (p.currentBet === maxBet || p.status === 'all-in');
        });
    }

    private advanceToNextPhase(gameState: GameState): void {
        // Reset player actions
        const players = Array.from(gameState.players.values());
        for (const player of players) {
            player.hasActed = false;
            player.currentBet = 0;
        }

        // Advance phase
        switch (gameState.phase) {
            case 'preflop':
                gameState.phase = 'flop';
                gameState.communityCards = this.deck.deal(3);
                break;
            case 'flop':
                gameState.phase = 'turn';
                gameState.communityCards.push(...this.deck.deal(1));
                break;
            case 'turn':
                gameState.phase = 'river';
                gameState.communityCards.push(...this.deck.deal(1));
                break;
            case 'river':
                gameState.phase = 'showdown';
                gameState.currentPlayer = null;
                return;
            default:
                gameState.phase = 'finished';
                return;
        }

        // Set first player to act (after dealer)
        gameState.currentPlayer = this.getNextActivePlayer(gameState, gameState.dealerPosition.toString());
        gameState.actionStartTime = Date.now();

        logger.debug(`Advanced to ${gameState.phase} phase`);
    }

    private postBlinds(gameState: GameState): void {
        const players = Array.from(gameState.players.values());
        const smallBlindPlayer = players.find(p => p.position === gameState.smallBlindPosition);
        const bigBlindPlayer = players.find(p => p.position === gameState.bigBlindPosition);

        if (smallBlindPlayer && smallBlindPlayer.status === 'active') {
            const sbAmount = Math.min(gameState.blinds.small, smallBlindPlayer.chips);
            smallBlindPlayer.chips -= sbAmount;
            smallBlindPlayer.currentBet = sbAmount;
            smallBlindPlayer.totalBet += sbAmount;
            gameState.pot += sbAmount;
        }

        if (bigBlindPlayer && bigBlindPlayer.status === 'active') {
            const bbAmount = Math.min(gameState.blinds.big, bigBlindPlayer.chips);
            bigBlindPlayer.chips -= bbAmount;
            bigBlindPlayer.currentBet = bbAmount;
            bigBlindPlayer.totalBet += bbAmount;
            gameState.pot += bbAmount;
        }
    }

    private setPositions(gameState: GameState): void {
        const players = Array.from(gameState.players.values());

        // Set dealer button
        players.forEach((p: PlayerState) => {
            p.isDealer = p.position === gameState.dealerPosition;
            p.isSmallBlind = p.position === gameState.smallBlindPosition;
            p.isBigBlind = p.position === gameState.bigBlindPosition;
        });
    }

    private getNextActivePlayer(gameState: GameState, currentPosition: string | null): string | null {
        const allPlayers = Array.from(gameState.players.values());
        const players = allPlayers
            .filter((p: PlayerState) => p.status === 'active')
            .sort((a: PlayerState, b: PlayerState) => a.position - b.position);

        if (players.length === 0) return null;

        if (currentPosition === null) {
            return players[0].id;
        }

        const currentPlayer = gameState.players.get(currentPosition);
        if (!currentPlayer) return players[0].id;

        // Find next player after current position
        let nextIndex = players.findIndex(p => p.position > currentPlayer.position);
        if (nextIndex === -1) {
            nextIndex = 0; // Wrap around
        }

        return players[nextIndex].id;
    }

    evaluateHands(gameState: GameState): Map<string, HandResult> {
        const results = new Map<string, HandResult>();

        for (const [playerId, player] of gameState.players) {
            if (player.status !== 'folded' && player.cards.length > 0) {
                const allCards = [...player.cards, ...gameState.communityCards];
                const handResult = this.handEvaluator.evaluateHand(allCards);
                results.set(playerId, handResult);
            }
        }

        return results;
    }

    determineWinners(gameState: GameState): string[] {
        const handResults = this.evaluateHands(gameState);
        const eligiblePlayers = Array.from(handResults.keys());

        if (eligiblePlayers.length === 0) return [];
        if (eligiblePlayers.length === 1) return eligiblePlayers;

        // Sort by hand strength (highest first)
        eligiblePlayers.sort((a, b) => {
            const handA = handResults.get(a)!;
            const handB = handResults.get(b)!;
            return this.handEvaluator.compareHands(handB, handA);
        });

        // Find all players with the best hand
        const bestHand = handResults.get(eligiblePlayers[0])!;
        const winners = eligiblePlayers.filter(playerId => {
            const hand = handResults.get(playerId)!;
            return this.handEvaluator.compareHands(hand, bestHand) === 0;
        });

        return winners;
    }

    awardPot(gameState: GameState, winners: string[]): GameState {
        const newState = { ...gameState };

        // Handle side pots if any all-in players
        const sidePots = this.calculateSidePots(newState);

        if (sidePots.length > 0) {
            this.distributeSidePots(newState, sidePots, winners);
        } else {
            // Simple main pot distribution
            const potShare = Math.floor(newState.pot / winners.length);
            const remainder = newState.pot % winners.length;

            for (let i = 0; i < winners.length; i++) {
                const winner = newState.players.get(winners[i]);
                if (winner) {
                    winner.chips += potShare + (i < remainder ? 1 : 0);
                }
            }
        }

        // Reset pot
        newState.pot = 0;
        newState.sidePots = [];
        newState.phase = 'finished';

        logger.info(`Pot awarded to winners: ${winners.join(', ')}`);
        return newState;
    }

    isGameFinished(gameState: GameState): boolean {
        const activePlayers = Array.from(gameState.players.values()).filter(p =>
            p.status === 'active' || p.status === 'all-in'
        );

        return activePlayers.length <= 1 || gameState.phase === 'finished';
    }

    getValidActions(gameState: GameState, playerId: string): string[] {
        const player = gameState.players.get(playerId);
        if (!player || player.status !== 'active' || gameState.currentPlayer !== playerId) {
            return [];
        }

        const actions = ['fold'];
        const players = Array.from(gameState.players.values());
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));
        const callAmount = maxBet - player.currentBet;

        if (callAmount === 0) {
            actions.push('check');
        } else {
            actions.push('call');
        }

        if (player.chips > 0) {
            if (callAmount === 0) {
                actions.push('bet');
            } else {
                actions.push('raise');
            }
            actions.push('all-in');
        }

        return actions;
    }

    calculatePotOdds(gameState: GameState, betAmount: number): number {
        const potSize = gameState.pot;
        return betAmount / (potSize + betAmount);
    }

    private validateAction(gameState: GameState, action: PlayerAction): void {
        // Validate action structure
        if (!action.playerId || !action.type) {
            throw new Error('Invalid action: missing required fields');
        }

        // Validate action types
        const validActions = ['fold', 'check', 'call', 'bet', 'raise', 'all-in'];
        if (!validActions.includes(action.type)) {
            throw new Error(`Invalid action type: ${action.type}`);
        }

        // Validate bet amounts
        if ((action.type === 'bet' || action.type === 'raise') && (!action.amount || action.amount <= 0)) {
            throw new Error('Bet/raise amount must be positive');
        }

        // Validate timing
        if (gameState.phase === 'finished' || gameState.phase === 'showdown') {
            throw new Error('Cannot perform actions in current game phase');
        }
    }

    private calculateSidePots(gameState: GameState): SidePot[] {
        const players = Array.from(gameState.players.values());
        const allInPlayers = players.filter(p => p.status === 'all-in');

        if (allInPlayers.length === 0) {
            return [];
        }

        const sidePots: SidePot[] = [];
        const betLevels = [...new Set(players.map(p => p.totalBet))].sort((a, b) => a - b);

        let previousLevel = 0;

        for (const level of betLevels) {
            if (level > previousLevel) {
                const eligiblePlayers = players.filter(p => p.totalBet >= level);
                const potAmount = (level - previousLevel) * eligiblePlayers.length;

                if (potAmount > 0) {
                    sidePots.push({
                        amount: potAmount,
                        eligiblePlayers: eligiblePlayers.map(p => p.id)
                    });
                }

                previousLevel = level;
            }
        }

        return sidePots;
    }

    private distributeSidePots(gameState: GameState, sidePots: SidePot[], winners: string[]): void {
        for (const sidePot of sidePots) {
            const eligibleWinners = winners.filter(w => sidePot.eligiblePlayers.includes(w));

            if (eligibleWinners.length > 0) {
                const share = Math.floor(sidePot.amount / eligibleWinners.length);
                const remainder = sidePot.amount % eligibleWinners.length;

                for (let i = 0; i < eligibleWinners.length; i++) {
                    const winner = gameState.players.get(eligibleWinners[i]);
                    if (winner) {
                        winner.chips += share + (i < remainder ? 1 : 0);
                    }
                }
            }
        }
    }

    resetForNewHand(gameState: GameState): GameState {
        const newState = { ...gameState };

        // Move dealer button
        const activePlayers = Array.from(newState.players.values()).filter(p => p.chips > 0);
        if (activePlayers.length >= 2) {
            newState.dealerPosition = (newState.dealerPosition + 1) % activePlayers.length;
            newState.smallBlindPosition = (newState.dealerPosition + 1) % activePlayers.length;
            newState.bigBlindPosition = (newState.dealerPosition + 2) % activePlayers.length;
        }

        // Reset player states
        for (const player of newState.players.values()) {
            player.cards = [];
            player.currentBet = 0;
            player.totalBet = 0;
            player.hasActed = false;
            player.isDealer = false;
            player.isSmallBlind = false;
            player.isBigBlind = false;

            // Reset status if not broke
            if (player.chips > 0) {
                player.status = 'active';
            } else {
                player.status = 'sitting-out';
            }
        }

        // Reset game state
        newState.phase = 'preflop';
        newState.pot = 0;
        newState.sidePots = [];
        newState.communityCards = [];
        newState.currentPlayer = null;
        newState.lastAction = undefined;
        newState.actionStartTime = undefined;
        newState.round++;

        return newState;
    }
}
