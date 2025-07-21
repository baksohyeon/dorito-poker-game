import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../store/hooks';
import { openModal } from '../store/slices/uiSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Clock, 
  Filter, 
  Search, 
  RefreshCw,
  Play,
  Eye,
  Crown,
  Zap,
  Shield,
  Target,
  Plus,
  AlertCircle,
  CheckCircle} from 'lucide-react';
import { RootState } from '../store';
import { formatChips } from '../utils/formatting';

interface PokerTable {
  id: string;
  name: string;
  type: 'cash' | 'tournament' | 'sit-n-go';
  status: 'waiting' | 'playing' | 'finished' | 'starting';
  players: number;
  maxPlayers: number;
  minBuyIn: number;
  maxBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  averageStack: number;
  pot: number;
  gameStage?: string;
  timeBank: number;
  isPrivate: boolean;
  isHighStakes: boolean;
  isFastPaced: boolean;
  createdBy: string;
  createdAt: string;
  lastAction?: string;
  playersList: TablePlayer[];
}

interface TablePlayer {
  id: string;
  username: string;
  chips: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isActive: boolean;
  isAllIn: boolean;
  isFolded: boolean;
  avatar?: string;
  level: number;
  rank?: string;
}

interface TableFilter {
  type: 'all' | 'cash' | 'tournament' | 'sit-n-go';
  status: 'all' | 'waiting' | 'playing' | 'starting';
  stakes: 'all' | 'low' | 'medium' | 'high';
  players: 'all' | 'empty' | 'full' | 'available';
}

const TablesPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [tables, setTables] = useState<PokerTable[]>([]);
  const [filter, setFilter] = useState<TableFilter>({
    type: 'all',
    status: 'all',
    stakes: 'all',
    players: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'players' | 'stakes' | 'pot'>('players');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Mock data for demonstration
  useEffect(() => {
    const mockTables: PokerTable[] = [
      {
        id: 'table-1',
        name: 'High Stakes Hold\'em',
        type: 'cash',
        status: 'playing',
        players: 6,
        maxPlayers: 9,
        minBuyIn: 1000,
        maxBuyIn: 5000,
        smallBlind: 10,
        bigBlind: 20,
        averageStack: 2500,
        pot: 450,
        gameStage: 'flop',
        timeBank: 30,
        isPrivate: false,
        isHighStakes: true,
        isFastPaced: false,
        createdBy: 'PokerKing',
        createdAt: '2024-01-15T10:00:00Z',
        lastAction: 'River card dealt',
        playersList: [
          { id: '1', username: 'PokerKing', chips: 3200, isDealer: true, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 42 },
          { id: '2', username: 'AceQueen', chips: 1800, isDealer: false, isSmallBlind: true, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 38 },
          { id: '3', username: 'RoyalFlush', chips: 2100, isDealer: false, isSmallBlind: false, isBigBlind: true, isActive: true, isAllIn: false, isFolded: false, level: 35 },
          { id: '4', username: 'BluffMaster', chips: 950, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 32 },
          { id: '5', username: 'ChipCollector', chips: 2800, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 29 },
          { id: '6', username: 'LuckySeven', chips: 1200, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 26 }
        ]
      },
      {
        id: 'table-2',
        name: 'Quick Play Tournament',
        type: 'tournament',
        status: 'starting',
        players: 8,
        maxPlayers: 9,
        minBuyIn: 100,
        maxBuyIn: 100,
        smallBlind: 5,
        bigBlind: 10,
        averageStack: 1500,
        pot: 0,
        timeBank: 15,
        isPrivate: false,
        isHighStakes: false,
        isFastPaced: true,
        createdBy: 'TournamentHost',
        createdAt: '2024-01-15T14:30:00Z',
        playersList: [
          { id: '7', username: 'TournamentHost', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 25 },
          { id: '8', username: 'FastPlayer', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 18 },
          { id: '9', username: 'QuickWin', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 22 },
          { id: '10', username: 'SpeedDemon', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 20 },
          { id: '11', username: 'RapidFire', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 16 },
          { id: '12', username: 'SwiftHand', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 19 },
          { id: '13', username: 'FastTrack', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 17 },
          { id: '14', username: 'QuickDraw', chips: 1500, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 21 }
        ]
      },
      {
        id: 'table-3',
        name: 'Beginner Friendly',
        type: 'cash',
        status: 'waiting',
        players: 3,
        maxPlayers: 6,
        minBuyIn: 100,
        maxBuyIn: 500,
        smallBlind: 1,
        bigBlind: 2,
        averageStack: 300,
        pot: 0,
        timeBank: 60,
        isPrivate: false,
        isHighStakes: false,
        isFastPaced: false,
        createdBy: 'NewPlayer',
        createdAt: '2024-01-15T15:00:00Z',
        playersList: [
          { id: '15', username: 'NewPlayer', chips: 400, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 5 },
          { id: '16', username: 'LearningPoker', chips: 250, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 3 },
          { id: '17', username: 'FirstTime', chips: 350, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 1 }
        ]
      },
      {
        id: 'table-4',
        name: 'Sit & Go Championship',
        type: 'sit-n-go',
        status: 'waiting',
        players: 1,
        maxPlayers: 9,
        minBuyIn: 200,
        maxBuyIn: 200,
        smallBlind: 10,
        bigBlind: 20,
        averageStack: 900,
        pot: 0,
        timeBank: 45,
        isPrivate: false,
        isHighStakes: false,
        isFastPaced: true,
        createdBy: 'SitGoMaster',
        createdAt: '2024-01-15T16:00:00Z',
        playersList: [
          { id: '18', username: 'SitGoMaster', chips: 900, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 30 }
        ]
      },
      {
        id: 'table-5',
        name: 'VIP Private Table',
        type: 'cash',
        status: 'playing',
        players: 4,
        maxPlayers: 6,
        minBuyIn: 5000,
        maxBuyIn: 25000,
        smallBlind: 50,
        bigBlind: 100,
        averageStack: 15000,
        pot: 1200,
        gameStage: 'turn',
        timeBank: 20,
        isPrivate: true,
        isHighStakes: true,
        isFastPaced: false,
        createdBy: 'VIPHost',
        createdAt: '2024-01-15T12:00:00Z',
        lastAction: 'Player raised to 300',
        playersList: [
          { id: '19', username: 'VIPHost', chips: 18000, isDealer: true, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 45 },
          { id: '20', username: 'HighRoller', chips: 22000, isDealer: false, isSmallBlind: true, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 48 },
          { id: '21', username: 'ElitePlayer', chips: 12000, isDealer: false, isSmallBlind: false, isBigBlind: true, isActive: true, isAllIn: false, isFolded: false, level: 42 },
          { id: '22', username: 'PremiumUser', chips: 8000, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 40 }
        ]
      },
      {
        id: 'table-6',
        name: 'Speed Poker Arena',
        type: 'cash',
        status: 'playing',
        players: 7,
        maxPlayers: 8,
        minBuyIn: 200,
        maxBuyIn: 1000,
        smallBlind: 5,
        bigBlind: 10,
        averageStack: 600,
        pot: 85,
        gameStage: 'preflop',
        timeBank: 10,
        isPrivate: false,
        isHighStakes: false,
        isFastPaced: true,
        createdBy: 'SpeedMaster',
        createdAt: '2024-01-15T13:00:00Z',
        lastAction: 'Player called 10',
        playersList: [
          { id: '23', username: 'SpeedMaster', chips: 750, isDealer: true, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 28 },
          { id: '24', username: 'FastAction', chips: 450, isDealer: false, isSmallBlind: true, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 24 },
          { id: '25', username: 'QuickMove', chips: 680, isDealer: false, isSmallBlind: false, isBigBlind: true, isActive: true, isAllIn: false, isFolded: false, level: 26 },
          { id: '26', username: 'RapidPlay', chips: 320, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 22 },
          { id: '27', username: 'SwiftAction', chips: 890, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 25 },
          { id: '28', username: 'FastHand', chips: 540, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 23 },
          { id: '29', username: 'QuickPlay', chips: 380, isDealer: false, isSmallBlind: false, isBigBlind: false, isActive: true, isAllIn: false, isFolded: false, level: 20 }
        ]
      }
    ];

    setTables(mockTables);
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'playing': return <Play className="w-4 h-4 text-green-400" />;
      case 'starting': return <Zap className="w-4 h-4 text-blue-400" />;
      case 'finished': return <CheckCircle className="w-4 h-4 text-gray-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-400';
      case 'playing': return 'text-green-400';
      case 'starting': return 'text-blue-400';
      case 'finished': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getStakesLevel = (bigBlind: number) => {
    if (bigBlind >= 50) return 'high';
    if (bigBlind >= 10) return 'medium';
    return 'low';
  };

  const getStakesColor = (stakes: string) => {
    switch (stakes) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filter.type === 'all' || table.type === filter.type;
    const matchesStatus = filter.status === 'all' || table.status === filter.status;
    const matchesStakes = filter.stakes === 'all' || getStakesLevel(table.bigBlind) === filter.stakes;
    const matchesPlayers = filter.players === 'all' || 
      (filter.players === 'empty' && table.players === 0) ||
      (filter.players === 'full' && table.players === table.maxPlayers) ||
      (filter.players === 'available' && table.players < table.maxPlayers);

    return matchesSearch && matchesType && matchesStatus && matchesStakes && matchesPlayers;
  });

  const sortedTables = [...filteredTables].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'players':
        aValue = a.players;
        bValue = b.players;
        break;
      case 'stakes':
        aValue = a.bigBlind;
        bValue = b.bigBlind;
        break;
      case 'pot':
        aValue = a.pot;
        bValue = b.pot;
        break;
      default:
        aValue = a.players;
        bValue = b.players;
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleJoinTable = (tableId: string) => {
    navigate(`/table/${tableId}`);
  };

  const handleCreateTable = () => {
    dispatch(openModal({ type: 'table-create' }));
  };

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Poker Tables</h1>
              <p className="text-gray-400">Join a game or create your own table</p>
            </div>
            <button
              onClick={handleCreateTable}
              className="flex items-center space-x-2 bg-poker-green-600 hover:bg-poker-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create Table</span>
            </button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{tables.filter(t => t.status === 'waiting').length}</div>
                  <div className="text-sm text-gray-400">Waiting</div>
                </div>
                <Clock className="w-6 h-6 text-green-400" />
              </div>
            </div>
            
            <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{tables.filter(t => t.status === 'playing').length}</div>
                  <div className="text-sm text-gray-400">Active</div>
                </div>
                <Play className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-poker-gold-400">
                    {tables.reduce((sum, table) => sum + table.players, 0)}
                  </div>
                  <div className="text-sm text-gray-400">Players Online</div>
                </div>
                <Users className="w-6 h-6 text-poker-gold-400" />
              </div>
            </div>
            
            <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{tables.length}</div>
                  <div className="text-sm text-gray-400">Total Tables</div>
                </div>
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700 mb-6">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Search */}
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-poker-green-500"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filter.type}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value as any })}
                  className="bg-poker-dark-900 border border-gray-600 rounded px-3 py-1 text-sm"
                  aria-label="Table type filter"
                >
                  <option value="all">All Types</option>
                  <option value="cash">Cash Games</option>
                  <option value="tournament">Tournaments</option>
                  <option value="sit-n-go">Sit & Go</option>
                </select>
              </div>

              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value as any })}
                className="bg-poker-dark-900 border border-gray-600 rounded px-3 py-1 text-sm"
                aria-label="Status filter"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="playing">Playing</option>
                <option value="starting">Starting</option>
              </select>

              <select
                value={filter.stakes}
                onChange={(e) => setFilter({ ...filter, stakes: e.target.value as any })}
                className="bg-poker-dark-900 border border-gray-600 rounded px-3 py-1 text-sm"
                aria-label="Stakes filter"
              >
                <option value="all">All Stakes</option>
                <option value="low">Low Stakes</option>
                <option value="medium">Medium Stakes</option>
                <option value="high">High Stakes</option>
              </select>

              <select
                value={filter.players}
                onChange={(e) => setFilter({ ...filter, players: e.target.value as any })}
                className="bg-poker-dark-900 border border-gray-600 rounded px-3 py-1 text-sm"
                aria-label="Players filter"
              >
                <option value="all">All Tables</option>
                <option value="empty">Empty</option>
                <option value="available">Available Seats</option>
                <option value="full">Full</option>
              </select>
            </div>

            {/* Refresh */}
            <button
              onClick={() => setLoading(true)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          <AnimatePresence>
            {sortedTables.map((table, index) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-poker-dark-800 rounded-lg border border-gray-700 overflow-hidden hover:border-poker-green-500 transition-colors"
              >
                {/* Table Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold">{table.name}</h3>
                    <div className="flex items-center space-x-2">
                      {table.isPrivate && <Shield className="w-4 h-4 text-blue-400" />}
                      {table.isHighStakes && <Crown className="w-4 h-4 text-yellow-400" />}
                      {table.isFastPaced && <Zap className="w-4 h-4 text-purple-400" />}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(table.status)}
                      <span className={`text-sm font-medium ${getStatusColor(table.status)}`}>
                        {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Users className="w-4 h-4" />
                      <span>{table.players}/{table.maxPlayers}</span>
                    </div>
                  </div>
                </div>

                {/* Table Info */}
                <div className="p-4 space-y-3">
                  {/* Stakes */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Stakes:</span>
                    <span className={`text-sm font-medium ${getStakesColor(getStakesLevel(table.bigBlind))}`}>
                      {formatChips(table.smallBlind)}/{formatChips(table.bigBlind)}
                    </span>
                  </div>

                  {/* Buy-in Range */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Buy-in:</span>
                    <span className="text-sm text-gray-300">
                      {formatChips(table.minBuyIn)} - {formatChips(table.maxBuyIn)}
                    </span>
                  </div>

                  {/* Current Pot */}
                  {table.pot > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Pot:</span>
                      <span className="text-sm font-medium text-poker-gold-400">
                        {formatChips(table.pot)}
                      </span>
                    </div>
                  )}

                  {/* Game Stage */}
                  {table.gameStage && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-400">Stage:</span>
                      <span className="text-sm text-gray-300 capitalize">{table.gameStage}</span>
                    </div>
                  )}

                  {/* Players Preview */}
                  <div className="pt-2 border-t border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Players:</span>
                      <span className="text-xs text-gray-500">{table.playersList.length} online</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {table.playersList.slice(0, 6).map((player) => (
                        <div
                          key={player.id}
                          className="flex items-center space-x-1 bg-poker-dark-900 px-2 py-1 rounded text-xs"
                          title={`${player.username} - ${formatChips(player.chips)}`}
                        >
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-gray-300">{player.username}</span>
                          {player.isDealer && <span className="text-poker-gold-400">D</span>}
                        </div>
                      ))}
                      {table.playersList.length > 6 && (
                        <div className="text-xs text-gray-500 px-2 py-1">
                          +{table.playersList.length - 6} more
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Table Actions */}
                <div className="p-4 border-t border-gray-700 bg-poker-dark-900">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <Clock className="w-4 h-4" />
                      <span>{table.timeBank}s bank</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => navigate(`/table/${table.id}`)}
                        className="flex items-center space-x-1 bg-poker-green-600 hover:bg-poker-green-700 px-3 py-1 rounded text-sm transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        <span>Watch</span>
                      </button>
                      
                      {table.players < table.maxPlayers && table.status !== 'finished' && (
                        <button
                          onClick={() => handleJoinTable(table.id)}
                          className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm transition-colors"
                        >
                          <Play className="w-3 h-3" />
                          <span>Join</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {sortedTables.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-poker-dark-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Target className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-300 mb-2">No tables found</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or create a new table</p>
            <button
              onClick={handleCreateTable}
              className="bg-poker-green-600 hover:bg-poker-green-700 px-4 py-2 rounded-lg transition-colors"
            >
              Create Table
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TablesPage; 