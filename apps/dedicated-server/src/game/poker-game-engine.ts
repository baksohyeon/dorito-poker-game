
// apps/dedicated-server/src/game/poker-game-engine.ts
import {
    GameState,
    PlayerAction,
    PlayerState,
    Card,
    HandResult,
    SidePot,
    TableConfig,
    ActionValidationResult,
    BettingOptions,
    GameFlow,
    GameTransition,
    RakeCalculation,
    GamePhase,
    TransitionTrigger,
    PotWinner,
    BlindStructure
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

    createGame(tableConfig: TableConfig, players: PlayerState[]): GameState {
        if (players.length < 2) {
            throw new Error('At least 2 players required');
        }

        const gameId = `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = Date.now();

        // Initialize players with enhanced properties
        const enhancedPlayers = new Map(players.map(p => [
            p.id, 
            {
                ...p,
                startingChips: p.chips,
                totalInvested: 0,
                holeCards: [],
                seatNumber: p.position,
                actionsThisRound: 0,
                isInPosition: false,
                timeBank: tableConfig.timeBankSeconds * 1000,
                sessionStats: {
                    handsPlayed: 0,
                    handsWon: 0,
                    totalProfit: 0,
                    vpip: 0,
                    pfr: 0,
                    aggression: 0,
                    showdownWinRate: 0,
                    foldToBet: 0,
                    foldToRaise: 0,
                    cBetFreq: 0,
                    threeBetFreq: 0,
                    bigBlindsWon: 0
                },
                isObserver: false,
                canRebuy: tableConfig.allowRebuy,
                rebuyCount: 0
            }
        ]));

        const gameState: GameState = {
            id: gameId,
            tableId: tableConfig.id,
            phase: 'preflop' as GamePhase,
            pot: 0,
            sidePots: [],
            communityCards: [],
            burnCards: [],
            currentPlayer: null,
            dealerPosition: 0,
            smallBlindPosition: 1 % players.length,
            bigBlindPosition: 2 % players.length,
            players: enhancedPlayers,
            blinds: {
                ...tableConfig.blinds,
                level: 1,
                nextLevelAt: tableConfig.blindLevelDuration ? now + (tableConfig.blindLevelDuration * 60 * 1000) : undefined,
                timeRemaining: tableConfig.blindLevelDuration ? tableConfig.blindLevelDuration * 60 : undefined
            },
            bettingLimit: tableConfig.bettingLimit,
            round: 1,
            handNumber: 1,
            lastAction: undefined,
            actionHistory: [],
            actionStartTime: undefined,
            actionTimeLimit: tableConfig.timeLimit * 1000,
            minRaise: tableConfig.blinds.big,
            totalActions: 0,
            isHeadsUp: players.length === 2,
            rakeAmount: 0,
            rakePercent: tableConfig.rakePercent,
            gameType: tableConfig.gameType,
            tableConfig: tableConfig,
            stateVersion: 1,
            createdAt: now,
            updatedAt: now
        };

        // Set dealer, small blind, and big blind
        this.setPositions(gameState);

        logger.info(`Game created: ${gameId} for table ${tableConfig.id}`);
        return gameState;
    }

    validateAction(gameState: GameState, action: PlayerAction): ActionValidationResult {
        // Enhanced validation with detailed error reporting
        if (!action.playerId || !action.type) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.INVALID_ACTION_TYPE,
                message: 'Invalid action: missing required fields',
                suggestedActions: this.getValidActions(gameState, action.playerId || '')
            };
        }

        const player = gameState.players.get(action.playerId);
        if (!player) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.INVALID_PLAYER,
                message: 'Player not found',
                suggestedActions: []
            };
        }

        if (gameState.currentPlayer !== action.playerId) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.NOT_YOUR_TURN,
                message: 'Not your turn to act',
                suggestedActions: []
            };
        }

        // Check action timeout
        if (gameState.actionStartTime && Date.now() - gameState.actionStartTime > gameState.actionTimeLimit) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.ACTION_TIMEOUT,
                message: 'Action timeout exceeded',
                suggestedActions: ['fold']
            };
        }

        // Validate action types
        const validActions = this.getValidActions(gameState, action.playerId);
        if (!validActions.includes(action.type)) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.INVALID_ACTION_TYPE,
                message: `Action '${action.type}' is not valid in current situation`,
                suggestedActions: validActions
            };
        }

        // Validate bet amounts
        if ((action.type === 'bet' || action.type === 'raise') && (!action.amount || action.amount <= 0)) {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.INVALID_AMOUNT,
                message: 'Bet/raise amount must be positive',
                suggestedActions: validActions
            };
        }

        // Validate timing
        if (gameState.phase === 'finished' || gameState.phase === 'showdown') {
            return {
                isValid: false,
                errorCode: GAME_CONSTANTS.ACTION_ERROR_CODES.GAME_FINISHED,
                message: 'Cannot perform actions in current game phase',
                suggestedActions: []
            };
        }

        return { isValid: true };
    }

    getBettingOptions(gameState: GameState, playerId: string): BettingOptions {
        const player = gameState.players.get(playerId);
        if (!player || player.status !== 'active' || gameState.currentPlayer !== playerId) {
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
        const maxBet = Math.max(...players.map((p: PlayerState) => p.currentBet));
        const callAmount = maxBet - player.currentBet;
        const minBet = gameState.blinds.big;
        const minRaise = Math.max(gameState.minRaise, maxBet * 2 - player.currentBet);
        const maxRaise = player.chips + player.currentBet;

        return {
            canFold: true,
            canCheck: callAmount === 0,
            canCall: callAmount > 0 && callAmount < player.chips,
            canBet: callAmount === 0 && player.chips >= minBet,
            canRaise: callAmount > 0 && player.chips > callAmount && (player.chips + player.currentBet) >= minRaise,
            canAllIn: player.chips > 0,
            callAmount,
            minBet,
            minRaise,
            maxRaise,
            potSize: gameState.pot
        };
    }

    calculateRake(gameState: GameState): RakeCalculation {
        const potSize = gameState.pot;
        const rakePercent = gameState.rakePercent;
        const rakeCap = gameState.tableConfig.rakeCap;
        
        // No rake if pot is too small or no flop seen (no flop no drop rule)
        if (potSize < GAME_CONSTANTS.RAKE_SETTINGS.MIN_RAKE_POT || 
            (GAME_CONSTANTS.RAKE_SETTINGS.NO_FLOP_NO_DROP && gameState.phase === 'preflop')) {
            return {
                potSize,
                rakePercent: 0,
                rakeCap,
                rakeAmount: 0,
                netPot: potSize,
                playersContributing: Array.from(gameState.players.keys()).filter(id => {
                    const player = gameState.players.get(id);
                    return player && player.totalBet > 0;
                })
            };
        }

        const rakeAmount = Math.min(potSize * (rakePercent / 100), rakeCap);
        const netPot = potSize - rakeAmount;

        return {
            potSize,
            rakePercent,
            rakeCap,
            rakeAmount,
            netPot,
            playersContributing: Array.from(gameState.players.keys()).filter(id => {
                const player = gameState.players.get(id);
                return player && player.totalBet > 0;
            })
        };
    }

    dealCards(gameState: GameState): GameState {
        const newState = { ...gameState };

        // Shuffle deck
        this.deck.shuffle();

        // Deal 2 cards to each active player
        for (const [playerId, player] of newState.players) {
            if (player.status === 'active') {
                player.cards = this.deck.deal(2);
                player.holeCards = [...player.cards]; // Store original hole cards
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
        const validation = this.validateAction(gameState, action);
        if (!validation.isValid) {
            throw new Error(`${validation.errorCode}: ${validation.message}`);
        }

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

            // Update action tracking
            newState.lastAction = action;
            newState.actionHistory.push(action);
            newState.totalActions++;
            newState.stateVersion++;
            newState.updatedAt = Date.now();
            player.hasActed = true;
            player.actionsThisRound++;
            player.lastActionTime = Date.now();
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
                // Burn one card before the flop
                if (this.deck.getRemainingCount() > 0) {
                    gameState.burnCards.push(...this.deck.deal(1));
                }
                gameState.communityCards = this.deck.deal(3);
                break;
            case 'flop':
                gameState.phase = 'turn';
                // Burn one card before the turn
                if (this.deck.getRemainingCount() > 0) {
                    gameState.burnCards.push(...this.deck.deal(1));
                }
                gameState.communityCards.push(...this.deck.deal(1));
                break;
            case 'turn':
                gameState.phase = 'river';
                // Burn one card before the river
                if (this.deck.getRemainingCount() > 0) {
                    gameState.burnCards.push(...this.deck.deal(1));
                }
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
                        id: `sidepot_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        amount: potAmount,
                        eligiblePlayers: eligiblePlayers.map(p => p.id),
                        winners: [],
                        isMainPot: sidePots.length === 0,
                        maxContribution: level
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
        newState.burnCards = [];
        newState.currentPlayer = null;
        newState.lastAction = undefined;
        newState.actionHistory = [];
        newState.actionStartTime = undefined;
        newState.handNumber++;
        newState.totalActions = 0;
        newState.minRaise = newState.blinds.big;
        newState.rakeAmount = 0;
        newState.stateVersion++;
        newState.updatedAt = Date.now();
        newState.round++;

        return newState;
    }

    getGameFlow(gameState: GameState): GameFlow {
        const waitingPlayers = this.getWaitingPlayers(gameState);
        const completedActions = new Map<string, PlayerAction>();
        const pendingActions = new Map<string, BettingOptions>();

        // Build completed actions map
        for (const action of gameState.actionHistory) {
            if (this.isActionInCurrentPhase(action, gameState.phase)) {
                completedActions.set(action.playerId, action);
            }
        }

        // Build pending actions map
        for (const [playerId, player] of gameState.players) {
            if (player.status === 'active' && !completedActions.has(playerId)) {
                pendingActions.set(playerId, this.getBettingOptions(gameState, playerId));
            }
        }

        return {
            currentPhase: gameState.phase,
            nextPhase: this.getNextPhase(gameState.phase) || undefined,
            canAdvancePhase: this.canAdvancePhase(gameState),
            phaseActions: gameState.actionHistory.filter(a => this.isActionInCurrentPhase(a, gameState.phase)),
            phaseDuration: Date.now() - (gameState.actionStartTime || gameState.createdAt),
            phaseStartTime: gameState.actionStartTime || gameState.createdAt,
            waitingForPlayers: waitingPlayers,
            completedActions,
            pendingActions
        };
    }

    advancePhase(gameState: GameState): GameTransition {
        const from = gameState.phase;
        let to: GamePhase;
        let trigger: TransitionTrigger;

        // Determine next phase
        switch (gameState.phase) {
            case 'preflop':
                to = 'flop';
                trigger = 'betting-complete';
                break;
            case 'flop':
                to = 'turn';
                trigger = 'betting-complete';
                break;
            case 'turn':
                to = 'river';
                trigger = 'betting-complete';
                break;
            case 'river':
                to = 'showdown';
                trigger = 'showdown-required';
                break;
            case 'showdown':
                to = 'finished';
                trigger = 'game-finished';
                break;
            default:
                to = 'finished';
                trigger = 'manual';
        }

        const activePlayers = Array.from(gameState.players.values()).filter(p => 
            p.status === 'active' || p.status === 'all-in'
        );

        return {
            from,
            to,
            trigger,
            timestamp: Date.now(),
            playersInvolved: activePlayers.map(p => p.id),
            data: {
                communityCards: gameState.communityCards.length,
                pot: gameState.pot,
                activePlayers: activePlayers.length
            }
        };
    }

    canStartGame(players: PlayerState[]): boolean {
        const activePlayers = players.filter(p => p.status === 'active' && p.chips > 0);
        return activePlayers.length >= 2;
    }

    calculateEffectiveStack(gameState: GameState, playerId: string): number {
        const player = gameState.players.get(playerId);
        if (!player) return 0;

        const otherPlayers = Array.from(gameState.players.values())
            .filter(p => p.id !== playerId && (p.status === 'active' || p.status === 'all-in'))
            .map(p => p.chips + p.currentBet)
            .sort((a, b) => a - b);

        if (otherPlayers.length === 0) return player.chips + player.currentBet;

        // Effective stack is the amount that can actually be won/lost
        return Math.min(player.chips + player.currentBet, otherPlayers[0] || 0);
    }

    getPlayerPosition(gameState: GameState, playerId: string): 'early' | 'middle' | 'late' | 'blinds' {
        const player = gameState.players.get(playerId);
        if (!player) return 'early';

        const activePlayers = Array.from(gameState.players.values())
            .filter(p => p.status === 'active')
            .sort((a, b) => a.position - b.position);

        const playerIndex = activePlayers.findIndex(p => p.id === playerId);
        const totalPlayers = activePlayers.length;

        // Small blind and big blind are always blinds position
        if (player.isSmallBlind || player.isBigBlind) {
            return 'blinds';
        }

        // Calculate position relative to dealer
        const dealerIndex = activePlayers.findIndex(p => p.isDealer);
        let relativePosition = (playerIndex - dealerIndex - 1 + totalPlayers) % totalPlayers;

        if (totalPlayers <= 6) {
            if (relativePosition <= 1) return 'early';
            if (relativePosition <= 3) return 'middle';
            return 'late';
        } else {
            if (relativePosition <= 2) return 'early';
            if (relativePosition <= 5) return 'middle';
            return 'late';
        }
    }

    private canAdvancePhase(gameState: GameState): boolean {
        return this.isBettingRoundComplete(gameState);
    }

    private getNextPhase(currentPhase: GamePhase): GamePhase | null {
        switch (currentPhase) {
            case 'preflop': return 'flop';
            case 'flop': return 'turn';
            case 'turn': return 'river';
            case 'river': return 'showdown';
            case 'showdown': return 'finished';
            default: return null;
        }
    }

    private getWaitingPlayers(gameState: GameState): string[] {
        const waitingPlayers: string[] = [];
        
        for (const [playerId, player] of gameState.players) {
            if (player.status === 'active' && !player.hasActed) {
                waitingPlayers.push(playerId);
            }
        }

        return waitingPlayers;
    }

    private isActionInCurrentPhase(action: PlayerAction, phase: GamePhase): boolean {
        // This is a simplified check - in a real implementation, you'd want to track
        // which phase each action occurred in
        return true; // For now, assume all actions in history are relevant
    }
}
