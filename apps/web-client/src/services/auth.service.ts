// apps/web-client/src/services/auth.service.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: {
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
    };
    error?: string;
}

class AuthService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json'
        }
    });

    constructor() {
        // Add request interceptor to include auth token
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Add response interceptor to handle token refresh
        this.api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const refreshToken = localStorage.getItem('refreshToken');
                        if (refreshToken) {
                            const response = await this.refreshToken(refreshToken);
                            if (response.success && response.token) {
                                localStorage.setItem('token', response.token);
                                originalRequest.headers.Authorization = `Bearer ${response.token}`;
                                return this.api(originalRequest);
                            }
                        }
                    } catch (refreshError) {
                        // Refresh failed, redirect to login
                        localStorage.removeItem('token');
                        localStorage.removeItem('refreshToken');
                        window.location.href = '/login';
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/auth/login', credentials);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Login failed'
            };
        }
    }

    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/auth/register', data);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Registration failed'
            };
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/auth/refresh', { refreshToken });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Token refresh failed'
            };
        }
    }

    async logout(refreshToken: string): Promise<AuthResponse> {
        try {
            const response = await this.api.post('/auth/logout', { refreshToken });
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Logout failed'
            };
        }
    }

    async getProfile(): Promise<AuthResponse> {
        try {
            const response = await this.api.get('/players/profile');
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to get profile'
            };
        }
    }

    async updateProfile(updates: Partial<RegisterData>): Promise<AuthResponse> {
        try {
            const response = await this.api.put('/players/profile', updates);
            return response.data;
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Failed to update profile'
            };
        }
    }
}

export const authService = new AuthService(); 