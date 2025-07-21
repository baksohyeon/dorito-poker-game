import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerState, PlayerAction, Card, GamePhase } from '@shared/types/game.types';

interface GameSliceState extends GameState {
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
    players: new Map(),
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
            return {
                ...state,
                ...action.payload,
                isPlaying: true,
            };
        },
        updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
            return {
                ...state,
                ...action.payload,
            };
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
            if (state.players.has(action.payload.playerId)) {
                const player = state.players.get(action.payload.playerId)!;
                state.players.set(action.payload.playerId, { ...player, ...action.payload.updates });
            }
        },
        leaveGame: () => {
            return initialState;
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
} = gameSlice.actions;

export default gameSlice.reducer; 