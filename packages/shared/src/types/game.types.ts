export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank:
    | 'A'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9'
    | '10'
    | 'J'
    | 'Q'
    | 'K';
  value: number; // For sorting and comparison
}

export interface PlayerAction {
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  timestamp: number;
  playerId: string;
}

export interface GameState {
  id: string;
  tableId: string;
  phase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  pot: number;
  sidePots: SidePot[];
  communityCards: Card[];
  currentPlayer: string | null;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  players: Map<string, PlayerState>;
  blinds: {
    small: number;
    big: number;
  };
  round: number;
  lastAction?: PlayerAction;
  actionStartTime?: number;
  actionTimeLimit: number;
}

export interface PlayerState {
  id: string;
  name: string;
  chips: number;
  currentBet: number;
  totalBet: number;
  cards: Card[];
  position: number;
  status: 'active' | 'folded' | 'all-in' | 'sitting-out' | 'disconnected';
  hasActed: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
}

export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
  winnerId?: string;
}

export interface HandResult {
  type:
    | 'high-card'
    | 'pair'
    | 'two-pair'
    | 'three-of-a-kind'
    | 'straight'
    | 'flush'
    | 'full-house'
    | 'four-of-a-kind'
    | 'straight-flush'
    | 'royal-flush';
  rank: number; // 1-10, higher is better
  cards: Card[]; // Best 5 cards
  description: string;
  kickers?: Card[]; // Tie-breaking cards
}

export interface GameResult {
  gameId: string;
  winners: GameWinner[];
  duration: number;
  totalPot: number;
  handsPlayed: number;
  endReason: 'normal' | 'timeout' | 'cancelled' | 'server-error';
  finalPositions: PlayerPosition[];
}

export interface GameWinner {
  playerId: string;
  amount: number;
  handResult: HandResult;
  sidePot?: number;
}

export interface PlayerPosition {
  playerId: string;
  position: number;
  profit: number;
  handsPlayed: number;
  vpip: number;
  pfr: number;
}

export interface BettingRound {
  phase: 'preflop' | 'flop' | 'turn' | 'river';
  currentBet: number;
  totalPot: number;
  actions: PlayerAction[];
  isComplete: boolean;
}

export interface GameHistory {
  gameId: string;
  tableId: string;
  startTime: Date;
  endTime: Date;
  participants: PlayerPosition[];
  hands: HandHistory[];
  finalResult: GameResult;
}

export interface HandHistory {
  handNumber: number;
  communityCards: Card[];
  playerHands: Map<string, Card[]>;
  bettingRounds: BettingRound[];
  winner: GameWinner;
  showdown: boolean;
}

export interface TableConfig {
  id: string;
  name?: string;
  maxPlayers: number;
  minPlayers: number;
  blinds: {
    small: number;
    big: number;
  };
  buyIn: {
    min: number;
    max: number;
  };
  gameType: 'texas-holdem' | 'omaha' | 'seven-card-stud';
  isPrivate: boolean;
  password?: string;
  timeLimit: number; // seconds per action
}
