// packages/shared/src/interfaces/game.interface.ts
import {
  Card,
  PlayerAction,
  GameState,
  PlayerState,
  HandResult,
  TableConfig,
  Table,
  ActionValidationResult,
  BettingOptions,
  GameFlow,
  GameTransition,
  RakeCalculation,
  ActionTimer,
  BettingLimit,
  GamePhase,
  GameType,
  PlayerSessionStats,
  PokerSession,
  HandRound,
  SessionPlayer,
  SessionConfig,
  SessionType,
  SessionStatus,
  HandStatus,
  TimeSettings,
  SessionStatistics,
  SidePot,
} from '../types';

export interface IGameEngine {
  createGame(tableConfig: TableConfig, players: PlayerState[]): GameState;
  processAction(gameState: GameState, action: PlayerAction): GameState;
  dealCards(gameState: GameState): GameState;
  evaluateHands(gameState: GameState): Map<string, HandResult>;
  determineWinners(gameState: GameState): string[];
  awardPot(gameState: GameState, winners: string[]): GameState;
  isGameFinished(gameState: GameState): boolean;
  getValidActions(gameState: GameState, playerId: string): string[];
  getBettingOptions(gameState: GameState, playerId: string): BettingOptions;
  validateAction(gameState: GameState, action: PlayerAction): ActionValidationResult;
  calculatePotOdds(gameState: GameState, betAmount: number): number;
  calculateRake(gameState: GameState): RakeCalculation;
  getGameFlow(gameState: GameState): GameFlow;
  advancePhase(gameState: GameState): GameTransition;
  resetForNewHand(gameState: GameState): GameState;
  canStartGame(players: PlayerState[]): boolean;
  calculateEffectiveStack(gameState: GameState, playerId: string): number;
  getPlayerPosition(gameState: GameState, playerId: string): 'early' | 'middle' | 'late' | 'blinds';
}

export interface IHandEvaluator {
  evaluateHand(cards: Card[]): HandResult;
  compareHands(hand1: HandResult, hand2: HandResult): number;
  getBestHand(cards: Card[]): HandResult;
  findBestFiveCards(cards: Card[]): Card[];
  calculateHandStrength(cards: Card[], communityCards: Card[]): number;
  getHandEquity(playerCards: Card[], communityCards: Card[], opponents: number): number;
  getRankDescription(handResult: HandResult): string;
  getShortDescription(handResult: HandResult): string;
  isDrawPossible(communityCards: Card[], drawType: 'straight' | 'flush' | 'full-house'): boolean;
  countOuts(playerCards: Card[], communityCards: Card[]): number;
}

export interface IDeck {
  shuffle(seed?: string): void;
  deal(count: number): Card[];
  burn(count?: number): Card[];
  reset(): void;
  getRemainingCount(): number;
  isEmpty(): boolean;
  peek(count: number): Card[];
  addCard(card: Card): void;
  removeCard(card: Card): boolean;
  getAllCards(): Card[];
  getShuffledDeck(): Card[];
  canDeal(count: number): boolean;
  validateDeck(): boolean;
}

export interface ITableManager {
  createTable(config: TableConfig): Table;
  addPlayer(tableId: string, player: PlayerState): boolean;
  removePlayer(tableId: string, playerId: string): boolean;
  getTable(tableId: string): Table | null;
  getAllTables(): Table[];
  updateTable(table: Table): void;
  deleteTable(tableId: string): void;
  canJoinTable(tableId: string, playerId: string): boolean;
  getAvailableSeats(tableId: string): number[];
  reserveSeat(tableId: string, playerId: string, seatNumber: number): boolean;
  releaseSeat(tableId: string, playerId: string): boolean;
  getTableStats(tableId: string): TableStats;
  findTablesByFilters(filters: TableFilters): Table[];
}

export interface IActionTimer {
  startTimer(timer: ActionTimer): void;
  stopTimer(playerId: string): void;
  getTimeRemaining(playerId: string): number;
  extendTimer(playerId: string, additionalTime: number): void;
  onTimeout(playerId: string, callback: () => void): void;
  onWarning(playerId: string, callback: () => void): void;
}

export interface IGameFlow {
  canAdvancePhase(gameState: GameState): boolean;
  getNextPhase(currentPhase: GamePhase): GamePhase | null;
  shouldShowdown(gameState: GameState): boolean;
  isHandComplete(gameState: GameState): boolean;
  getWaitingPlayers(gameState: GameState): string[];
  updateFlow(gameState: GameState, action: PlayerAction): GameFlow;
}

