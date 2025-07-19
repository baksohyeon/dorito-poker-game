import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Table, TableInfo } from '@shared/types/table.types';
import { tableService } from '../../services/tableService';

interface TableSliceState {
    availableTables: TableInfo[];
    currentTable: Table | null;
    loading: boolean;
    error: string | null;
    isSeated: boolean;
    seatNumber: number | null;
    lobbyFilters: {
        gameType: string;
        blindRange: [number, number];
        playerCount: [number, number];
        showPrivate: boolean;
    };
}

const initialState: TableSliceState = {
    availableTables: [],
    currentTable: null,
    loading: false,
    error: null,
    isSeated: false,
    seatNumber: null,
    lobbyFilters: {
        gameType: 'all',
        blindRange: [0, 1000],
        playerCount: [1, 10],
        showPrivate: false,
    },
};

// Async thunks
export const fetchTables = createAsyncThunk<TableInfo[], void>(
    'table/fetchTables',
    async (_, { rejectWithValue }) => {
        try {
            const tables = await tableService.getAvailableTables();
            return tables;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to fetch tables');
        }
    }
);

export const joinTable = createAsyncThunk<Table, { tableId: string; seatNumber?: number }>(
    'table/joinTable',
    async ({ tableId, seatNumber }, { rejectWithValue }) => {
        try {
            const table = await tableService.joinTable(tableId, seatNumber);
            return table;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to join table');
        }
    }
);

export const leaveTable = createAsyncThunk<void, string>(
    'table/leaveTable',
    async (tableId, { rejectWithValue }) => {
        try {
            await tableService.leaveTable(tableId);
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to leave table');
        }
    }
);

export const createTable = createAsyncThunk<Table, any>(
    'table/createTable',
    async (tableConfig, { rejectWithValue }) => {
        try {
            const table = await tableService.createTable(tableConfig);
            return table;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Failed to create table');
        }
    }
);

const tableSlice = createSlice({
    name: 'table',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateLobbyFilters: (state, action: PayloadAction<Partial<typeof initialState.lobbyFilters>>) => {
            state.lobbyFilters = { ...state.lobbyFilters, ...action.payload };
        },
        setCurrentTable: (state, action: PayloadAction<Table>) => {
            state.currentTable = action.payload;
        },
        updateTableInfo: (state, action: PayloadAction<Partial<Table>>) => {
            if (state.currentTable) {
                state.currentTable = { ...state.currentTable, ...action.payload };
            }
        },
        setSeatNumber: (state, action: PayloadAction<number>) => {
            state.seatNumber = action.payload;
            state.isSeated = true;
        },
        clearTable: (state) => {
            state.currentTable = null;
            state.isSeated = false;
            state.seatNumber = null;
            state.error = null;
        },
        updateTableList: (state, action: PayloadAction<TableInfo[]>) => {
            state.availableTables = action.payload;
        },
        addTable: (state, action: PayloadAction<TableInfo>) => {
            state.availableTables.push(action.payload);
        },
        removeTable: (state, action: PayloadAction<string>) => {
            state.availableTables = state.availableTables.filter((table: TableInfo) => table.id !== action.payload);
        },
        updateTableInList: (state, action: PayloadAction<{ id: string; updates: Partial<TableInfo> }>) => {
            const index = state.availableTables.findIndex((table: TableInfo) => table.id === action.payload.id);
            if (index !== -1) {
                state.availableTables[index] = { ...state.availableTables[index], ...action.payload.updates };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTables.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchTables.fulfilled, (state, action) => {
                state.loading = false;
                state.availableTables = action.payload;
            })
            .addCase(fetchTables.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(joinTable.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinTable.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTable = action.payload;
                state.isSeated = true;
            })
            .addCase(joinTable.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(leaveTable.fulfilled, (state) => {
                state.currentTable = null;
                state.isSeated = false;
                state.seatNumber = null;
            })
            .addCase(createTable.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createTable.fulfilled, (state, action) => {
                state.loading = false;
                state.currentTable = action.payload;
                state.isSeated = true;
            })
            .addCase(createTable.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const {
    clearError,
    updateLobbyFilters,
    setCurrentTable,
    updateTableInfo,
    setSeatNumber,
    clearTable,
    updateTableList,
    addTable,
    removeTable,
    updateTableInList,
} = tableSlice.actions;

export default tableSlice.reducer; 