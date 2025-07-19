// Client-side types for the poker game

export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
  value: number;
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
  avatar?: string;
  isConnected?: boolean;
  timebank?: number;
}

export interface GameState {
  id: string;
  tableId: string;
  phase: 'waiting' | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'finished';
  pot: number;
  sidePots: SidePot[];
  communityCards: Card[];
  currentPlayer: string | null;
  dealerPosition: number;
  smallBlindPosition: number;
  bigBlindPosition: number;
  players: Map<string, PlayerState>;
  blinds: { small: number; big: number };
  round: number;
  lastAction?: PlayerAction;
  actionStartTime?: number;
  actionTimeLimit: number;
  winners?: string[];
  showdown?: boolean;
}

export interface SidePot {
  amount: number;
  eligiblePlayers: string[];
}

export interface PlayerAction {
  playerId: string;
  type: 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in';
  amount?: number;
  timestamp: number;
}

export interface Table {
  id: string;
  name: string;
  maxPlayers: number;
  minPlayers: number;
  blinds: { small: number; big: number };
  buyIn: { min: number; max: number };
  status: 'waiting' | 'active' | 'full';
  playerCount: number;
  isPrivate: boolean;
  gameType: 'texas-holdem' | 'omaha';
}

export interface User {
  id: string;
  username: string;
  email: string;
  chips: number;
  avatar?: string;
  level: number;
  experience: number;
  gamesPlayed: number;
  gamesWon: number;
  totalWinnings: number;
  isOnline: boolean;
  lastSeen: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
  type: 'chat' | 'emote' | 'system';
}

export interface GameActionResult {
  success: boolean;
  action: PlayerAction;
  error?: string;
  gameState?: GameState;
}

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
}

// Socket event types
export interface ServerToClientEvents {
  // Connection events
  'notification': (data: { type: string; message: string }) => void;
  'error': (data: { code: string; message: string }) => void;
  
  // Table events
  'table:updated': (data: { table: Table }) => void;
  'table:player-joined': (data: { player: PlayerState }) => void;
  'table:player-left': (data: { playerId: string }) => void;
  
  // Game events
  'game:state-update': (data: { gameState: GameState }) => void;
  'game:state-sync': (data: { fullState: GameState }) => void;
  'game:action-result': (data: GameActionResult) => void;
  'game:started': (data: { gameState: GameState }) => void;
  'game:ended': (data: { winners: string[]; gameState: GameState }) => void;
  
  // Player events
  'player:reconnected': (data: { playerId: string }) => void;
  'player:disconnected': (data: { playerId: string; timeoutRemaining: number }) => void;
  'player:turn': (data: { playerId: string; timeLimit: number }) => void;
  'player:action-timeout': (data: { playerId: string }) => void;
  
  // Chat events
  'chat:message': (data: ChatMessage) => void;
  
  // System events
  'heartbeat_ack': () => void;
  'pong': (data: { timestamp: number; serverId: string }) => void;
}

export interface ClientToServerEvents {
  // Table events
  'player:join-table': (data: { tableId: string; position?: number }) => void;
  'player:leave-table': () => void;
  'player:reconnect': (data: { reconnectToken: string }) => void;
  
  // Game events
  'game:action': (data: { action: PlayerAction }) => void;
  'game:ready': () => void;
  
  // Chat events
  'chat:message': (data: { message: string; type?: 'chat' | 'emote' }) => void;
  
  // Connection events
  'heartbeat': () => void;
  'ping': () => void;
}

// UI State types
export interface GameUIState {
  selectedChips: number;
  isActionsVisible: boolean;
  betSliderValue: number;
  showCards: boolean;
  animationsEnabled: boolean;
  soundEnabled: boolean;
  autoActions: {
    autoCheck: boolean;
    autoCall: boolean;
    autoFold: boolean;
  };
}

export interface TablePosition {
  x: number;
  y: number;
  rotation: number;
}

export interface ChipStack {
  value: number;
  count: number;
  color: string;
}

export interface HandHistory {
  id: string;
  gameId: string;
  startTime: Date;
  endTime: Date;
  players: PlayerState[];
  actions: PlayerAction[];
  communityCards: Card[];
  pot: number;
  winners: string[];
  showdown: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface TableListResponse {
  tables: Table[];
  total: number;
  page: number;
  limit: number;
}

// Game Statistics
export interface GameStats {
  handsPlayed: number;
  handsWon: number;
  winRate: number;
  biggestPot: number;
  totalWinnings: number;
  averagePot: number;
  foldRate: number;
  vpip: number; // Voluntarily Put In Pot
  pfr: number; // Pre-Flop Raise
}

// Configuration
export interface GameConfig {
  sounds: {
    enabled: boolean;
    volume: number;
    cardSounds: boolean;
    chipSounds: boolean;
    dealerSounds: boolean;
  };
  animations: {
    enabled: boolean;
    cardDealing: boolean;
    chipMovement: boolean;
    playerActions: boolean;
  };
  ui: {
    theme: 'dark' | 'light' | 'classic';
    tableColor: string;
    cardBack: string;
    showPlayerNames: boolean;
    showChipAmounts: boolean;
    autoResize: boolean;
  };
  gameplay: {
    autoMuck: boolean;
    confirmActions: boolean;
    timebank: boolean;
    handHistory: boolean;
  };
}

// Error types
export interface GameError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ConnectionError extends GameError {
  type: 'connection' | 'authentication' | 'network';
  retryable: boolean;
}

// Lobby types
export interface LobbyState {
  tables: Table[];
  activeGames: number;
  playersOnline: number;
  isLoading: boolean;
  filters: {
    gameType: string;
    stakes: string;
    playerCount: string;
  };
}

// Tournament types (for future expansion)
export interface Tournament {
  id: string;
  name: string;
  type: 'sit-n-go' | 'scheduled' | 'satellite';
  buyIn: number;
  fee: number;
  startTime: Date;
  playersRegistered: number;
  maxPlayers: number;
  status: 'registering' | 'running' | 'finished';
  prizePool: number;
  structure: string;
}