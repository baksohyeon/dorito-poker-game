// packages/shared/src/types/tournament.types.ts
import { Player } from './player.types';
import { GameResult } from './game.types';

export interface Tournament {
  id: string;
  name: string;
  type: 'sit-n-go' | 'scheduled' | 'freeroll' | 'satellite';
  status: 'registering' | 'starting' | 'in-progress' | 'finished' | 'cancelled';
  structure: TournamentStructure;
  buyIn: {
    chips: number;
    fee: number;
  };
  prizePool: PrizePool;
  participants: TournamentParticipant[];
  tables: string[]; // Table IDs
  currentLevel: number;
  startTime: Date;
  endTime?: Date;
  registrationEnd: Date;
  maxPlayers: number;
  minPlayers: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentStructure {
  levels: BlindLevel[];
  levelDuration: number; // minutes
  startingChips: number;
  rebuyPeriod?: number; // levels during which rebuy is allowed
  rebuyAmount?: number;
  addOnPeriod?: number;
  addOnAmount?: number;
  anteBlinds?: boolean;
}

export interface BlindLevel {
  level: number;
  smallBlind: number;
  bigBlind: number;
  ante?: number;
  duration: number; // minutes
}

export interface PrizePool {
  total: number;
  distribution: PrizeDistribution[];
  guaranteed?: number;
}

export interface PrizeDistribution {
  position: number;
  percentage: number;
  amount: number;
}

export interface TournamentParticipant {
  playerId: string;
  player: Player;
  registrationTime: Date;
  status: 'registered' | 'active' | 'eliminated' | 'withdrawn';
  currentTable?: string;
  currentSeat?: number;
  chips: number;
  position?: number; // Final position if eliminated
  prize?: number;
  eliminatedAt?: Date;
  eliminatedBy?: string;
}

export interface TournamentResult {
  tournamentId: string;
  finalPositions: TournamentParticipant[];
  prizesPaid: PrizeDistribution[];
  duration: number;
  totalEntrants: number;
  gamesPlayed: GameResult[];
}

export interface SitAndGo extends Tournament {
  type: 'sit-n-go';
  autoStart: boolean;
  tableSize: 2 | 6 | 9 | 10;
}

export interface ScheduledTournament extends Tournament {
  type: 'scheduled';
  lateRegistration: boolean;
  lateRegistrationPeriod?: number; // levels
}
