import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface TableState {
  currentTable: any | null
  tables: any[]
  isLoading: boolean
}

const initialState: TableState = {
  currentTable: null,
  tables: [],
  isLoading: false
}

export const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setCurrentTable: (state, action: PayloadAction<any>) => {
      state.currentTable = action.payload
    },
    setTables: (state, action: PayloadAction<any[]>) => {
      state.tables = action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  }
})

export const { setCurrentTable, setTables, setLoading } = tableSlice.actions
export default tableSlice.reducer
