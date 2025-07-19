// apps/dedicated-server/src/managers/persistence-manager.ts
import { GameState, Table, PlayerState } from '@poker-game/shared';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { createClient } from 'redis';

interface GameSnapshot {
    gameState: GameState;
    timestamp: number;
    checksum: string;
    version: string;
}

interface RecoveryInfo {
    gameId: string;
    tableId: string;
    lastSavedAt: number;
    canRecover: boolean;
    reason?: string;
}

export class PersistenceManager {
    private redisClient: any;
    private isConnected = false;
    private saveQueue: Map<string, GameSnapshot> = new Map();
    private autoSaveInterval: NodeJS.Timeout | null = null;

    // Configuration
    private readonly AUTO_SAVE_INTERVAL = 10000; // 10 seconds
    private readonly SNAPSHOT_RETENTION_HOURS = 24;
    private readonly MAX_QUEUE_SIZE = 1000;
    private readonly COMPRESSION_ENABLED = true;

    constructor(redisUrl: string) {
        this.initializeRedis(redisUrl);
    }

    private async initializeRedis(redisUrl: string): Promise<void> {
        try {
            this.redisClient = createClient({ url: redisUrl });

            this.redisClient.on('error', (error: any) => {
                logger.error('Redis connection error:', error);
                this.isConnected = false;
            });

            this.redisClient.on('connect', () => {
                logger.info('Connected to Redis for game persistence');
                this.isConnected = true;
            });

            this.redisClient.on('disconnect', () => {
                logger.warn('Disconnected from Redis');
                this.isConnected = false;
            });

            await this.redisClient.connect();

        } catch (error) {
            logger.error('Failed to initialize Redis:', error);
            this.isConnected = false;
        }
    }

    startAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
        }

        this.autoSaveInterval = setInterval(async () => {
            await this.processSaveQueue();
        }, this.AUTO_SAVE_INTERVAL);

        logger.info('Auto-save started for game states');
    }

    stopAutoSave(): void {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }

        logger.info('Auto-save stopped');
    }

    async saveGameState(gameState: GameState): Promise<boolean> {
        try {
            const snapshot = this.createSnapshot(gameState);

            if (this.isConnected) {
                // Immediate save to Redis
                await this.saveToRedis(gameState.id, snapshot);

                // Also save to database for long-term persistence
                await this.saveToDatabase(gameState, snapshot);

                logger.debug(`Game state saved: ${gameState.id}`);
                return true;
            } else {
                // Queue for later if Redis is not available
                this.queueForSave(gameState.id, snapshot);
                logger.warn(`Game state queued (Redis unavailable): ${gameState.id}`);
                return false;
            }
        } catch (error) {
            logger.error(`Failed to save game state ${gameState.id}:`, error);
            return false;
        }
    }

    async loadGameState(gameId: string): Promise<GameState | null> {
        try {
            if (!this.isConnected) {
                logger.warn('Cannot load game state: Redis not connected');
                return await this.loadFromDatabase(gameId);
            }

            // Try Redis first for fastest access
            const snapshot = await this.loadFromRedis(gameId);
            if (snapshot && this.validateSnapshot(snapshot)) {
                logger.debug(`Game state loaded from Redis: ${gameId}`);
                return snapshot.gameState;
            }

            // Fallback to database
            logger.debug(`Falling back to database for game state: ${gameId}`);
            return await this.loadFromDatabase(gameId);

        } catch (error) {
            logger.error(`Failed to load game state ${gameId}:`, error);
            return null;
        }
    }

    async saveTableState(table: Table): Promise<boolean> {
        try {
            if (!this.isConnected) {
                logger.warn('Cannot save table state: Redis not connected');
                return false;
            }

            const key = `table:${table.id}`;
            const data = JSON.stringify(table);

            await this.redisClient.setEx(key, 3600, data); // 1 hour TTL
            logger.debug(`Table state saved: ${table.id}`);
            return true;
        } catch (error) {
            logger.error(`Failed to save table state ${table.id}:`, error);
            return false;
        }
    }

    async loadTableState(tableId: string): Promise<Table | null> {
        try {
            if (!this.isConnected) {
                logger.warn('Cannot load table state: Redis not connected');
                return null;
            }

            const key = `table:${tableId}`;
            const data = await this.redisClient.get(key);

            if (data) {
                const table = JSON.parse(data) as Table;
                logger.debug(`Table state loaded: ${tableId}`);
                return table;
            }

            return null;
        } catch (error) {
            logger.error(`Failed to load table state ${tableId}:`, error);
            return null;
        }
    }

    async getRecoveryInfo(serverId: string): Promise<RecoveryInfo[]> {
        const recoveryInfo: RecoveryInfo[] = [];

        try {
            if (!this.isConnected) {
                logger.warn('Cannot get recovery info: Redis not connected');
                return recoveryInfo;
            }

            // Get all game snapshots for this server
            const pattern = `game:snapshot:*`;
            const keys = await this.redisClient.keys(pattern);

            for (const key of keys) {
                const data = await this.redisClient.get(key);
                if (data) {
                    try {
                        const snapshot: GameSnapshot = JSON.parse(data);
                        const gameId = key.split(':')[2];

                        const canRecover = this.canRecoverGame(snapshot);

                        recoveryInfo.push({
                            gameId,
                            tableId: snapshot.gameState.tableId,
                            lastSavedAt: snapshot.timestamp,
                            canRecover,
                            reason: canRecover ? undefined : 'Snapshot too old or corrupted'
                        });
                    } catch (parseError) {
                        logger.error(`Failed to parse snapshot for ${key}:`, parseError);
                    }
                }
            }

            logger.info(`Found ${recoveryInfo.length} recoverable games for server ${serverId}`);
            return recoveryInfo;

        } catch (error) {
            logger.error('Failed to get recovery info:', error);
            return recoveryInfo;
        }
    }

    async recoverGame(gameId: string): Promise<GameState | null> {
        try {
            const gameState = await this.loadGameState(gameId);

            if (gameState) {
                // Validate that the game can be safely recovered
                if (this.validateGameRecovery(gameState)) {
                    logger.info(`Successfully recovered game: ${gameId}`);
                    return gameState;
                } else {
                    logger.warn(`Game ${gameId} cannot be safely recovered`);
                    await this.cleanupGameState(gameId);
                    return null;
                }
            }

            return null;
        } catch (error) {
            logger.error(`Failed to recover game ${gameId}:`, error);
            return null;
        }
    }

    async cleanupExpiredStates(): Promise<void> {
        try {
            if (!this.isConnected) {
                return;
            }

            const cutoffTime = Date.now() - (this.SNAPSHOT_RETENTION_HOURS * 60 * 60 * 1000);
            const pattern = `game:snapshot:*`;
            const keys = await this.redisClient.keys(pattern);

            let cleanedCount = 0;

            for (const key of keys) {
                const data = await this.redisClient.get(key);
                if (data) {
                    try {
                        const snapshot: GameSnapshot = JSON.parse(data);
                        if (snapshot.timestamp < cutoffTime) {
                            await this.redisClient.del(key);
                            cleanedCount++;
                        }
                    } catch (parseError) {
                        // Remove corrupted snapshots
                        await this.redisClient.del(key);
                        cleanedCount++;
                    }
                }
            }

            if (cleanedCount > 0) {
                logger.info(`Cleaned up ${cleanedCount} expired game snapshots`);
            }

        } catch (error) {
            logger.error('Failed to cleanup expired states:', error);
        }
    }

    async cleanupGameState(gameId: string): Promise<void> {
        try {
            if (this.isConnected) {
                const key = `game:snapshot:${gameId}`;
                await this.redisClient.del(key);
                logger.debug(`Cleaned up game state: ${gameId}`);
            }
        } catch (error) {
            logger.error(`Failed to cleanup game state ${gameId}:`, error);
        }
    }

    private createSnapshot(gameState: GameState): GameSnapshot {
        const serialized = JSON.stringify(gameState);
        const checksum = this.calculateChecksum(serialized);

        return {
            gameState,
            timestamp: Date.now(),
            checksum,
            version: '1.0.0'
        };
    }

    private async saveToRedis(gameId: string, snapshot: GameSnapshot): Promise<void> {
        const key = `game:snapshot:${gameId}`;
        const data = JSON.stringify(snapshot);

        // Set with TTL
        const ttl = this.SNAPSHOT_RETENTION_HOURS * 60 * 60; // Convert to seconds
        await this.redisClient.setEx(key, ttl, data);
    }

    private async saveToDatabase(gameState: GameState, snapshot: GameSnapshot): Promise<void> {
        try {
            // TODO: Implement saveGameSnapshot in database service
            // await databaseService.games.saveGameSnapshot({
            //     gameId: gameState.id,
            //     tableId: gameState.tableId,
            //     phase: gameState.phase,
            //     round: gameState.round,
            //     pot: gameState.pot,
            //     currentPlayer: gameState.currentPlayer,
            //     snapshotData: JSON.stringify(snapshot),
            //     checksum: snapshot.checksum,
            //     createdAt: new Date(snapshot.timestamp)
            // });
        } catch (error) {
            logger.error('Failed to save to database:', error);
            // Don't throw - Redis save might have succeeded
        }
    }

    private async loadFromRedis(gameId: string): Promise<GameSnapshot | null> {
        const key = `game:snapshot:${gameId}`;
        const data = await this.redisClient.get(key);

        if (data) {
            return JSON.parse(data) as GameSnapshot;
        }

        return null;
    }

    private async loadFromDatabase(gameId: string): Promise<GameState | null> {
        try {
            // TODO: Implement getGameSnapshot in database service
            // const snapshot = await databaseService.games.getGameSnapshot(gameId);
            // if (snapshot && snapshot.snapshotData) {
            //     const parsed: GameSnapshot = JSON.parse(snapshot.snapshotData);
            //     if (this.validateSnapshot(parsed)) {
            //         return parsed.gameState;
            //     }
            // }
            return null;
        } catch (error) {
            logger.error('Failed to load from database:', error);
            return null;
        }
    }

    private validateSnapshot(snapshot: GameSnapshot): boolean {
        try {
            // Check basic structure
            if (!snapshot.gameState || !snapshot.checksum || !snapshot.timestamp) {
                return false;
            }

            // Verify checksum
            const calculatedChecksum = this.calculateChecksum(JSON.stringify(snapshot.gameState));
            if (calculatedChecksum !== snapshot.checksum) {
                logger.warn('Snapshot checksum mismatch');
                return false;
            }

            // Check age
            const age = Date.now() - snapshot.timestamp;
            const maxAge = this.SNAPSHOT_RETENTION_HOURS * 60 * 60 * 1000;
            if (age > maxAge) {
                logger.warn('Snapshot too old');
                return false;
            }

            return true;
        } catch (error) {
            logger.error('Error validating snapshot:', error);
            return false;
        }
    }

    private validateGameRecovery(gameState: GameState): boolean {
        // Check if game is in a recoverable state
        if (gameState.phase === 'finished') {
            return false;
        }

        // Ensure all players have valid states
        for (const player of gameState.players.values()) {
            if (!player.id || player.chips < 0) {
                return false;
            }
        }

        // Additional validation logic...
        return true;
    }

    private canRecoverGame(snapshot: GameSnapshot): boolean {
        const age = Date.now() - snapshot.timestamp;
        const maxRecoverableAge = 60 * 60 * 1000; // 1 hour

        return age < maxRecoverableAge && this.validateSnapshot(snapshot);
    }

    private queueForSave(gameId: string, snapshot: GameSnapshot): void {
        if (this.saveQueue.size >= this.MAX_QUEUE_SIZE) {
            // Remove oldest entry
            const oldestKey = this.saveQueue.keys().next().value;
            if (oldestKey) {
                this.saveQueue.delete(oldestKey);
                logger.warn('Save queue full, removing oldest entry');
            }
        }

        this.saveQueue.set(gameId, snapshot);
    }

    private async processSaveQueue(): Promise<void> {
        if (!this.isConnected || this.saveQueue.size === 0) {
            return;
        }

        const entries = Array.from(this.saveQueue.entries());
        this.saveQueue.clear();

        for (const [gameId, snapshot] of entries) {
            try {
                await this.saveToRedis(gameId, snapshot);
                logger.debug(`Queued game state saved: ${gameId}`);
            } catch (error) {
                logger.error(`Failed to save queued state ${gameId}:`, error);
                // Re-queue if failed
                this.queueForSave(gameId, snapshot);
            }
        }
    }

    private calculateChecksum(data: string): string {
        // Simple checksum calculation (in production, use crypto.createHash)
        let hash = 0;
        for (let i = 0; i < data.length; i++) {
            const char = data.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    async disconnect(): Promise<void> {
        this.stopAutoSave();

        if (this.redisClient && this.isConnected) {
            try {
                await this.redisClient.quit();
                logger.info('Disconnected from Redis');
            } catch (error) {
                logger.error('Error disconnecting from Redis:', error);
            }
        }
    }

    getStats(): any {
        return {
            isConnected: this.isConnected,
            queueSize: this.saveQueue.size,
            autoSaveActive: !!this.autoSaveInterval,
            retentionHours: this.SNAPSHOT_RETENTION_HOURS
        };
    }
}