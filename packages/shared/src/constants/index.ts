// packages/shared/src/constants/index.ts
import { Card, PlayerAction, GameState, PlayerState, HandResult, Table, TableConfig } from '../types';

export { ERROR_CODES, ERROR_MESSAGES } from './error.constants';



export interface IGameEngine {
    createGame(tableId: string, players: PlayerState[]): GameState;
    processAction(gameState: GameState, action: PlayerAction): GameState;
    dealCards(gameState: GameState): GameState;
    evaluateHands(gameState: GameState): Map<string, HandResult>;
    determineWinners(gameState: GameState): string[];
    awardPot(gameState: GameState, winners: string[]): GameState;
    isGameFinished(gameState: GameState): boolean;
    getValidActions(gameState: GameState, playerId: string): string[];
    calculatePotOdds(gameState: GameState, betAmount: number): number;
}

export interface IHandEvaluator {
    evaluateHand(cards: Card[]): HandResult;
    compareHands(hand1: HandResult, hand2: HandResult): number;
    getBestHand(cards: Card[]): HandResult;
    findBestFiveCards(cards: Card[]): Card[];
}

export interface IDeck {
    shuffle(seed?: string): void;
    deal(count: number): Card[];
    reset(): void;
    getRemainingCount(): number;
    isEmpty(): boolean;
}

export interface ITableManager {
    createTable(config: TableConfig): Table;
    addPlayer(tableId: string, player: PlayerState): boolean;
    removePlayer(tableId: string, playerId: string): boolean;
    getTable(tableId: string): Table | null;
    getAllTables(): Table[];
    updateTable(table: Table): void;
    deleteTable(tableId: string): void;
}
