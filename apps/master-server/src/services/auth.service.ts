import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { config } from '../config';
import { CryptoHelper } from '@poker-game/shared/utils';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    country?: string;
}

export interface AuthResult {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: {
        id: string;
        email: string;
        username: string;
        chips: number;
        level: number;
        rank: string;
    };
    error?: string;
}

export class AuthService {
    async login(credentials: LoginCredentials): Promise<AuthResult> {
        try {
            // Find user by email
            const user = await databaseService.users.findByEmail(credentials.email);
            if (!user) {
                return { success: false, error: 'Invalid email or password' };
            }

            // Verify password
            const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
            if (!isPasswordValid) {
                return { success: false, error: 'Invalid email or password' };
            }

            // Generate tokens
            const token = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            // Create session
            await this.createSession(user.id, refreshToken);

            // Update last login
            await databaseService.users.updateLastLogin(user.id);

            logger.info(`User logged in: ${user.username} (${user.email})`);

            return {
                success: true,
                token,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    chips: user.chips,
                    level: user.level,
                    rank: user.rank
                }
            };

        } catch (error) {
            logger.error('Login failed:', error);
            return { success: false, error: 'Internal server error' };
        }
    }

    async register(data: RegisterData): Promise<AuthResult> {
        try {
            // Check if user already exists
            const existingUser = await databaseService.users.findByEmailOrUsername(data.email);
            if (existingUser) {
                return {
                    success: false,
                    error: existingUser.email === data.email
                        ? 'Email already registered'
                        : 'Username already taken'
                };
            }

            // Hash password
            const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);

            // Create user
            const user = await databaseService.users.createUser({
                ...data,
                password: hashedPassword
            });

            // Generate tokens
            const token = this.generateAccessToken(user.id);
            const refreshToken = this.generateRefreshToken(user.id);

            // Create session
            await this.createSession(user.id, refreshToken);

            logger.info(`User registered: ${user.username} (${user.email})`);

            return {
                success: true,
                token,
                refreshToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    chips: user.chips,
                    level: user.level,
                    rank: user.rank
                }
            };

        } catch (error) {
            logger.error('Registration failed:', error);
            return { success: false, error: 'Internal server error' };
        }
    }

    async refreshToken(refreshToken: string): Promise<AuthResult> {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string };

            // Check if session exists
            const session = await databaseService.sessions.findBySessionId(refreshToken);
            if (!session || !session.isActive) {
                return { success: false, error: 'Invalid refresh token' };
            }

            // Get user
            const user = await databaseService.users.findById(decoded.userId);
            if (!user) {
                return { success: false, error: 'User not found' };
            }

            // Generate new access token
            const newToken = this.generateAccessToken(user.id);

            // Update session
            await databaseService.sessions.updateLastUsed(refreshToken);

            return {
                success: true,
                token: newToken,
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    chips: user.chips,
                    level: user.level,
                    rank: user.rank
                }
            };

        } catch (error) {
            logger.error('Token refresh failed:', error);
            return { success: false, error: 'Invalid refresh token' };
        }
    }

    async logout(refreshToken: string): Promise<{ success: boolean }> {
        try {
            await databaseService.sessions.deactivateSession(refreshToken);
            return { success: true };
        } catch (error) {
            logger.error('Logout failed:', error);
            return { success: false };
        }
    }

    async validateToken(token: string): Promise<{
        valid: boolean;
        userId?: string;
        error?: string;
    }> {
        try {
            const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
            return { valid: true, userId: decoded.userId };
        } catch (error) {
            return { valid: false, error: 'Invalid token' };
        }
    }

    generateReconnectToken(userId: string, sessionId: string): string {
        const payload = {
            userId,
            sessionId,
            type: 'reconnect',
            timestamp: Date.now()
        };

        return jwt.sign(payload, config.jwtSecret, { expiresIn: '24h' });
    }

    async validateReconnectToken(token: string): Promise<{
        valid: boolean;
        userId?: string;
        sessionId?: string;
        error?: string;
    }> {
        try {
            const decoded = jwt.verify(token, config.jwtSecret) as {
                userId: string;
                sessionId: string;
                type: string;
                timestamp: number;
            };

            if (decoded.type !== 'reconnect') {
                return { valid: false, error: 'Invalid token type' };
            }

            return {
                valid: true,
                userId: decoded.userId,
                sessionId: decoded.sessionId
            };

        } catch (error) {
            return { valid: false, error: 'Invalid reconnect token' };
        }
    }

    private generateAccessToken(userId: string): string {
        const payload = {
            userId,
            type: 'access',
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: config.jwtExpiresIn
        });
    }

    private generateRefreshToken(userId: string): string {
        const payload = {
            userId,
            type: 'refresh',
            sessionId: CryptoHelper.generateSessionId(),
            iat: Math.floor(Date.now() / 1000)
        };

        return jwt.sign(payload, config.jwtSecret, {
            expiresIn: '7d' // Refresh tokens last 7 days
        });
    }

    private async createSession(userId: string, refreshToken: string): Promise<void> {
        const decoded = jwt.verify(refreshToken, config.jwtSecret) as { sessionId: string };

        await databaseService.sessions.createSession({
            userId,
            sessionId: decoded.sessionId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        });
    }
}
