import { ActionTimer } from '@poker-game/shared';
import { IActionTimer } from '@poker-game/shared';
import { GAME_CONSTANTS } from '@poker-game/shared';
import { logger } from '@poker-game/logger';

export class ActionTimerManager implements IActionTimer {
    private timers: Map<string, NodeJS.Timeout> = new Map();
    private activeTimers: Map<string, ActionTimer> = new Map();
    private warningCallbacks: Map<string, () => void> = new Map();
    private timeoutCallbacks: Map<string, () => void> = new Map();

    startTimer(timer: ActionTimer): void {
        // Clear existing timer for this player
        this.stopTimer(timer.playerId);

        // Store timer info
        this.activeTimers.set(timer.playerId, {
            ...timer,
            startTime: Date.now()
        });

        // Set warning timer
        const warningTimeMs = (timer.timeLimit - timer.warningTime) * 1000;
        if (warningTimeMs > 0) {
            const warningTimeout = setTimeout(() => {
                const callback = this.warningCallbacks.get(timer.playerId);
                if (callback) {
                    callback();
                    logger.debug(`Action warning for player ${timer.playerId}`);
                }
                timer.onWarning?.();
            }, warningTimeMs);
            
            this.timers.set(`${timer.playerId}_warning`, warningTimeout);
        }

        // Set timeout timer
        const timeoutMs = timer.timeLimit * 1000;
        const timeoutTimer = setTimeout(() => {
            const callback = this.timeoutCallbacks.get(timer.playerId);
            if (callback) {
                callback();
                logger.warn(`Action timeout for player ${timer.playerId}`);
            }
            timer.onTimeout();
            this.stopTimer(timer.playerId);
        }, timeoutMs);

        this.timers.set(timer.playerId, timeoutTimer);
        
        logger.debug(`Started action timer for player ${timer.playerId}, ${timer.timeLimit}s`);
    }

    stopTimer(playerId: string): void {
        // Clear main timer
        const timer = this.timers.get(playerId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(playerId);
        }

        // Clear warning timer
        const warningTimer = this.timers.get(`${playerId}_warning`);
        if (warningTimer) {
            clearTimeout(warningTimer);
            this.timers.delete(`${playerId}_warning`);
        }

        // Remove active timer info
        this.activeTimers.delete(playerId);
        
        logger.debug(`Stopped action timer for player ${playerId}`);
    }

    getTimeRemaining(playerId: string): number {
        const timer = this.activeTimers.get(playerId);
        if (!timer) {
            return 0;
        }

        const elapsed = (Date.now() - timer.startTime) / 1000;
        return Math.max(0, timer.timeLimit - elapsed);
    }

    extendTimer(playerId: string, additionalTime: number): void {
        const timer = this.activeTimers.get(playerId);
        if (!timer) {
            logger.warn(`Cannot extend timer for player ${playerId}: no active timer`);
            return;
        }

        // Stop current timer
        this.stopTimer(playerId);

        // Calculate remaining time and add extension
        const elapsed = (Date.now() - timer.startTime) / 1000;
        const remainingTime = Math.max(0, timer.timeLimit - elapsed);
        const newTimeLimit = remainingTime + additionalTime;

        // Start new timer with extended time
        this.startTimer({
            ...timer,
            timeLimit: newTimeLimit,
            startTime: Date.now()
        });

        logger.info(`Extended timer for player ${playerId} by ${additionalTime}s`);
    }

    onTimeout(playerId: string, callback: () => void): void {
        this.timeoutCallbacks.set(playerId, callback);
    }

    onWarning(playerId: string, callback: () => void): void {
        this.warningCallbacks.set(playerId, callback);
    }

    // Additional utility methods
    
    hasActiveTimer(playerId: string): boolean {
        return this.activeTimers.has(playerId);
    }

    getAllActiveTimers(): ActionTimer[] {
        return Array.from(this.activeTimers.values());
    }

    getTimerInfo(playerId: string): ActionTimer | null {
        return this.activeTimers.get(playerId) || null;
    }

    pauseTimer(playerId: string): void {
        const timer = this.activeTimers.get(playerId);
        if (!timer) return;

        // Stop the running timer but keep the info
        const nodeTimer = this.timers.get(playerId);
        const warningTimer = this.timers.get(`${playerId}_warning`);
        
        if (nodeTimer) {
            clearTimeout(nodeTimer);
            this.timers.delete(playerId);
        }
        
        if (warningTimer) {
            clearTimeout(warningTimer);
            this.timers.delete(`${playerId}_warning`);
        }

        // Update the timer to reflect paused state
        const elapsed = (Date.now() - timer.startTime) / 1000;
        const remainingTime = Math.max(0, timer.timeLimit - elapsed);
        
        this.activeTimers.set(playerId, {
            ...timer,
            timeLimit: remainingTime,
            startTime: 0 // Mark as paused
        });

        logger.debug(`Paused timer for player ${playerId}, ${remainingTime}s remaining`);
    }

    resumeTimer(playerId: string): void {
        const timer = this.activeTimers.get(playerId);
        if (!timer || timer.startTime !== 0) return;

        // Resume with remaining time
        this.startTimer({
            ...timer,
            startTime: Date.now()
        });

        logger.debug(`Resumed timer for player ${playerId}`);
    }

    useTimeBank(playerId: string): boolean {
        const timer = this.activeTimers.get(playerId);
        if (!timer || timer.timeBank <= 0) {
            return false;
        }

        // Stop current timer
        this.stopTimer(playerId);

        // Start new timer with time bank
        this.startTimer({
            ...timer,
            timeLimit: timer.timeBank,
            timeBank: 0, // Time bank used up
            startTime: Date.now()
        });

        logger.info(`Player ${playerId} used time bank: ${timer.timeBank}s`);
        return true;
    }

    cleanup(): void {
        // Clear all timers
        for (const [playerId] of this.activeTimers) {
            this.stopTimer(playerId);
        }
        
        // Clear callbacks
        this.timeoutCallbacks.clear();
        this.warningCallbacks.clear();
        
        logger.info('ActionTimerManager cleanup complete');
    }
}