export interface IStatisticsTracker {
  updatePlayerStats(playerId: string, action: PlayerAction, gameState: GameState): void;
  getPlayerStats(playerId: string): PlayerSessionStats;
  calculateVPIP(playerId: string): number;
  calculatePFR(playerId: string): number;
  calculateAggression(playerId: string): number;
  resetSessionStats(playerId: string): void;
  getTableAverageStats(tableId: string): PlayerSessionStats;
}

export interface TableStats {
  averagePot: number;
  handsPerHour: number;
  playersPerFlop: number;
  averageVPIP: number;
  totalHandsPlayed: number;
  currentStreak: number;
}

export interface TableFilters {
  gameType?: GameType[];
  bettingLimit?: BettingLimit[];
  minPlayers?: number;
  maxPlayers?: number;
  stakesMin?: number;
  stakesMax?: number;
  isPrivate?: boolean;
  hasAvailableSeats?: boolean;
}

export interface ISessionManager {
  createSession(config: SessionConfig, tableId: string): PokerSession;
  startSession(sessionId: string): boolean;
  pauseSession(sessionId: string, reason?: string): boolean;
  resumeSession(sessionId: string): boolean;
  endSession(sessionId: string): boolean;
  addPlayer(sessionId: string, player: SessionPlayer): boolean;
  removePlayer(sessionId: string, playerId: string): boolean;
  getSession(sessionId: string): PokerSession | null;
  getAllSessions(): PokerSession[];
  updateSessionConfig(sessionId: string, config: Partial<SessionConfig>): boolean;
}

export interface IHandRoundManager {
  startNewHand(sessionId: string): HandRound;
  dealHand(handId: string): HandRound;
  processHandAction(handId: string, action: PlayerAction): HandRound;
  completeHand(handId: string): HandRound;
  cancelHand(handId: string, reason: string): HandRound;
  getHand(handId: string): HandRound | null;
  getCurrentHand(sessionId: string): HandRound | null;
  getHandHistory(sessionId: string, limit?: number): HandRound[];
}

export interface IUnlimitedHoldemEngine {
  validateBet(gameState: GameState, playerId: string, amount: number): boolean;
  calculateMinRaise(gameState: GameState): number;
  calculateMaxBet(gameState: GameState, playerId: string): number;
  processAllInScenario(gameState: GameState, playerId: string): GameState;
  calculateSidePots(gameState: GameState): SidePot[];
  isNoLimitAction(action: PlayerAction, gameState: GameState): boolean;
}

export interface ISessionLifecycle {
  canStartSession(session: PokerSession): boolean;
  shouldAutoStartHand(session: PokerSession): boolean;
  getNextDealerPosition(session: PokerSession): number;
  updatePlayerPositions(session: PokerSession): void;
  handlePlayerDisconnection(sessionId: string, playerId: string): void;
  handlePlayerReconnection(sessionId: string, playerId: string): void;
  cleanupInactiveSessions(): void;
}

export interface ISessionStatistics {
  updateHandStatistics(session: PokerSession, hand: HandRound): void;
  calculateSessionStats(sessionId: string): SessionStatistics;
  getPlayerStats(sessionId: string, playerId: string): PlayerSessionStats;
  generateSessionReport(sessionId: string): SessionReport;
  exportSessionData(sessionId: string): SessionExportData;
}

export interface SessionReport {
  sessionId: string;
  duration: number;
  totalHands: number;
  totalPlayers: number;
  biggestWinner: string;
  biggestLoser: string;
  biggestPot: number;
  totalRake: number;
  averageHandDuration: number;
  playersPerFlop: number;
  showdownRate: number;
}

export interface SessionExportData {
  session: PokerSession;
  hands: HandRound[];
  playerSummaries: PlayerSummary[];
  statistics: SessionStatistics;
  exportedAt: number;
  format: 'json' | 'csv' | 'xml';
}

export interface PlayerSummary {
  playerId: string;
  playerName: string;
  buyIn: number;
  cashOut: number;
  profit: number;
  handsPlayed: number;
  handsWon: number;
  vpip: number;
  pfr: number;
  aggression: number;
  sessionDuration: number;
}
