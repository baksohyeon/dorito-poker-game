import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Medal, 
  Crown, 
  TrendingUp, 
  Users, 
  Star, 
  Zap, 
  Target,
  Calendar,
  Filter,
  Search,
  RefreshCw,
  Award,
  Flame,
  DollarSign,
  Clock,
  BarChart3,
  ChevronUp,
  ChevronDown,
  Eye,
  UserCheck
} from 'lucide-react';
import { RootState } from '../store';
import { formatChips } from '../utils/formatting';

interface LeaderboardPlayer {
  id: string;
  username: string;
  rank: number;
  avatar?: string;
  totalWinnings: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  biggestPot: number;
  totalPlayTime: number;
  currentStreak: number;
  longestStreak: number;
  level: number;
  experience: number;
  achievements: number;
  isOnline: boolean;
  lastSeen?: string;
  country?: string;
  joinDate: string;
}

interface TournamentResult {
  id: string;
  name: string;
  date: string;
  position: number;
  totalPlayers: number;
  prize: number;
  buyIn: number;
  type: 'sit-n-go' | 'tournament' | 'cash-game';
}

interface LeaderboardCategory {
  id: string;
  name: string;
  description: string;
  icon: any;
  sortBy: keyof LeaderboardPlayer;
  sortOrder: 'asc' | 'desc';
}

const LeaderboardPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeCategory, setActiveCategory] = useState('winnings');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMyRank, setShowMyRank] = useState(false);

  // Mock leaderboard data
  const [leaderboardData] = useState<LeaderboardPlayer[]>([
    {
      id: '1',
      username: 'PokerKing',
      rank: 1,
      totalWinnings: 125000,
      gamesPlayed: 1247,
      gamesWon: 623,
      winRate: 50.0,
      biggestPot: 8500,
      totalPlayTime: 4560,
      currentStreak: 12,
      longestStreak: 25,
      level: 42,
      experience: 1250000,
      achievements: 28,
      isOnline: true,
      country: 'US',
      joinDate: '2023-01-15'
    },
    {
      id: '2',
      username: 'AceQueen',
      rank: 2,
      totalWinnings: 98750,
      gamesPlayed: 892,
      gamesWon: 456,
      winRate: 51.1,
      biggestPot: 7200,
      totalPlayTime: 3240,
      currentStreak: 8,
      longestStreak: 18,
      level: 38,
      experience: 987500,
      achievements: 24,
      isOnline: true,
      country: 'CA',
      joinDate: '2023-03-20'
    },
    {
      id: '3',
      username: 'RoyalFlush',
      rank: 3,
      totalWinnings: 75600,
      gamesPlayed: 1103,
      gamesWon: 512,
      winRate: 46.4,
      biggestPot: 6800,
      totalPlayTime: 3980,
      currentStreak: 5,
      longestStreak: 22,
      level: 35,
      experience: 756000,
      achievements: 21,
      isOnline: false,
      lastSeen: '2024-01-15T10:30:00Z',
      country: 'UK',
      joinDate: '2023-02-10'
    },
    {
      id: '4',
      username: 'BluffMaster',
      rank: 4,
      totalWinnings: 62300,
      gamesPlayed: 756,
      gamesWon: 389,
      winRate: 51.5,
      biggestPot: 5400,
      totalPlayTime: 2870,
      currentStreak: 3,
      longestStreak: 15,
      level: 32,
      experience: 623000,
      achievements: 19,
      isOnline: true,
      country: 'AU',
      joinDate: '2023-04-05'
    },
    {
      id: '5',
      username: 'ChipCollector',
      rank: 5,
      totalWinnings: 54100,
      gamesPlayed: 1342,
      gamesWon: 623,
      winRate: 46.4,
      biggestPot: 4800,
      totalPlayTime: 5120,
      currentStreak: 1,
      longestStreak: 12,
      level: 29,
      experience: 541000,
      achievements: 17,
      isOnline: false,
      lastSeen: '2024-01-14T18:45:00Z',
      country: 'DE',
      joinDate: '2023-01-25'
    },
    {
      id: '6',
      username: 'LuckySeven',
      rank: 6,
      totalWinnings: 48700,
      gamesPlayed: 623,
      gamesWon: 345,
      winRate: 55.4,
      biggestPot: 4200,
      totalPlayTime: 2340,
      currentStreak: 7,
      longestStreak: 11,
      level: 26,
      experience: 487000,
      achievements: 15,
      isOnline: true,
      country: 'FR',
      joinDate: '2023-05-12'
    },
    {
      id: '7',
      username: 'HighStakes',
      rank: 7,
      totalWinnings: 42300,
      gamesPlayed: 445,
      gamesWon: 267,
      winRate: 60.0,
      biggestPot: 3800,
      totalPlayTime: 1890,
      currentStreak: 4,
      longestStreak: 9,
      level: 23,
      experience: 423000,
      achievements: 13,
      isOnline: true,
      country: 'IT',
      joinDate: '2023-06-18'
    },
    {
      id: '8',
      username: 'RiverRanger',
      rank: 8,
      totalWinnings: 38900,
      gamesPlayed: 892,
      gamesWon: 412,
      winRate: 46.2,
      biggestPot: 3600,
      totalPlayTime: 3450,
      currentStreak: 2,
      longestStreak: 8,
      level: 20,
      experience: 389000,
      achievements: 11,
      isOnline: false,
      lastSeen: '2024-01-15T12:15:00Z',
      country: 'ES',
      joinDate: '2023-03-08'
    },
    {
      id: '9',
      username: 'TurnTitan',
      rank: 9,
      totalWinnings: 35600,
      gamesPlayed: 678,
      gamesWon: 312,
      winRate: 46.0,
      biggestPot: 3200,
      totalPlayTime: 2670,
      currentStreak: 1,
      longestStreak: 7,
      level: 18,
      experience: 356000,
      achievements: 9,
      isOnline: true,
      country: 'NL',
      joinDate: '2023-07-22'
    },
    {
      id: '10',
      username: 'FlopMaster',
      rank: 10,
      totalWinnings: 32400,
      gamesPlayed: 567,
      gamesWon: 289,
      winRate: 51.0,
      biggestPot: 2900,
      totalPlayTime: 2230,
      currentStreak: 3,
      longestStreak: 6,
      level: 16,
      experience: 324000,
      achievements: 8,
      isOnline: true,
      country: 'SE',
      joinDate: '2023-08-14'
    }
  ]);

  const [tournamentResults] = useState<TournamentResult[]>([
    {
      id: '1',
      name: 'Weekly Championship',
      date: '2024-01-14',
      position: 1,
      totalPlayers: 128,
      prize: 5000,
      buyIn: 100,
      type: 'tournament'
    },
    {
      id: '2',
      name: 'High Stakes Sit & Go',
      date: '2024-01-12',
      position: 3,
      totalPlayers: 9,
      prize: 800,
      buyIn: 200,
      type: 'sit-n-go'
    },
    {
      id: '3',
      name: 'Daily Freeroll',
      date: '2024-01-10',
      position: 2,
      totalPlayers: 256,
      prize: 200,
      buyIn: 0,
      type: 'tournament'
    }
  ]);

  const categories: LeaderboardCategory[] = [
    {
      id: 'winnings',
      name: 'Total Winnings',
      description: 'Players ranked by total chips won',
      icon: DollarSign,
      sortBy: 'totalWinnings',
      sortOrder: 'desc'
    },
    {
      id: 'winrate',
      name: 'Win Rate',
      description: 'Players ranked by win percentage',
      icon: Target,
      sortBy: 'winRate',
      sortOrder: 'desc'
    },
    {
      id: 'games',
      name: 'Games Played',
      description: 'Most active players',
      icon: Users,
      sortBy: 'gamesPlayed',
      sortOrder: 'desc'
    },
    {
      id: 'streak',
      name: 'Current Streak',
      description: 'Players with longest winning streaks',
      icon: Flame,
      sortBy: 'currentStreak',
      sortOrder: 'desc'
    },
    {
      id: 'level',
      name: 'Player Level',
      description: 'Highest level players',
      icon: Star,
      sortBy: 'level',
      sortOrder: 'desc'
    }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes % 60}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Trophy className="w-5 h-5 text-poker-gold-400" />;
      default: return <span className="text-lg font-bold text-gray-400">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
      case 3: return 'bg-gradient-to-r from-poker-gold-400 to-poker-gold-600 text-black';
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 10:
        return 'bg-gradient-to-r from-blue-500 to-blue-700 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  const filteredData = leaderboardData.filter(player =>
    player.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentCategory = categories.find(cat => cat.id === activeCategory);

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
              <p className="text-gray-400">Top players and competitive rankings</p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowMyRank(!showMyRank)}
                className={`
                  flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors
                  ${showMyRank 
                    ? 'bg-poker-green-600 text-white' 
                    : 'bg-poker-dark-800 text-gray-300 hover:text-white'
                  }
                `}
              >
                <UserCheck className="w-4 h-4" />
                <span>My Rank</span>
              </button>
            </div>
          </div>

          {/* Top 3 Podium */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {leaderboardData.slice(0, 3).map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative p-6 rounded-lg border-2 text-center
                  ${index === 0 ? 'bg-gradient-to-b from-yellow-400/20 to-yellow-600/20 border-yellow-400' :
                    index === 1 ? 'bg-gradient-to-b from-gray-300/20 to-gray-500/20 border-gray-300' :
                    'bg-gradient-to-b from-poker-gold-400/20 to-poker-gold-600/20 border-poker-gold-400'}
                `}
              >
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${getRankBadgeColor(player.rank)}
                  `}>
                    {index + 1}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="w-16 h-16 bg-poker-dark-800 rounded-full mx-auto mb-2 flex items-center justify-center">
                    <span className="text-xl font-bold">{player.username.charAt(0).toUpperCase()}</span>
                  </div>
                  <h3 className="text-lg font-semibold">{player.username}</h3>
                  <div className="text-sm text-gray-400">{player.country}</div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-poker-gold-400">
                    {formatChips(player.totalWinnings)}
                  </div>
                  <div className="text-sm text-gray-400">
                    {player.winRate}% win rate • {player.gamesPlayed} games
                  </div>
                  {player.isOnline && (
                    <div className="flex items-center justify-center space-x-1 text-green-400 text-sm">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span>Online</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex space-x-1 bg-poker-dark-800 rounded-lg p-1 mb-6">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
                ${activeCategory === category.id 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="bg-poker-dark-800 border border-gray-600 rounded px-3 py-1 text-sm"
                aria-label="Time filter"
              >
                <option value="all">All Time</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-poker-dark-800 border border-gray-600 rounded-lg text-sm focus:outline-none focus:border-poker-green-500"
              />
            </div>
            
            <button
              onClick={() => setLoading(true)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-poker-dark-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-xl font-semibold">{currentCategory?.name} Leaderboard</h3>
            <p className="text-gray-400 text-sm">{currentCategory?.description}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-poker-dark-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    {currentCategory?.name}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <AnimatePresence>
                  {filteredData.map((player, index) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-poker-dark-900"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getRankIcon(player.rank)}
                          <span className={`px-2 py-1 text-xs font-bold rounded-full ${getRankBadgeColor(player.rank)}`}>
                            {player.rank}
                          </span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-poker-dark-900 rounded-full flex items-center justify-center">
                            <span className="text-sm font-bold">{player.username.charAt(0).toUpperCase()}</span>
                          </div>
                          <div>
                            <div className="text-sm font-medium">{player.username}</div>
                            <div className="text-xs text-gray-400">{player.country}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {activeCategory === 'winnings' && formatChips(player.totalWinnings)}
                          {activeCategory === 'winrate' && `${player.winRate}%`}
                          {activeCategory === 'games' && player.gamesPlayed}
                          {activeCategory === 'streak' && player.currentStreak}
                          {activeCategory === 'level' && player.level}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {player.gamesPlayed}
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">{player.winRate}%</span>
                          <div className="w-16 bg-gray-600 rounded-full h-2">
                            <div 
                              className="bg-green-400 h-2 rounded-full" 
                              style={{ width: `${player.winRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">{player.level}</span>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        {player.isOnline ? (
                          <div className="flex items-center space-x-2 text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span className="text-sm">Online</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-gray-400">
                            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                            <span className="text-sm">
                              {player.lastSeen ? formatDate(player.lastSeen) : 'Offline'}
                            </span>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>

        {/* Tournament Results */}
        <div className="mt-8 bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold mb-4">Recent Tournament Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tournamentResults.map((result) => (
              <div key={result.id} className="bg-poker-dark-900 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">{result.name}</h4>
                  <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                    result.position === 1 ? 'bg-yellow-400 text-black' :
                    result.position === 2 ? 'bg-gray-300 text-black' :
                    result.position === 3 ? 'bg-poker-gold-400 text-black' :
                    'bg-blue-500 text-white'
                  }`}>
                    {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : result.position === 3 ? '🥉' : `#${result.position}`}
                  </span>
                </div>
                <div className="text-sm text-gray-400 space-y-1">
                  <div>{formatDate(result.date)}</div>
                  <div>{result.totalPlayers} players</div>
                  <div className="text-poker-gold-400 font-semibold">
                    Prize: {formatChips(result.prize)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage; 