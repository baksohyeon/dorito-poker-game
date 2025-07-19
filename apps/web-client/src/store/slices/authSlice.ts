import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthUser, AuthResponse, AuthRequest, RegistrationRequest } from '@shared/types/auth.types';
import { authService } from '../../services/authService';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
    accessToken: string | null;
    refreshToken: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
};

// Async thunks
export const login = createAsyncThunk<AuthResponse, AuthRequest>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Login failed');
        }
    }
);

export const register = createAsyncThunk<AuthResponse, RegistrationRequest>(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await authService.register(userData);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Registration failed');
        }
    }
);

export const logout = createAsyncThunk<void, void>(
    'auth/logout',
    async (_, { getState }) => {
        const state = getState() as { auth: AuthState };
        if (state.auth.refreshToken) {
            await authService.logout(state.auth.refreshToken);
        }
    }
);

export const refreshAccessToken = createAsyncThunk<AuthResponse, string>(
    'auth/refresh',
    async (refreshToken, { rejectWithValue }) => {
        try {
            const response = await authService.refreshToken(refreshToken);
            return response;
        } catch (error: any) {
            return rejectWithValue(error.response?.data?.error || 'Token refresh failed');
        }
    }
);

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
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success && action.payload.user && action.payload.tokens) {
                    state.user = action.payload.user;
                    state.accessToken = action.payload.tokens.accessToken;
                    state.refreshToken = action.payload.tokens.refreshToken;
                    state.isAuthenticated = true;

                    localStorage.setItem('accessToken', action.payload.tokens.accessToken);
                    localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
                }
            })
            .addCase(login.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload.success && action.payload.user) {
                    state.user = action.payload.user;
                    state.isAuthenticated = true;
                }
            })
            .addCase(register.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            })
            .addCase(refreshAccessToken.fulfilled, (state, action) => {
                if (action.payload.success && action.payload.tokens) {
                    state.accessToken = action.payload.tokens.accessToken;
                    state.refreshToken = action.payload.tokens.refreshToken;

                    localStorage.setItem('accessToken', action.payload.tokens.accessToken);
                    localStorage.setItem('refreshToken', action.payload.tokens.refreshToken);
                }
            })
            .addCase(refreshAccessToken.rejected, (state) => {
                state.user = null;
                state.accessToken = null;
                state.refreshToken = null;
                state.isAuthenticated = false;

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
            });
    },
});

export const { clearError, setCredentials, clearCredentials, updateUserChips } = authSlice.actions;
export default authSlice.reducer; 