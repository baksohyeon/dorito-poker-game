import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface LobbyState {
  activeTables: any[]
  playerCount: number
  isLoading: boolean
}

const initialState: LobbyState = {
  activeTables: [],
  playerCount: 0,
  isLoading: false
}

export const lobbySlice = createSlice({
  name: 'lobby',
  initialState,
  reducers: {
    setActiveTables: (state, action: PayloadAction<any[]>) => {
      state.activeTables = action.payload
    },
    setPlayerCount: (state, action: PayloadAction<number>) => {
      state.playerCount = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { setActiveTables, setPlayerCount, setLoading } = lobbySlice.actions
export default lobbySlice.reducer