// packages/shared/src/interfaces/auth.interface.ts
import {
  AuthRequest,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetResponse,
  PasswordChangeRequest,
  EmailVerificationRequest,
  RegistrationRequest,
  RegistrationResponse,
  SessionInfo,
  AuthUser,
} from '../types/auth.types';

export interface IAuthService {
  // Authentication
  login(request: AuthRequest): Promise<AuthResponse>;
  logout(userId: string, sessionId?: string): Promise<void>;
  refreshToken(refreshToken: string): Promise<AuthResponse>;

  // Registration
  register(request: RegistrationRequest): Promise<RegistrationResponse>;
  verifyEmail(request: EmailVerificationRequest): Promise<boolean>;
  resendVerificationEmail(email: string): Promise<boolean>;

  // Password management
  requestPasswordReset(
    request: PasswordResetRequest
  ): Promise<PasswordResetResponse>;
  resetPassword(token: string, newPassword: string): Promise<boolean>;
  changePassword(
    userId: string,
    request: PasswordChangeRequest
  ): Promise<boolean>;

  // Session management
  validateToken(token: string): Promise<AuthUser | null>;
  invalidateSession(sessionId: string): Promise<void>;
  getActiveSessions(userId: string): Promise<SessionInfo[]>;
  invalidateAllSessions(userId: string): Promise<void>;

  // User management
  getUserById(userId: string): Promise<AuthUser | null>;
  updateUserProfile(
    userId: string,
    updates: Partial<AuthUser>
  ): Promise<AuthUser>;
  deleteUser(userId: string): Promise<void>;

  // Security
  checkPasswordStrength(
    password: string
  ): Promise<{ score: number; feedback: string[] }>;
  enableTwoFactor(userId: string): Promise<{ qrCode: string; secret: string }>;
  verifyTwoFactor(userId: string, code: string): Promise<boolean>;
  disableTwoFactor(userId: string, code: string): Promise<boolean>;
}

export interface IUserRepository {
  create(userData: RegistrationRequest): Promise<AuthUser>;
  findById(id: string): Promise<AuthUser | null>;
  findByEmail(email: string): Promise<AuthUser | null>;
  findByUsername(username: string): Promise<AuthUser | null>;
  update(id: string, updates: Partial<AuthUser>): Promise<AuthUser>;
  delete(id: string): Promise<void>;

  // Queries
  searchUsers(query: string, limit?: number): Promise<AuthUser[]>;
  getUsersByRole(role: string): Promise<AuthUser[]>;
  getActiveUsers(timeframe: Date): Promise<AuthUser[]>;

  // Statistics
  getUserCount(): Promise<number>;
  getRegistrationStats(
    from: Date,
    to: Date
  ): Promise<{ date: Date; count: number }[]>;
}

export interface ISessionRepository {
  create(sessionData: Partial<SessionInfo>): Promise<SessionInfo>;
  findById(sessionId: string): Promise<SessionInfo | null>;
  findByUserId(userId: string): Promise<SessionInfo[]>;
  update(
    sessionId: string,
    updates: Partial<SessionInfo>
  ): Promise<SessionInfo>;
  delete(sessionId: string): Promise<void>;
  deleteExpired(): Promise<number>;
  deleteByUserId(userId: string): Promise<number>;
}

export interface IPasswordService {
  hash(password: string): Promise<string>;
  verify(password: string, hash: string): Promise<boolean>;
  checkStrength(password: string): { score: number; feedback: string[] };
  generateResetToken(): string;
  validateResetToken(token: string): boolean;
}

export interface ITokenService {
  generateAccessToken(user: AuthUser): Promise<string>;
  generateRefreshToken(user: AuthUser): Promise<string>;
  verifyAccessToken(token: string): Promise<AuthUser | null>;
  verifyRefreshToken(token: string): Promise<AuthUser | null>;
  revokeToken(token: string): Promise<void>;
  revokeAllTokens(userId: string): Promise<void>;
}

export interface IEmailService {
  sendVerificationEmail(email: string, token: string): Promise<boolean>;
  sendPasswordResetEmail(email: string, token: string): Promise<boolean>;
  sendWelcomeEmail(user: AuthUser): Promise<boolean>;
  sendNotificationEmail(
    email: string,
    subject: string,
    body: string
  ): Promise<boolean>;
}

export interface ITwoFactorService {
  generateSecret(userId: string): Promise<string>;
  generateQRCode(userId: string, secret: string): Promise<string>;
  verifyToken(secret: string, token: string): boolean;
  getBackupCodes(userId: string): Promise<string[]>;
  verifyBackupCode(userId: string, code: string): Promise<boolean>;
}
