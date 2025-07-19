import { configureStore } from '@reduxjs/toolkit'
import { authSlice } from './slices/authSlice'
import { gameSlice } from './slices/gameSlice'
import { tableSlice } from './slices/tableSlice'
import { uiSlice } from './slices/uiSlice'
import { chatSlice } from './slices/chatSlice'
import { lobbySlice } from './slices/lobbySlice'

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    game: gameSlice.reducer,
    table: tableSlice.reducer,
    ui: uiSlice.reducer,
    chat: chatSlice.reducer,
    lobby: lobbySlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'game/updateGameState',
          'table/updateTable',
          'chat/addMessage'
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: [
          'game.gameState.players',
          'game.gameState.lastAction.timestamp',
          'chat.messages'
        ],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
