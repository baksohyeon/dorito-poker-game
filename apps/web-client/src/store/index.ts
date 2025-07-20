
// apps/web-client/src/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/auth.slice';
import gameSlice from './slices/game.slice';
import uiSlice from './slices/ui.slice';

export const store = configureStore({
    reducer: {
        auth: authSlice,
        game: gameSlice,
        ui: uiSlice
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
            }
        })
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
