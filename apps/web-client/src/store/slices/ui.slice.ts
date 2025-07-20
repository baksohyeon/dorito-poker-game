// apps/web-client/src/store/slices/ui.slice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    soundEnabled: boolean;
    animationsEnabled: boolean;
}

const initialState: UIState = {
    sidebarOpen: false,
    theme: 'dark',
    soundEnabled: true,
    animationsEnabled: true
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
            state.theme = action.payload;
        },
        toggleSound: (state) => {
            state.soundEnabled = !state.soundEnabled;
        },
        setSoundEnabled: (state, action: PayloadAction<boolean>) => {
            state.soundEnabled = action.payload;
        },
        toggleAnimations: (state) => {
            state.animationsEnabled = !state.animationsEnabled;
        },
        setAnimationsEnabled: (state, action: PayloadAction<boolean>) => {
            state.animationsEnabled = action.payload;
        }
    }
});

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleSound,
    setSoundEnabled,
    toggleAnimations,
    setAnimationsEnabled
} = uiSlice.actions;

export default uiSlice.reducer; 