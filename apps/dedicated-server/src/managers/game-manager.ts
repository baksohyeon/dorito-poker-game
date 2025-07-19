
// apps/dedicated-server/src/managers/game-manager.ts
import { GameState, PlayerAction, PlayerState, Card } from '@poker-game/shared/src/types';
import { logger } from '@poker-game/logger';
import { databaseService } from '@poker-game/database';
import { EventManager } from './event-manager';
import { PokerGameEngine } from '../game/poker-game-engine';

export class GameManager {
    private activeGames: Map<string, GameState> = new Map();
    private gameEngines: Map<string, PokerGameEngine> = new Map();
    private eventManager!: EventManager;

    setEventManager(eventManager: EventManager): void {
        this.eventManager = eventManager;
    }

    async createGame(tableId: string, players: PlayerState[]): Promise<GameState> {
        if (this.activeGames.has(tableId)) {
            throw new Error('Game already exists for this table');
        }

        const gameEngine = new PokerGameEngine();
        const gameState = gameEngine.createGame(tableId, players);

        this.activeGames.set(tableId, gameState);
        this.gameEngines.set(tableId, gameEngine);
        // Save game to database
        await databaseService.games.createGame({
            tableId,
            gameNumber: 1, // Would increment based on table's game history
            status: 'WAITING'
        });

        // Add participants to database
        for (const player of players) {
            await databaseService.games.addParticipant(gameState.id, {
                userId: player.id,
                position: player.position,
                startingChips: player.chips,
                buyInAmount: player.chips
            });
        }

        logger.info(`Game created for table ${tableId} with ${players.length} players`);
        return gameState;
    }

