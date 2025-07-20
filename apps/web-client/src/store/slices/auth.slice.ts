
// apps/web-client/src/store/slices/auth.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services/auth.service';

// Types
interface User {
    id: string;
    username: string;
    email: string;
    chips: number;
    level: number;
    rank: string;
    gamesPlayed?: number;
    gamesWon?: number;
    totalWinnings?: number;
    totalLosses?: number;
    experience?: number;
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
}

interface AuthResponse {
    user: User;
    token: string;
    refreshToken: string;
}

// Initial state
const initialState: AuthState = {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
};

// Helper functions
const storeTokens = (token: string, refreshToken: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('refreshToken', refreshToken);
};

const clearTokens = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
};

// Async thunks
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials>(
    'auth/login',
    async (credentials, { rejectWithValue }) => {
        try {
            const response = await authService.login(credentials);

            if (response.success && response.token && response.refreshToken && response.user) {
                storeTokens(response.token, response.refreshToken);
                return {
                    user: response.user,
                    token: response.token,
                    refreshToken: response.refreshToken
                };
            } else {
                return rejectWithValue(response.error || 'Login failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Login failed');
        }
    }
);

export const registerUser = createAsyncThunk<AuthResponse, RegisterData>(
    'auth/register',
    async (data, { rejectWithValue }) => {
        try {
            const response = await authService.register(data);

            if (response.success && response.token && response.refreshToken && response.user) {
                storeTokens(response.token, response.refreshToken);
                return {
                    user: response.user,
                    token: response.token,
                    refreshToken: response.refreshToken
                };
            } else {
                return rejectWithValue(response.error || 'Registration failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Registration failed');
        }
    }
);

export const refreshAuthToken = createAsyncThunk<{ user: User; token: string }, void>(
    'auth/refresh',
    async (_, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { auth: AuthState };
            const refreshToken = state.auth.refreshToken || localStorage.getItem('refreshToken');

            if (!refreshToken) {
                return rejectWithValue('No refresh token');
            }

            const response = await authService.refreshToken(refreshToken);

            if (response.success && response.token && response.user) {
                localStorage.setItem('token', response.token);
                return {
                    user: response.user,
                    token: response.token
                };
            } else {
                return rejectWithValue(response.error || 'Token refresh failed');
            }
        } catch (error: any) {
            return rejectWithValue(error.message || 'Token refresh failed');
        }
    }
);

export const initializeAuth = createAsyncThunk<{ user: User; token: string }, void>(
    'auth/initialize',
    async (_, { dispatch, rejectWithValue }) => {
        try {
            const token = localStorage.getItem('token');
            const refreshToken = localStorage.getItem('refreshToken');

            if (!token || !refreshToken) {
                return rejectWithValue('No stored tokens');
            }

            // Try to refresh the token to get updated user data
            return await dispatch(refreshAuthToken()).unwrap();
        } catch (error: any) {
            // Clear invalid tokens
            clearTokens();
            return rejectWithValue('Auth initialization failed');
        }
    }
);

export const logoutUser = createAsyncThunk<void, void>(
    'auth/logout',
    async (_, { getState }) => {
        const state = getState() as { auth: AuthState };
        const refreshToken = state.auth.refreshToken || localStorage.getItem('refreshToken');

        if (refreshToken) {
            try {
                await authService.logout(refreshToken);
            } catch (error) {
                // Ignore logout errors
                console.warn('Logout error:', error);
            }
        }

        clearTokens();
    }
);

// Slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        updateUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        }
    },
    extraReducers: (builder) => {
        // Login
        builder
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Register
        builder
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.refreshToken = action.payload.refreshToken;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
            });

        // Refresh token
        builder
            .addCase(refreshAuthToken.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(refreshAuthToken.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(refreshAuthToken.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                clearTokens();
            });

        // Initialize auth
        builder
            .addCase(initializeAuth.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.isLoading = false;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload as string;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
            });

        // Logout
        builder
            .addCase(logoutUser.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state) => {
                state.isLoading = false;
                state.user = null;
                state.token = null;
                state.refreshToken = null;
                state.isAuthenticated = false;
            });
    }
});

// Export actions
export const { clearError, updateUser, setLoading } = authSlice.actions;

// Export selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectError = (state: { auth: AuthState }) => state.auth.error;
export const selectToken = (state: { auth: AuthState }) => state.auth.token;

// Export reducer
export default authSlice.reducer;