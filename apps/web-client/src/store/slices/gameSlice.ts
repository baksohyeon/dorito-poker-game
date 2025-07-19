import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface GameState {
  currentGame: any | null
  isInGame: boolean
  connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'reconnecting'
}

const initialState: GameState = {
  currentGame: null,
  isInGame: false,
  connectionStatus: 'disconnected'
}

export const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setConnectionStatus: (state, action: PayloadAction<GameState['connectionStatus']>) => {
      state.connectionStatus = action.payload
    },
    joinGame: (state, action: PayloadAction<any>) => {
      state.currentGame = action.payload
      state.isInGame = true
    },
    leaveGame: (state) => {
      state.currentGame = null
      state.isInGame = false
    }
  }
})

export const { setConnectionStatus, joinGame, leaveGame } = gameSlice.actions
export default gameSlice.reducer