    async processAction(tableId: string, action: PlayerAction): Promise<{
        success: boolean;
        error?: string;
        gameState?: GameState;
    }> {
        const gameState = this.activeGames.get(tableId);
        const gameEngine = this.gameEngines.get(tableId);

        if (!gameState || !gameEngine) {
            return { success: false, error: 'Game not found' };
        }

        try {
            // Validate action
            const validActions = gameEngine.getValidActions(gameState, action.playerId);
            if (!validActions.includes(action.type)) {
                return { success: false, error: `Invalid action: ${action.type}` };
            }

            // Process action
            const newGameState = gameEngine.processAction(gameState, action);
            this.activeGames.set(tableId, newGameState);

            // Save event to database
            await databaseService.games.addEvent(gameState.id, {
                type: this.getEventType(action.type),
                data: action,
                playerId: action.playerId,
                phase: newGameState.phase,
                round: newGameState.round
            });

            // Update participant in database
            await databaseService.games.updateParticipant(gameState.id, action.playerId, {
                chips: newGameState.players.get(action.playerId)?.chips,
                currentBet: newGameState.players.get(action.playerId)?.currentBet,
                totalBet: newGameState.players.get(action.playerId)?.totalBet,
                status: this.getPlayerStatus(newGameState.players.get(action.playerId)?.status || 'active'),
                hasActed: newGameState.players.get(action.playerId)?.hasActed,
                lastAction: this.getLastAction(action.type)
            });

            // Check if game is finished
            if (gameEngine.isGameFinished(newGameState)) {
                await this.finishGame(tableId, newGameState);
            }

            logger.debug(`Action processed: ${action.type} by ${action.playerId}`);
            return { success: true, gameState: newGameState };

        } catch (error) {
            logger.error('Error processing action:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async startGame(tableId: string): Promise<{
        success: boolean;
        error?: string;
        gameState?: GameState;
    }> {
        const gameState = this.activeGames.get(tableId);
        const gameEngine = this.gameEngines.get(tableId);

        if (!gameState || !gameEngine) {
            return { success: false, error: 'Game not found' };
        }

        try {
            // Deal initial cards
            const newGameState = gameEngine.dealCards(gameState);
            this.activeGames.set(tableId, newGameState);

            // Update database
            await databaseService.games.updateGame(gameState.id, {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                currentPhase: 'PREFLOP',
                currentPlayerId: newGameState.currentPlayer || '',
                dealerPosition: newGameState.dealerPosition,
                smallBlindPos: newGameState.smallBlindPosition,
                bigBlindPos: newGameState.bigBlindPosition,
                actionStartTime: new Date()
            });

            // Add game started event
            await databaseService.games.addEvent(gameState.id, {
                type: 'GAME_STARTED',
                data: {
                    dealerPosition: newGameState.dealerPosition,
                    blinds: newGameState.blinds
                },
                phase: newGameState.phase,
                round: newGameState.round
            });

            logger.info(`Game started for table ${tableId}`);
            return { success: true, gameState: newGameState };

        } catch (error) {
            logger.error('Error starting game:', error);
            return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
        }
    }

    async setPlayerReady(tableId: string, playerId: string): Promise<void> {
        const gameState = this.activeGames.get(tableId);
        if (!gameState) {
            throw new Error('Game not found');
        }

        const player = gameState.players.get(playerId);
        if (!player) {
            throw new Error('Player not found in game');
        }

        // Mark player as ready (implementation depends on game state structure)
        // For now, just log the ready state
        logger.debug(`Player ${playerId} is ready for game ${tableId}`);
    }

    async getGameState(tableId: string): Promise<GameState | null> {
        return this.activeGames.get(tableId) || null;
    }

    private async finishGame(tableId: string, gameState: GameState): Promise<void> {
        const gameEngine = this.gameEngines.get(tableId);
        if (!gameEngine) return;

        // Determine winners
        const winners = gameEngine.determineWinners(gameState);
        const handResults = gameEngine.evaluateHands(gameState);

        // Award pot
        const finalGameState = gameEngine.awardPot(gameState, winners);
        this.activeGames.set(tableId, finalGameState);

        // Update database
        await databaseService.games.finishGame(gameState.id, winners[0], handResults.get(winners[0]));

        // Update player chips in database
        for (const [playerId, player] of finalGameState.players) {
            await databaseService.users.updateUser(playerId, {
                chips: player.chips
            });

            await databaseService.games.updateParticipant(gameState.id, playerId, {
                chips: player.chips,
                winnings: player.chips - (gameState.players.get(playerId)?.chips || 0),
                bestHand: handResults.get(playerId)
            });
        }

        // Add game finished event
        await databaseService.games.addEvent(gameState.id, {
            type: 'GAME_ENDED',
            data: {
                winners,
                handResults: Object.fromEntries(handResults)
            },
            phase: finalGameState.phase,
            round: finalGameState.round
        });

        // Clean up
        this.activeGames.delete(tableId);
        this.gameEngines.delete(tableId);

        logger.info(`Game finished for table ${tableId}, winners: ${winners.join(', ')}`);
    }

    private getEventType(actionType: string): string {
        const eventMap: Record<string, string> = {
            'fold': 'PLAYER_FOLDED',
            'check': 'PLAYER_CHECKED',
            'call': 'PLAYER_CALLED',
            'bet': 'BET_PLACED',
            'raise': 'PLAYER_RAISED',
            'all-in': 'PLAYER_ALL_IN'
        };

        return eventMap[actionType] || 'UNKNOWN_ACTION';
    }

    private getPlayerStatus(status: string): any {
        const statusMap: Record<string, string> = {
            'active': 'ACTIVE',
            'folded': 'FOLDED',
            'all-in': 'ALL_IN',
            'sitting-out': 'SITTING_OUT',
            'disconnected': 'DISCONNECTED'
        };

        return statusMap[status] || 'ACTIVE';
    }

    private getLastAction(actionType: string): any {
        const actionMap: Record<string, string> = {
            'fold': 'FOLD',
            'check': 'CHECK',
            'call': 'CALL',
            'bet': 'BET',
            'raise': 'RAISE',
            'all-in': 'ALL_IN'
        };

        return actionMap[actionType] || 'FOLD';
    }

    getActiveGameCount(): number {
        return this.activeGames.size;
    }

    getActiveGames(): string[] {
        return Array.from(this.activeGames.keys());
    }
}