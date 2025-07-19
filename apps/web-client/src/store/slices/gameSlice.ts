import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerState, PlayerAction, Card } from '@shared/types/game.types';

interface GameSliceState {
    currentGame: GameState | null;
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
    currentGame: null,
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
            state.currentGame = action.payload;
            state.isPlaying = true;
        },
        updateGameState: (state, action: PayloadAction<Partial<GameState>>) => {
            if (state.currentGame) {
                state.currentGame = { ...state.currentGame, ...action.payload };
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
            if (state.currentGame && state.currentGame.players.has(action.payload.playerId)) {
                const player = state.currentGame.players.get(action.payload.playerId)!;
                state.currentGame.players.set(action.payload.playerId, { ...player, ...action.payload.updates });
            }
        },
        leaveGame: (state) => {
            state.currentGame = null;
            state.isPlaying = false;
            state.myCards = [];
            state.myPosition = null;
            state.canAct = false;
            state.validActions = [];
            state.handHistory = [];
            state.showCards = false;
            state.potWinAnimation = false;
            state.dealAnimation = false;
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