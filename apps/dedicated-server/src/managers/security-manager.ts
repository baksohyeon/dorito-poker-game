// apps/dedicated-server/src/managers/security-manager.ts
import { Socket } from 'socket.io';
import { logger } from '@poker-game/logger';

interface PlayerAction {
    playerId: string;
    type: string;
    amount?: number;
    timestamp?: number;
}

interface RateLimitInfo {
    count: number;
    windowStart: number;
    lastAction: number;
}

interface SecurityMetrics {
    suspiciousActivities: number;
    blockedRequests: number;
    failedAuthentications: number;
}

export class SecurityManager {
    private rateLimits: Map<string, RateLimitInfo> = new Map();
    private blockedIPs: Set<string> = new Set();
    private metrics: SecurityMetrics = {
        suspiciousActivities: 0,
        blockedRequests: 0,
        failedAuthentications: 0
    };

    // Rate limiting configuration
    private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
    private readonly MAX_ACTIONS_PER_WINDOW = 100;
    private readonly MIN_ACTION_INTERVAL = 50; // 50ms between actions
    private readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 5;

    validateConnection(socket: Socket): boolean {
        const clientIP = this.getClientIP(socket);

        // Check if IP is blocked
        if (this.blockedIPs.has(clientIP)) {
            logger.warn(`Blocked IP attempted connection: ${clientIP}`);
            this.metrics.blockedRequests++;
            return false;
        }

        return true;
    }

    validateAction(socket: Socket, action: PlayerAction): {
        valid: boolean;
        reason?: string;
    } {
        const clientIP = this.getClientIP(socket);
        const now = Date.now();

        // Check rate limiting
        if (!this.checkRateLimit(clientIP, now)) {
            logger.warn(`Rate limit exceeded for IP: ${clientIP}`);
            this.metrics.blockedRequests++;
            return { valid: false, reason: 'Rate limit exceeded' };
        }

        // Validate action structure
        if (!this.validateActionStructure(action)) {
            logger.warn(`Invalid action structure from IP: ${clientIP}`, action);
            this.recordSuspiciousActivity(clientIP);
            return { valid: false, reason: 'Invalid action format' };
        }

        // Check for suspicious patterns
        if (this.detectSuspiciousPattern(clientIP, action)) {
            logger.warn(`Suspicious activity detected from IP: ${clientIP}`);
            this.recordSuspiciousActivity(clientIP);
            return { valid: false, reason: 'Suspicious activity detected' };
        }

        return { valid: true };
    }

    sanitizeInput(input: any): any {
        if (typeof input === 'string') {
            // Remove potentially dangerous characters
            return input.replace(/[<>\"'&]/g, '').trim().substring(0, 200);
        }

        if (typeof input === 'number') {
            // Ensure number is within reasonable bounds
            return Math.max(-1000000, Math.min(1000000, input));
        }

        if (Array.isArray(input)) {
            return input.slice(0, 100).map(item => this.sanitizeInput(item));
        }

        if (typeof input === 'object' && input !== null) {
            const sanitized: any = {};
            for (const [key, value] of Object.entries(input)) {
                if (typeof key === 'string' && key.length <= 50) {
                    sanitized[key] = this.sanitizeInput(value);
                }
            }
            return sanitized;
        }

        return input;
    }

    blockIP(ip: string, duration: number = 3600000): void { // 1 hour default
        this.blockedIPs.add(ip);
        logger.warn(`IP blocked: ${ip} for ${duration}ms`);

        // Automatically unblock after duration
        setTimeout(() => {
            this.blockedIPs.delete(ip);
            logger.info(`IP unblocked: ${ip}`);
        }, duration);
    }

    getMetrics(): SecurityMetrics {
        return { ...this.metrics };
    }

    resetMetrics(): void {
        this.metrics = {
            suspiciousActivities: 0,
            blockedRequests: 0,
            failedAuthentications: 0
        };
    }

    private checkRateLimit(clientIP: string, now: number): boolean {
        const limit = this.rateLimits.get(clientIP);

        if (!limit) {
            this.rateLimits.set(clientIP, {
                count: 1,
                windowStart: now,
                lastAction: now
            });
            return true;
        }

        // Check if we're in a new window
        if (now - limit.windowStart > this.RATE_LIMIT_WINDOW) {
            limit.count = 1;
            limit.windowStart = now;
            limit.lastAction = now;
            return true;
        }

        // Check action frequency
        if (now - limit.lastAction < this.MIN_ACTION_INTERVAL) {
            return false;
        }

        // Check window limit
        if (limit.count >= this.MAX_ACTIONS_PER_WINDOW) {
            return false;
        }

        limit.count++;
        limit.lastAction = now;
        return true;
    }

    private validateActionStructure(action: PlayerAction): boolean {
        // Check required fields
        if (!action || typeof action !== 'object') return false;
        if (typeof action.playerId !== 'string' || action.playerId.length === 0) return false;
        if (typeof action.type !== 'string' || action.type.length === 0) return false;

        // Validate action types
        const validTypes = ['fold', 'check', 'call', 'bet', 'raise', 'all-in'];
        if (!validTypes.includes(action.type)) return false;

        // Validate amounts for betting actions
        if ((action.type === 'bet' || action.type === 'raise')) {
            if (typeof action.amount !== 'number' || action.amount <= 0 || action.amount > 1000000) {
                return false;
            }
        }

        // Validate timestamp if present
        if (action.timestamp && (typeof action.timestamp !== 'number' || action.timestamp <= 0)) {
            return false;
        }

        return true;
    }

    private detectSuspiciousPattern(clientIP: string, action: PlayerAction): boolean {
        // This is a simplified detection - in production you'd have more sophisticated checks

        // Check for impossible betting amounts
        if ((action.type === 'bet' || action.type === 'raise') && action.amount) {
            if (action.amount > 1000000 || action.amount < 0) {
                return true;
            }
        }

        // Check for rapid-fire actions (basic check)
        const limit = this.rateLimits.get(clientIP);
        if (limit && limit.count > 50) { // More than 50 actions in window
            return true;
        }

        return false;
    }

    private recordSuspiciousActivity(clientIP: string): void {
        this.metrics.suspiciousActivities++;

        // Block IP if too many suspicious activities
        const limit = this.rateLimits.get(clientIP);
        if (limit && limit.count > this.SUSPICIOUS_ACTIVITY_THRESHOLD) {
            this.blockIP(clientIP, 1800000); // 30 minutes
        }
    }

    private getClientIP(socket: Socket): string {
        return socket.handshake.address ||
            socket.request.connection.remoteAddress ||
            'unknown';
    }
}