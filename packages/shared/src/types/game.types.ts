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
  actionId?: string;
  isValid?: boolean;
  validationMessage?: string;
  timeToAct?: number;
  potOdds?: number;
  effectiveStack?: number;
}

export interface ActionValidationResult {
  isValid: boolean;
  errorCode?: string;
  message?: string;
  suggestedActions?: string[];
}

export interface BettingOptions {
  canFold: boolean;
  canCheck: boolean;
  canCall: boolean;
  canBet: boolean;
  canRaise: boolean;
  canAllIn: boolean;
  callAmount: number;
  minBet: number;
  minRaise: number;
  maxRaise: number;
  potSize: number;
}

export interface GameState {
  id: string;
  tableId: string;
  phase: GamePhase;
  pot: number;
  sidePots: SidePot[];
  communityCards: Card[];
  burnCards: Card[];
  currentPlayer: string | null;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  players: Map<string, PlayerState>;
  blinds: BlindStructure;
  bettingLimit: BettingLimit;
  round: number;
  handNumber: number;
  lastAction?: PlayerAction;
  actionHistory: PlayerAction[];
  actionStartTime?: number;
  actionTimeLimit: number;
  minRaise: number;
  totalActions: number;
  isHeadsUp: boolean;
  rakeAmount: number;
  rakePercent: number;
  gameType: GameType;
  tableConfig: TableConfig;
  stateVersion: number;
  createdAt: number;
  updatedAt: number;
}

export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished' | 'paused' | 'cancelled';

export type GameType = 'texas-holdem' | 'omaha' | 'omaha-hi-lo' | 'seven-card-stud' | 'five-card-draw';

export type BettingLimit = 'no-limit' | 'pot-limit' | 'fixed-limit';

export interface BlindStructure {
  small: number;
  big: number;
  ante?: number;
  level?: number;
  nextLevelAt?: number;
  timeRemaining?: number;
}

export interface PlayerState {
  id: string;
  name: string;
  avatarUrl?: string;
  chips: number;
  startingChips: number;
  currentBet: number;
  totalBet: number;
  totalInvested: number;
  cards: Card[];
  holeCards: Card[];
  position: number;
  seatNumber: number;
  status: PlayerStatus;
  hasActed: boolean;
  actionsThisRound: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isInPosition: boolean;
  timeBank: number;
  disconnectedAt?: number;
  lastActionTime?: number;
  handResult?: HandResult;
  sessionStats: PlayerSessionStats;
  isObserver: boolean;
  canRebuy: boolean;
  rebuyCount: number;
}

export type PlayerStatus = 'active' | 'folded' | 'all-in' | 'sitting-out' | 'disconnected' | 'waiting' | 'away';

export interface PlayerSessionStats {
  handsPlayed: number;
  handsWon: number;
  totalProfit: number;
  vpip: number;
  pfr: number;
  aggression: number;
  showdownWinRate: number;
  foldToBet: number;
  foldToRaise: number;
  cBetFreq: number;
  threeBetFreq: number;
  bigBlindsWon: number;
}

export interface SidePot {
  id: string;
  amount: number;
  eligiblePlayers: string[];
  winners: PotWinner[];
  isMainPot: boolean;
  maxContribution: number;
}

export interface PotWinner {
  playerId: string;
  amount: number;
  handResult: HandResult;
  share: number;
}

export interface HandResult {
  type: HandType;
  rank: number;
  strength: number;
  cards: Card[];
  playingCards: Card[];
  kickers: Card[];
  description: string;
  shortDescription: string;
  rawRank: number;
  isWinner: boolean;
  tieBreaker: number[];
  handValue: string;
}

