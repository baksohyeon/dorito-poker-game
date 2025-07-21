import axios from 'axios';
import { AuthRequest, RegistrationRequest } from '@shared/types/auth.types';

interface ApiAuthResponse {
    success: boolean;
    data?: {
        token: string;
        refreshToken: string;
        user: any;
    };
    error?: string;
}

const API_BASE_URL = '/api/auth';

class AuthService {
    private client = axios.create({
        baseURL: API_BASE_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    constructor() {
        // Add token to requests
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        // Handle token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    const refreshToken = localStorage.getItem('refreshToken');
                    if (refreshToken) {
                        try {
                            const response = await this.refreshToken(refreshToken);
                            if (response.success && response.data) {
                                localStorage.setItem('accessToken', response.data.token);
                                originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
                                return this.client(originalRequest);
                            }
                        } catch (refreshError) {
                            // Refresh failed, redirect to login
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            window.location.href = '/login';
                        }
                    }
                }

                return Promise.reject(error);
            }
        );
    }

    async login(credentials: AuthRequest): Promise<ApiAuthResponse> {
        try {
            const response = await this.client.post('/login', credentials);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Login failed'
            };
        }
    }

    async register(userData: RegistrationRequest): Promise<ApiAuthResponse> {
        try {
            const response = await this.client.post('/register', userData);
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Registration failed'
            };
        }
    }

    async logout(refreshToken: string): Promise<void> {
        await this.client.post('/logout', { refreshToken });
    }

    async refreshToken(refreshToken: string): Promise<ApiAuthResponse> {
        try {
            const response = await this.client.post('/refresh', { refreshToken });
            return {
                success: true,
                data: response.data
            };
        } catch (error: any) {
            return {
                success: false,
                error: error.response?.data?.error || 'Token refresh failed'
            };
        }
    }

    async getProfile(): Promise<any> {
        const response = await this.client.get('/profile');
        return response.data;
    }

    async updateProfile(updates: any): Promise<any> {
        const response = await this.client.put('/profile', updates);
        return response.data;
    }

    async changePassword(data: { oldPassword: string; newPassword: string }): Promise<any> {
        const response = await this.client.put('/password', data);
        return response.data;
    }

    async requestPasswordReset(email: string): Promise<any> {
        const response = await this.client.post('/password-reset', { email });
        return response.data;
    }

    async verifyEmail(code: string): Promise<any> {
        const response = await this.client.post('/verify-email', { verificationCode: code });
        return response.data;
    }
}

export const authService = new AuthService(); 