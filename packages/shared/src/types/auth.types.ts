// packages/shared/src/types/auth.types.ts

export interface AuthRequest {
  email?: string;
  username?: string;
  password: string;
  rememberMe?: boolean;
  deviceInfo?: DeviceInfo;
}

export interface AuthResponse {
  success: boolean;
  user?: AuthUser;
  tokens?: AuthTokens;
  error?: AuthError;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  level: number;
  chips: number;
  rank: string;
  permissions: UserPermission[];
  lastLogin: Date;
  isVerified: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface AuthError {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, any>;
}

export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'EMAIL_NOT_VERIFIED'
  | 'ACCOUNT_SUSPENDED'
  | 'ACCOUNT_LOCKED'
  | 'PASSWORD_EXPIRED'
  | 'TOKEN_EXPIRED'
  | 'TOKEN_INVALID'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR';

export interface DeviceInfo {
  userAgent: string;
  platform: string;
  browser: string;
  isMobile: boolean;
  ipAddress: string;
  fingerprint?: string;
}

export interface UserPermission {
  resource: string;
  actions: string[];
  conditions?: Record<string, any>;
}

export interface PasswordResetRequest {
  email: string;
  captcha?: string;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
  resetToken?: string;
  expiresIn?: number;
}

export interface PasswordChangeRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface EmailVerificationRequest {
  email: string;
  verificationCode: string;
}

export interface RegistrationRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  country?: string;
  dateOfBirth?: Date;
  acceptedTerms: boolean;
  captcha?: string;
  referralCode?: string;
}

export interface RegistrationResponse {
  success: boolean;
  user?: AuthUser;
  error?: AuthError;
  requiresVerification?: boolean;
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  deviceInfo: DeviceInfo;
  createdAt: Date;
  lastActivity: Date;
  expiresAt: Date;
  isActive: boolean;
}
