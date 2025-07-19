import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UiState {
  sidebarOpen: boolean
  screenSize: 'mobile' | 'tablet' | 'desktop'
  theme: 'light' | 'dark'
  notifications: any[]
}

const initialState: UiState = {
  sidebarOpen: false,
  screenSize: 'desktop',
  theme: 'dark',
  notifications: []
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setScreenSize: (state, action: PayloadAction<UiState['screenSize']>) => {
      state.screenSize = action.payload
    },
    setTheme: (state, action: PayloadAction<UiState['theme']>) => {
      state.theme = action.payload
    },
    addNotification: (state, action: PayloadAction<any>) => {
      state.notifications.push(action.payload)
    }
  }
})

export const { toggleSidebar, setScreenSize, setTheme, addNotification } = uiSlice.actions
export default uiSlice.reducer