export type HandType =
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
  phase: GamePhase;
  roundNumber: number;
  currentBet: number;
  totalPot: number;
  actions: PlayerAction[];
  isComplete: boolean;
  startTime: number;
  endTime?: number;
  aggressorId?: string;
  totalRaises: number;
  playersActed: Set<string>;
  communityCards: Card[];
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
  handId: string;
  handNumber: number;
  gameId: string;
  tableId: string;
  startTime: number;
  endTime: number;
  communityCards: Card[];
  burnCards: Card[];
  playerHands: Map<string, Card[]>;
  playerResults: Map<string, HandResult>;
  bettingRounds: BettingRound[];
  winners: GameWinner[];
  showdown: boolean;
  totalPot: number;
  rake: number;
  dealerPosition: number;
  blinds: BlindStructure;
  participants: string[];
  foldedPlayers: string[];
  allInPlayers: string[];
  showdownPlayers: string[];
}

export interface TableConfig {
  id: string;
  name: string;
  maxPlayers: number;
  minPlayers: number;
  blinds: BlindStructure;
  buyIn: BuyInConfig;
  gameType: GameType;
  bettingLimit: BettingLimit;
  isPrivate: boolean;
  password?: string;
  timeLimit: number;
  timeBankSeconds: number;
  rakePercent: number;
  rakeCap: number;
  allowRebuy: boolean;
  rebuyLimit: number;
  allowObservers: boolean;
  autoStartMinPlayers: number;
  blindLevelDuration?: number;
  isTournament: boolean;
  tournamentId?: string;
  description?: string;
  tags: string[];
  createdBy: string;
  createdAt: number;
  status: TableStatus;
}

export interface BuyInConfig {
  min: number;
  max: number;
  defaultAmount: number;
  allowShortBuy: boolean;
  shortBuyMin: number;
}

export type TableStatus = 'waiting' | 'active' | 'paused' | 'closed' | 'full' | 'breaking';

export interface GameFlow {
  currentPhase: GamePhase;
  nextPhase?: GamePhase;
  canAdvancePhase: boolean;
  phaseActions: PlayerAction[];
  phaseDuration: number;
  phaseStartTime: number;
  waitingForPlayers: string[];
  completedActions: Map<string, PlayerAction>;
  pendingActions: Map<string, BettingOptions>;
}

export interface GameTransition {
  from: GamePhase;
  to: GamePhase;
  trigger: TransitionTrigger;
  timestamp: number;
  playersInvolved: string[];
  data?: any;
}

export type TransitionTrigger = 
  | 'cards-dealt' 
  | 'betting-complete' 
  | 'showdown-required' 
  | 'game-finished' 
  | 'player-folded' 
  | 'timeout' 
  | 'manual';

export interface PokerGameEvents {
  onGameCreated: (gameState: GameState) => void;
  onCardsDealt: (gameState: GameState) => void;
  onActionRequired: (gameState: GameState, playerId: string, options: BettingOptions) => void;
  onActionProcessed: (gameState: GameState, action: PlayerAction) => void;
  onPhaseChanged: (gameState: GameState, transition: GameTransition) => void;
  onPotAwarded: (gameState: GameState, winners: GameWinner[]) => void;
  onGameFinished: (gameState: GameState, result: GameResult) => void;
  onPlayerDisconnected: (gameState: GameState, playerId: string) => void;
  onPlayerReconnected: (gameState: GameState, playerId: string) => void;
}

export interface ActionTimer {
  playerId: string;
  actionId: string;
  startTime: number;
  timeLimit: number;
  timeBank: number;
  warningTime: number;
  onTimeout: () => void;
  onWarning: () => void;
}

export interface RakeCalculation {
  potSize: number;
  rakePercent: number;
  rakeCap: number;
  rakeAmount: number;
  netPot: number;
  playersContributing: string[];
}

export interface Table {
  id: string;
  config: TableConfig;
  players: Map<string, PlayerState>;
  currentGame?: GameState;
  gameHistory: HandHistory[];
  waitingList: string[];
  observerCount: number;
  isActive: boolean;
  lastActivity: number;
  createdAt: number;
  totalHands: number;
  averagePotSize: number;
  seatsOccupied: number;
  nextGameStartTime?: number;
  blindLevelStartTime?: number;
}
