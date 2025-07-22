import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Modal {
    type: 'login' | 'register' | 'settings' | 'table-create' | 'hand-history' | 'ai-analysis' | null;
    isOpen: boolean;
    data?: any;
}

interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: number;
}

interface UIState {
    modal: Modal;
    notifications: Notification[];
    sidebarOpen: boolean;
    soundEnabled: boolean;
    animationsEnabled: boolean;
    theme: 'dark' | 'light';
    isMobile: boolean;
    connectionStatus: 'connected' | 'disconnected' | 'connecting' | 'error';
    aiPanelOpen: boolean;
    handHistoryOpen: boolean;
    chatOpen: boolean;
    tableViewMode: 'standard' | 'compact';
}

const initialState: UIState = {
    modal: {
        type: null,
        isOpen: false,
    },
    notifications: [],
    sidebarOpen: false,
    soundEnabled: true,
    animationsEnabled: true,
    theme: 'dark',
    isMobile: typeof window !== 'undefined' ? window.innerWidth < 768 : false,
    connectionStatus: 'disconnected',
    aiPanelOpen: false,
    handHistoryOpen: false,
    chatOpen: false,
    tableViewMode: 'standard',
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        openModal: (state, action: PayloadAction<{ type: Modal['type']; data?: any }>) => {
            state.modal = {
                type: action.payload.type,
                isOpen: true,
                data: action.payload.data,
            };
        },
        closeModal: (state) => {
            state.modal = {
                type: null,
                isOpen: false,
            };
        },
        addNotification: (state, action: PayloadAction<Omit<Notification, 'id' | 'timestamp'>>) => {
            const notification: Notification = {
                ...action.payload,
                id: `${Date.now()}-${Math.random()}`,
                timestamp: Date.now(),
            };
            state.notifications.push(notification);

            // Keep only last 5 notifications
            if (state.notifications.length > 5) {
                state.notifications = state.notifications.slice(-5);
            }
        },
        removeNotification: (state, action: PayloadAction<string>) => {
            state.notifications = state.notifications.filter(n => n.id !== action.payload);
        },
        clearNotifications: (state) => {
            state.notifications = [];
        },
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setSidebarOpen: (state, action: PayloadAction<boolean>) => {
            state.sidebarOpen = action.payload;
        },
        toggleSound: (state) => {
            state.soundEnabled = !state.soundEnabled;
            localStorage.setItem('soundEnabled', state.soundEnabled.toString());
        },
        toggleAnimations: (state) => {
            state.animationsEnabled = !state.animationsEnabled;
            localStorage.setItem('animationsEnabled', state.animationsEnabled.toString());
        },
        setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
            state.theme = action.payload;
            localStorage.setItem('theme', action.payload);
        },
        setIsMobile: (state, action: PayloadAction<boolean>) => {
            state.isMobile = action.payload;
        },
        setConnectionStatus: (state, action: PayloadAction<UIState['connectionStatus']>) => {
            state.connectionStatus = action.payload;
        },
        toggleAiPanel: (state) => {
            state.aiPanelOpen = !state.aiPanelOpen;
        },
        setAiPanelOpen: (state, action: PayloadAction<boolean>) => {
            state.aiPanelOpen = action.payload;
        },
        toggleHandHistory: (state) => {
            state.handHistoryOpen = !state.handHistoryOpen;
        },
        setHandHistoryOpen: (state, action: PayloadAction<boolean>) => {
            state.handHistoryOpen = action.payload;
        },
        toggleChat: (state) => {
            state.chatOpen = !state.chatOpen;
        },
        setChatOpen: (state, action: PayloadAction<boolean>) => {
            state.chatOpen = action.payload;
        },
        setTableViewMode: (state, action: PayloadAction<'standard' | 'compact'>) => {
            state.tableViewMode = action.payload;
            localStorage.setItem('tableViewMode', action.payload);
        },
        initializeSettings: (state) => {
            // Load settings from localStorage
            const soundEnabled = localStorage.getItem('soundEnabled');
            const animationsEnabled = localStorage.getItem('animationsEnabled');
            const theme = localStorage.getItem('theme');
            const tableViewMode = localStorage.getItem('tableViewMode');

            if (soundEnabled !== null) {
                state.soundEnabled = soundEnabled === 'true';
            }
            if (animationsEnabled !== null) {
                state.animationsEnabled = animationsEnabled === 'true';
            }
            if (theme === 'light' || theme === 'dark') {
                state.theme = theme;
            }
            if (tableViewMode === 'compact' || tableViewMode === 'standard') {
                state.tableViewMode = tableViewMode;
            }
        },
    },
});

export const {
    openModal,
    closeModal,
    addNotification,
    removeNotification,
    clearNotifications,
    toggleSidebar,
    setSidebarOpen,
    toggleSound,
    toggleAnimations,
    setTheme,
    setIsMobile,
    setConnectionStatus,
    toggleAiPanel,
    setAiPanelOpen,
    toggleHandHistory,
    setHandHistoryOpen,
    toggleChat,
    setChatOpen,
    setTableViewMode,
    initializeSettings,
} = uiSlice.actions;

export default uiSlice.reducer; 