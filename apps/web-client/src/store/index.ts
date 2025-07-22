import { configureStore } from '@reduxjs/toolkit';
import { enableMapSet } from 'immer';
import authSlice from './slices/authSlice';
import gameSlice from './slices/gameSlice';
import tableSlice from './slices/tableSlice';
import uiSlice from './slices/uiSlice';

// Enable Immer MapSet support
enableMapSet();

export const store = configureStore({
    reducer: {
        auth: authSlice,
        game: gameSlice,
        table: tableSlice,
        ui: uiSlice,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
                ignoredPaths: [
                    'register',
                ],
            },
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 