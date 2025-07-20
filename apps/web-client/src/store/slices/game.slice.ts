// apps/web-client/src/store/slices/game.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GameState, PlayerState, PlayerAction, Card, HandResult } from '@poker-game/shared';

interface GameSliceState {
    // Connection state
    currentTable: string | null;
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;

    // Game state
    gameState: GameState | null;
    currentPlayerId: string | null;

    // Lobby state
    tables: any[];

    // UI state
    showHandHistory: boolean;
    showPotOdds: boolean;
    autoFold: boolean;
    autoCheck: boolean;

    // Game history
    handHistory: any[];
    playerStats: Map<string, any>;

    // Time management
    actionTimeRemaining: number;
    isActionTimeWarning: boolean;
}

const initialState: GameSliceState = {
    currentTable: null,
    isConnected: false,
    isLoading: false,
    error: null,
    gameState: null,
    currentPlayerId: null,
    tables: [],
    showHandHistory: false,
    showPotOdds: false,
    autoFold: false,
    autoCheck: false,
    handHistory: [],
    playerStats: new Map(),
    actionTimeRemaining: 0,
    isActionTimeWarning: false
};

// Async thunks
export const fetchTables = createAsyncThunk(
    'game/fetchTables',
    async (filters: any) => {
        // TODO: Implement actual API call
        // For now, return mock data
        return [
            {
                id: '1',
                name: 'High Stakes Table',
                gameType: 'texas-holdem',
                blinds: { small: 10, big: 20 },
                maxPlayers: 9,
                currentPlayers: 6,
                isPrivate: false
            },
            {
                id: '2',
                name: 'Beginner Table',
                gameType: 'texas-holdem',
                blinds: { small: 1, big: 2 },
                maxPlayers: 9,
                currentPlayers: 3,
                isPrivate: false
            }
        ];
    }
);

export const joinTable = createAsyncThunk(
    'game/joinTable',
    async (tableId: string) => {
        // TODO: Implement actual API call
        return { tableId, success: true };
    }
);

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Connection management
        setCurrentTable: (state, action: PayloadAction<string>) => {
            state.currentTable = action.payload;
        },
        clearCurrentTable: (state) => {
            state.currentTable = null;
            state.gameState = null;
            state.currentPlayerId = null;
        },
        setConnectionStatus: (state, action: PayloadAction<boolean>) => {
            state.isConnected = action.payload;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },

        // Game state management
        updateGameState: (state, action: PayloadAction<GameState>) => {
            state.gameState = action.payload;
        },
        setCurrentPlayerId: (state, action: PayloadAction<string>) => {
            state.currentPlayerId = action.payload;
        },

        // Player actions
        addPlayerAction: (state, action: PayloadAction<PlayerAction>) => {
            if (state.gameState) {
                // Update the last action in game state
                state.gameState.lastAction = action.payload;
            }
        },

        // UI state
        toggleHandHistory: (state) => {
            state.showHandHistory = !state.showHandHistory;
        },
        togglePotOdds: (state) => {
            state.showPotOdds = !state.showPotOdds;
        },
        setAutoFold: (state, action: PayloadAction<boolean>) => {
            state.autoFold = action.payload;
        },
        setAutoCheck: (state, action: PayloadAction<boolean>) => {
            state.autoCheck = action.payload;
        },

        // Game history
        addHandToHistory: (state, action: PayloadAction<any>) => {
            state.handHistory.unshift(action.payload);
            // Keep only last 50 hands
            if (state.handHistory.length > 50) {
                state.handHistory = state.handHistory.slice(0, 50);
            }
        },
        updatePlayerStats: (state, action: PayloadAction<{ playerId: string; stats: any }>) => {
            const { playerId, stats } = action.payload;
            state.playerStats.set(playerId, stats);
        },

        // Time management
        setActionTimeRemaining: (state, action: PayloadAction<number>) => {
            state.actionTimeRemaining = action.payload;
            state.isActionTimeWarning = action.payload <= 10 && action.payload > 0;
        },

        // Game events
        handlePlayerJoined: (state, action: PayloadAction<PlayerState>) => {
            if (state.gameState) {
                state.gameState.players.set(action.payload.id, action.payload);
            }
        },

        handlePlayerLeft: (state, action: PayloadAction<string>) => {
            if (state.gameState) {
                state.gameState.players.delete(action.payload);
            }
        },

        handleHandDealt: (state, action: PayloadAction<{ playerId: string; cards: Card[] }>) => {
            if (state.gameState) {
                const player = state.gameState.players.get(action.payload.playerId);
                if (player) {
                    player.cards = action.payload.cards;
                    state.gameState.players.set(action.payload.playerId, player);
                }
            }
        },

        handleCommunityCardsDealt: (state, action: PayloadAction<Card[]>) => {
            if (state.gameState) {
                state.gameState.communityCards = action.payload;
            }
        },

        handlePotWon: (state, action: PayloadAction<{ winnerId: string; amount: number; handResult: HandResult }>) => {
            // Add to hand history
            state.handHistory.unshift({
                type: 'potWon',
                data: action.payload,
                timestamp: Date.now()
            });
        },

        // Reset game state
        resetGameState: (state) => {
            state.gameState = null;
            state.currentPlayerId = null;
            state.actionTimeRemaining = 0;
            state.isActionTimeWarning = false;
        }
    },
    extraReducers: (builder) => {
        // Fetch tables
        builder
            .addCase(fetchTables.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.isLoading = false;
                state.tables = action.payload;
                state.error = null;
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to fetch tables';
            });

        // Join table
        builder
            .addCase(joinTable.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(joinTable.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentTable = action.payload.tableId;
                state.error = null;
            })
            .addCase(joinTable.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message || 'Failed to join table';
            });
    }
});

export const {
    setCurrentTable,
    clearCurrentTable,
    setConnectionStatus,
    setLoading,
    setError,
    clearError,
    updateGameState,
    setCurrentPlayerId,
    addPlayerAction,
    toggleHandHistory,
    togglePotOdds,
    setAutoFold,
    setAutoCheck,
    addHandToHistory,
    updatePlayerStats,
    setActionTimeRemaining,
    handlePlayerJoined,
    handlePlayerLeft,
    handleHandDealt,
    handleCommunityCardsDealt,
    handlePotWon,
    resetGameState
} = gameSlice.actions;

export default gameSlice.reducer; 