import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface ChatMessage {
  id: string
  user: string
  message: string
  timestamp: number
}

interface ChatState {
  messages: ChatMessage[]
  isConnected: boolean
}

const initialState: ChatState = {
  messages: [],
  isConnected: false
}

export const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<ChatMessage>) => {
      state.messages.push(action.payload)
    },
    setConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload
    },
    clearMessages: (state) => {
      state.messages = []
    }
  }
})

export const { addMessage, setConnected, clearMessages } = chatSlice.actions
export default chatSlice.reducer