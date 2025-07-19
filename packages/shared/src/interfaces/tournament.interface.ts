// packages/shared/src/interfaces/tournament.interface.ts
import {
  Tournament,
  TournamentStructure,
  TournamentParticipant,
  TournamentResult,
  SitAndGo,
  ScheduledTournament,
  BlindLevel,
} from '../types/tournament.types';
// import { Player } from '../types/player.types';

export interface ITournamentManager {
  // Tournament lifecycle
  createTournament(config: Partial<Tournament>): Promise<Tournament>;
  startTournament(tournamentId: string): Promise<boolean>;
  pauseTournament(tournamentId: string): Promise<boolean>;
  resumeTournament(tournamentId: string): Promise<boolean>;
  cancelTournament(tournamentId: string, reason: string): Promise<boolean>;
  finishTournament(tournamentId: string): Promise<TournamentResult>;

  // Registration
  registerPlayer(tournamentId: string, playerId: string): Promise<boolean>;
  unregisterPlayer(tournamentId: string, playerId: string): Promise<boolean>;
  getRegisteredPlayers(tournamentId: string): Promise<TournamentParticipant[]>;

  // Tournament operations
  eliminatePlayer(
    tournamentId: string,
    playerId: string,
    position: number
  ): Promise<void>;
  movePlayer(
    tournamentId: string,
    playerId: string,
    newTableId: string,
    newSeat: number
  ): Promise<void>;
  balanceTables(tournamentId: string): Promise<void>;
  advanceBlindLevel(tournamentId: string): Promise<BlindLevel>;

  // Queries
  getTournament(tournamentId: string): Promise<Tournament | null>;
  getActiveTournaments(): Promise<Tournament[]>;
  getScheduledTournaments(): Promise<ScheduledTournament[]>;
  getSitAndGoTournaments(): Promise<SitAndGo[]>;
  getTournamentHistory(playerId: string): Promise<Tournament[]>;

  // Statistics
  getTournamentStats(tournamentId: string): Promise<TournamentStats>;
  getPlayerTournamentStats(playerId: string): Promise<PlayerTournamentStats>;
}

export interface ITournamentRepository {
  create(tournament: Partial<Tournament>): Promise<Tournament>;
  findById(id: string): Promise<Tournament | null>;
  update(id: string, updates: Partial<Tournament>): Promise<Tournament>;
  delete(id: string): Promise<void>;

  // Queries
  findByStatus(status: Tournament['status']): Promise<Tournament[]>;
  findByType(type: Tournament['type']): Promise<Tournament[]>;
  findByDateRange(from: Date, to: Date): Promise<Tournament[]>;
  findAvailable(): Promise<Tournament[]>;

  // Participants
  addParticipant(
    tournamentId: string,
    participant: Partial<TournamentParticipant>
  ): Promise<TournamentParticipant>;
  removeParticipant(tournamentId: string, playerId: string): Promise<void>;
  updateParticipant(
    tournamentId: string,
    playerId: string,
    updates: Partial<TournamentParticipant>
  ): Promise<TournamentParticipant>;
  getParticipants(tournamentId: string): Promise<TournamentParticipant[]>;
}

export interface IBlindStructureService {
  createStructure(levels: Partial<BlindLevel>[]): TournamentStructure;
  validateStructure(structure: TournamentStructure): boolean;
  calculateNextLevel(
    structure: TournamentStructure,
    currentLevel: number
  ): BlindLevel | null;
  getStandardStructures(): TournamentStructure[];
  estimateDuration(structure: TournamentStructure, playerCount: number): number; // minutes
}

export interface IPrizePoolService {
  calculatePrizePool(
    buyIn: number,
    playerCount: number,
    guaranteed?: number
  ): number;
  distributePrizes(
    totalPrize: number,
    playerCount: number,
    structure?: 'standard' | 'top-heavy' | 'flat'
  ): number[];
  applyTournamentFees(
    buyIn: number,
    feePercentage: number
  ): { prize: number; fee: number };
}

export interface ITournamentTableManager {
  createTables(
    tournamentId: string,
    playerCount: number,
    tableSize: number
  ): Promise<string[]>;
  seatPlayers(
    tournamentId: string,
    players: TournamentParticipant[]
  ): Promise<void>;
  balanceTables(tournamentId: string): Promise<void>;
  consolidateTables(tournamentId: string): Promise<void>;
  movePlayerToTable(
    tournamentId: string,
    playerId: string,
    targetTableId: string
  ): Promise<void>;
  getTableAssignments(tournamentId: string): Promise<Map<string, string[]>>; // tableId -> playerIds
}

export interface TournamentStats {
  tournamentId: string;
  totalEntrants: number;
  currentEntrants: number;
  averageChips: number;
  chipsInPlay: number;
  playersEliminated: number;
  tablesActive: number;
  handsPlayed: number;
  duration: number; // minutes
  prizePoolTotal: number;
  averageStackSize: number;
}

export interface PlayerTournamentStats {
  playerId: string;
  tournamentsPlayed: number;
  tournamentsWon: number;
  tournamentsCashed: number;
  totalWinnings: number;
  averageFinishPosition: number;
  bestFinish: number;
  itm: number; // In The Money percentage
  roi: number; // Return on Investment percentage
  averageBuyIn: number;
}
