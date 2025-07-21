
// apps/dedicated-server/src/managers/table-manager.ts
import { SnowflakeGenerator } from '@poker-game/shared';
import { Table, TableConfig, PlayerState, HandHistory } from '@poker-game/shared';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { EventManager } from './event-manager';

export class TableManager {
    private tables: Map<string, Table> = new Map();
    private snowflakeGenerator: SnowflakeGenerator;
    private eventManager!: EventManager;

    constructor(
        private serverId: string,
        machineId: number
    ) {
        this.snowflakeGenerator = new SnowflakeGenerator(machineId);
    }

    setEventManager(eventManager: EventManager): void {
        this.eventManager = eventManager;
    }

    async createTable(config: TableConfig): Promise<Table> {
        const tableId = this.snowflakeGenerator.generate();

        const table: Table = {
            id: tableId,
            config,
            players: new Map(),
            currentGame: undefined,
            gameHistory: [],
            waitingList: [],
            observerCount: 0,
            isActive: false,
            lastActivity: Date.now(),
            createdAt: Date.now(),
            totalHands: 0,
            averagePotSize: 0,
            seatsOccupied: 0
        };

        // Save to database
        await databaseService.tables.createTable({
            id: tableId,
            serverId: this.serverId,
            name: config.name,
            gameType: config.gameType === 'texas-holdem' ? 'TEXAS_HOLDEM' : 'TEXAS_HOLDEM',
            maxPlayers: config.maxPlayers,
            minPlayers: config.minPlayers,
            smallBlind: config.blinds.small,
            bigBlind: config.blinds.big,
            buyInMin: config.buyIn.min,
            buyInMax: config.buyIn.max,
            isPrivate: config.isPrivate,
            password: config.password,
            timeLimit: config.timeLimit
        });

        this.tables.set(tableId, table);

        logger.info(`Table created: ${tableId}`);
        return table;
    }

    async addPlayerToTable(tableId: string, playerId: string, position?: number): Promise<{
        success: boolean;
        error?: string;
        position?: number;
        playerState?: PlayerState;
    }> {
        const table = this.tables.get(tableId);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }

        if (table.players.has(playerId)) {
            return { success: false, error: 'Player already at table' };
        }

        if (table.players.size >= table.config.maxPlayers) {
            return { success: false, error: 'Table is full' };
        }

        // Find available position
        let playerPosition = position;
        if (playerPosition === undefined) {
            playerPosition = this.findAvailablePosition(table) ?? undefined;
        }

        if (playerPosition === undefined) {
            return { success: false, error: 'No available positions' };
        }

        // Get player info from database
        const user = await databaseService.users.findById(playerId);
        if (!user) {
            return { success: false, error: 'Player not found' };
        }

        const playerState: PlayerState = {
            id: playerId,
            name: user.username,
            chips: user.chips,
            startingChips: user.chips,
            currentBet: 0,
            totalBet: 0,
            totalInvested: 0,
            cards: [],
            holeCards: [],
            position: playerPosition!,
            seatNumber: playerPosition!,
            status: 'active',
            hasActed: false,
            actionsThisRound: 0,
            isDealer: false,
            isSmallBlind: false,
            isBigBlind: false,
            isInPosition: false,
            timeBank: table.config.timeBankSeconds,
            sessionStats: {
                handsPlayed: 0,
                handsWon: 0,
                totalProfit: 0,
                vpip: 0,
                pfr: 0,
                aggression: 0,
                showdownWinRate: 0,
                foldToBet: 0,
                foldToRaise: 0,
                cBetFreq: 0,
                threeBetFreq: 0,
                bigBlindsWon: 0
            },
            isObserver: false,
            canRebuy: table.config.allowRebuy,
            rebuyCount: 0
        };

        table.players.set(playerId, playerState);
        table.seatsOccupied = table.players.size;
        table.lastActivity = Date.now();
        table.isActive = table.players.size >= table.config.minPlayers;

        logger.info(`Player ${playerId} joined table ${tableId} at position ${playerPosition}`);

        return {
            success: true,
            position: playerPosition,
            playerState
        };
    }

    async removePlayerFromTable(tableId: string, playerId: string): Promise<{
        success: boolean;
        error?: string;
    }> {
        const table = this.tables.get(tableId);
        if (!table) {
            return { success: false, error: 'Table not found' };
        }

        if (!table.players.has(playerId)) {
            return { success: false, error: 'Player not at table' };
        }

        table.players.delete(playerId);
        table.seatsOccupied = table.players.size;
        table.lastActivity = Date.now();
        table.isActive = table.players.size >= table.config.minPlayers;

        // If no players left, could mark table for cleanup
        if (table.players.size === 0) {
            // Keep table for potential reuse
        }

        logger.info(`Player ${playerId} left table ${tableId}`);

        return { success: true };
    }

    private findAvailablePosition(table: Table): number | null {
        const occupiedPositions = new Set(
            Array.from(table.players.values()).map((p: PlayerState) => p.position)
        );

        for (let pos = 0; pos < table.config.maxPlayers; pos++) {
            if (!occupiedPositions.has(pos)) {
                return pos;
            }
        }

        return null;
    }

    getTable(tableId: string): Table | null {
        return this.tables.get(tableId) || null;
    }

    getAllTables(): Table[] {
        return Array.from(this.tables.values());
    }

    getTableCount(): number {
        return this.tables.size;
    }

    getActiveTables(): Table[] {
        return Array.from(this.tables.values()).filter(t => t.isActive);
    }

    async updateTable(tableId: string, updates: Partial<Table>): Promise<boolean> {
        const table = this.tables.get(tableId);
        if (!table) {
            return false;
        }

        Object.assign(table, updates, { lastActivity: Date.now() });

        // Update database
        await databaseService.tables.updateTable(tableId, {
            status: table.isActive ? 'ACTIVE' : 'WAITING'
        });

        return true;
    }

    async deleteTable(tableId: string): Promise<boolean> {
        const table = this.tables.get(tableId);
        if (!table) {
            return false;
        }

        // Only delete if no players
        if (table.players.size > 0) {
            return false;
        }

        this.tables.delete(tableId);

        // Mark as closed in database
        await databaseService.tables.closeTable(tableId);

        logger.info(`Table ${tableId} deleted`);
        return true;
    }
}