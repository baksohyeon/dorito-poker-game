import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, AuthRequest, RegistrationRequest } from '@shared/types/auth.types';
import { authService } from '../../services/authService';

// API Response types that match the actual server response
interface ApiAuthResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
        user: AuthUser | Record<string, never>; // empty object or actual user
    };
    error?: string;
}

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
    isGuest: boolean;
}

const generateGuestUser = (): AuthUser => ({
    id: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    username: `Guest_${Math.random().toString(36).substr(2, 6)}`,
    email: '',
    chips: 10000,
    avatar: '',
    level: 1,
    rank: 'bronze',
    permissions: [],
    lastLogin: new Date(),
    isVerified: false
});

const initialState: AuthState = {
    user: generateGuestUser(),
    isAuthenticated: true, // Always authenticated for guest access
    loading: false,
    error: null,
    accessToken: null,
    refreshToken: null,
    isGuest: true,
};

// Async thunks - disabled for guest access
// export const login = createAsyncThunk<ApiAuthResponse, AuthRequest>(
//     'auth/login',
//     async (credentials, { rejectWithValue }) => {
//         try {
//             const response = await authService.login(credentials);
//             return response;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.error || 'Login failed');
//         }
//     }
// );

// export const register = createAsyncThunk<ApiAuthResponse, RegistrationRequest>(
//     'auth/register',
//     async (userData, { rejectWithValue }) => {
//         try {
//             const response = await authService.register(userData);
//             return response;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.error || 'Registration failed');
//         }
//     }
// );

// export const logout = createAsyncThunk<void, void>(
//     'auth/logout',
//     async (_, { getState }) => {
//         const state = getState() as { auth: AuthState };
//         if (state.auth.refreshToken) {
//             await authService.logout(state.auth.refreshToken);
//         }
//     }
// );

// export const refreshAccessToken = createAsyncThunk<ApiAuthResponse, string>(
//     'auth/refresh',
//     async (refreshToken, { rejectWithValue }) => {
//         try {
//             const response = await authService.refreshToken(refreshToken);
//             return response;
//         } catch (error: any) {
//             return rejectWithValue(error.response?.data?.error || 'Token refresh failed');
//         }
//     }
// );

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        setCredentials: (state, action: PayloadAction<{ user: AuthUser; tokens: any }>) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.tokens.accessToken;
            state.refreshToken = action.payload.tokens.refreshToken;
            state.isAuthenticated = true;

            localStorage.setItem('accessToken', action.payload.tokens.accessToken);
            localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
        },
        clearCredentials: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;

            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
        },
        updateUserChips: (state, action: PayloadAction<number>) => {
            if (state.user) {
                state.user.chips = action.payload;
            }
        },
        createGuestUser: (state) => {
            state.user = generateGuestUser();
            state.isAuthenticated = true;
            state.isGuest = true;
            state.accessToken = null;
            state.refreshToken = null;
        },
        clearGuestUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.isGuest = false;
            state.accessToken = null;
            state.refreshToken = null;
        },
    },
    extraReducers: (builder) => {
        // No extra reducers needed for guest access
    },
});

export const { clearError, setCredentials, clearCredentials, updateUserChips, createGuestUser, clearGuestUser } = authSlice.actions;
export default authSlice.reducer; 