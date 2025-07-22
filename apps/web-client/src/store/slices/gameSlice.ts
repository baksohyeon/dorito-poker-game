import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerState, PlayerAction, Card, GamePhase } from '@shared/types/game.types';

interface GameSliceState extends Omit<GameState, 'players'> {
    players: Record<string, PlayerState>; // Use object instead of Map
    isPlaying: boolean;
    myCards: Card[];
    myPosition: number | null;
    canAct: boolean;
    validActions: string[];
    handHistory: PlayerAction[];
    showCards: boolean;
    potWinAnimation: boolean;
    dealAnimation: boolean;
}

const initialState: GameSliceState = {
    id: '',
    tableId: '',
    phase: 'preflop' as GamePhase,
    pot: 0,
    sidePots: [],
    communityCards: [],
    burnCards: [],
    currentPlayer: null,
    dealerPosition: 0,
    smallBlindPosition: 0,
    bigBlindPosition: 0,
    players: {},
    blinds: {
        small: 0,
        big: 0,
    },
    bettingLimit: 'no-limit',
    round: 0,
    handNumber: 0,
    actionHistory: [],
    actionTimeLimit: 30,
    minRaise: 0,
    totalActions: 0,
    isHeadsUp: false,
    rakeAmount: 0,
    rakePercent: 0,
    gameType: 'texas-holdem',
    tableConfig: {
        id: '',
        name: '',
        maxPlayers: 9,
        minPlayers: 2,
        blinds: {
            small: 0,
            big: 0,
        },
        buyIn: {
            min: 0,
            max: 0,
            defaultAmount: 0,
            allowShortBuy: false,
            shortBuyMin: 0,
        },
        gameType: 'texas-holdem',
        bettingLimit: 'no-limit',
        isPrivate: false,
        timeLimit: 30,
        timeBankSeconds: 60,
        rakePercent: 0,
        rakeCap: 0,
        allowRebuy: true,
        rebuyLimit: 3,
        allowObservers: true,
        autoStartMinPlayers: 2,
        tags: [],
        createdBy: '',
        createdAt: 0,
        status: 'waiting',
        isTournament: false,
    },
    stateVersion: 0,
    createdAt: 0,
    updatedAt: 0,
    isPlaying: false,
    myCards: [],
    myPosition: null,
    canAct: false,
    validActions: [],
    handHistory: [],
    showCards: false,
    potWinAnimation: false,
    dealAnimation: false,
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        setCurrentGame: (state, action: PayloadAction<GameState>) => {
            const gameState = action.payload;
            // Convert Map to object for players
            const players = gameState.players instanceof Map 
                ? Object.fromEntries(gameState.players.entries())
                : gameState.players;
            
            Object.assign(state, {
                ...gameState,
                players,
                isPlaying: true,
            });
        },
        updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
            const updates = action.payload;
            // Convert Map to object for players if present
            if (updates.players) {
                const players = updates.players instanceof Map 
                    ? Object.fromEntries(updates.players.entries())
                    : updates.players;
                Object.assign(state, { ...updates, players });
            } else {
                Object.assign(state, updates);
            }
        },
        setMyCards: (state, action: PayloadAction<Card[]>) => {
            state.myCards = action.payload;
        },
        setMyPosition: (state, action: PayloadAction<number>) => {
            state.myPosition = action.payload;
        },
        setCanAct: (state, action: PayloadAction<boolean>) => {
            state.canAct = action.payload;
        },
        setValidActions: (state, action: PayloadAction<string[]>) => {
            state.validActions = action.payload;
        },
        addActionToHistory: (state, action: PayloadAction<PlayerAction>) => {
            state.handHistory.push(action.payload);
        },
        clearHandHistory: (state) => {
            state.handHistory = [];
        },
        setShowCards: (state, action: PayloadAction<boolean>) => {
            state.showCards = action.payload;
        },
        triggerPotWinAnimation: (state) => {
            state.potWinAnimation = true;
        },
        clearPotWinAnimation: (state) => {
            state.potWinAnimation = false;
        },
        triggerDealAnimation: (state) => {
            state.dealAnimation = true;
        },
        clearDealAnimation: (state) => {
            state.dealAnimation = false;
        },
        updatePlayer: (state, action: PayloadAction<{ playerId: string; updates: Partial<PlayerState> }>) => {
            if (state.players[action.payload.playerId]) {
                state.players[action.payload.playerId] = { 
                    ...state.players[action.payload.playerId], 
                    ...action.payload.updates 
                };
            }
        },
        leaveGame: () => {
            return initialState;
        },
        // Enhanced game flow integration
        updateGamePhase: (state, action: PayloadAction<{ phase: GamePhase; nextPhase?: GamePhase }>) => {
            state.phase = action.payload.phase;
            // Trigger animations based on phase
            if (action.payload.phase === 'flop' || action.payload.phase === 'turn' || action.payload.phase === 'river') {
                state.dealAnimation = true;
            }
            if (action.payload.phase === 'showdown') {
                state.showCards = true;
            }
            if (action.payload.phase === 'finished') {
                state.potWinAnimation = true;
            }
        },
        connectToTable: (state, action: PayloadAction<{ tableId: string; sessionId: string }>) => {
            state.tableId = action.payload.tableId;
            state.id = action.payload.sessionId;
        },
        updateConnectionStatus: () => {
            // Handle connection status changes
        },
        setActionTimer: () => {
            // Action timer is handled in the UI layer, not in player state
            // This can be used to trigger UI updates for timer display
        },
        updatePlayerChips: (state, action: PayloadAction<{ playerId: string; chips: number; currentBet?: number }>) => {
            const player = state.players[action.payload.playerId];
            if (player) {
                player.chips = action.payload.chips;
                if (action.payload.currentBet !== undefined) {
                    player.currentBet = action.payload.currentBet;
                }
            }
        },
        addToPot: (state, action: PayloadAction<number>) => {
            state.pot += action.payload;
        },
        dealCommunityCards: (state, action: PayloadAction<Card[]>) => {
            state.communityCards = [...state.communityCards, ...action.payload];
            state.dealAnimation = true;
        },
        setBettingOptions: (state, action: PayloadAction<{ canFold: boolean; canCheck: boolean; canCall: boolean; canBet: boolean; canRaise: boolean; minBet: number; maxRaise: number; callAmount: number }>) => {
            const options = action.payload;
            state.validActions = [];
            
            if (options.canFold) state.validActions.push('fold');
            if (options.canCheck) state.validActions.push('check');
            if (options.canCall) state.validActions.push('call');
            if (options.canBet) state.validActions.push('bet');
            if (options.canRaise) state.validActions.push('raise');
        },
        processPlayerAction: (state, action: PayloadAction<PlayerAction>) => {
            // Add to action history
            state.actionHistory.push(action.payload);
            state.handHistory.push(action.payload);
            
            // Update current player
            const playerIds = Object.keys(state.players);
            const nextPlayerIndex = state.actionHistory.length % playerIds.length;
            state.currentPlayer = playerIds[nextPlayerIndex] || null;
            
            // Reset action state
            state.canAct = false;
            state.validActions = [];
        },
        updateHandResults: (state, action: PayloadAction<{ winners: string[]; potDistribution: number }>) => {
            state.potWinAnimation = true;
            // Update player profits based on results
            for (const winnerId of action.payload.winners) {
                const winner = state.players[winnerId];
                if (winner) {
                    winner.chips += action.payload.potDistribution / action.payload.winners.length;
                }
            }
        },
        resetForNewHand: (state) => {
            state.communityCards = [];
            state.burnCards = [];
            state.myCards = [];
            state.actionHistory = [];
            state.handHistory = [];
            state.pot = 0;
            state.sidePots = [];
            state.showCards = false;
            state.potWinAnimation = false;
            state.dealAnimation = false;
            state.canAct = false;
            state.validActions = [];
            state.currentPlayer = null;
            
            // Reset player states for new hand
            for (const playerId of Object.keys(state.players)) {
                const player = state.players[playerId];
                if (player) {
                    state.players[playerId] = {
                        ...player,
                        currentBet: 0,
                        hasActed: false
                    };
                }
            }
            
            state.handNumber += 1;
            state.round = 0;
        },
    },
});

export const {
    setCurrentGame,
    updateGameState,
    setMyCards,
    setMyPosition,
    setCanAct,
    setValidActions,
    addActionToHistory,
    clearHandHistory,
    setShowCards,
    triggerPotWinAnimation,
    clearPotWinAnimation,
    triggerDealAnimation,
    clearDealAnimation,
    updatePlayer,
    leaveGame,
    // Enhanced actions
    updateGamePhase,
    connectToTable,
    updateConnectionStatus,
    setActionTimer,
    updatePlayerChips,
    addToPot,
    dealCommunityCards,
    setBettingOptions,
    processPlayerAction,
    updateHandResults,
    resetForNewHand,
} = gameSlice.actions;

export default gameSlice.reducer; 