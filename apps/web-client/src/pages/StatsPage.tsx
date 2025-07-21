import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Crown,
  Swords,
  Gamepad2,
  CircleDollarSign,
  Sparkles,
  Flame,
  Dices,
  Crosshair,
  Target,
  Skull,
  Star,
} from 'lucide-react';
import { RootState } from '../store';
import { formatChips } from '../utils/formatting';
import { AnimatePresence } from 'framer-motion';

interface GameStats {
  totalGames: number;
  gamesWon: number;
  gamesLost: number;
  totalWinnings: number;
  totalLosses: number;
  biggestPot: number;
  averagePot: number;
  handsPlayed: number;
  handsWon: number;
  winRate: number;
  totalPlayTime: number;
  bestHand: string;
  currentStreak: number;
  longestStreak: number;
}

interface HandHistory {
  id: string;
  date: string;
  tableId: string;
  handNumber: number;
  stage: string;
  pot: number;
  action: string;
  amount: number;
  result: 'win' | 'loss' | 'fold';
  holeCards: string[];
  communityCards: string[];
  players: number;
}

interface PerformanceMetrics {
  vpip: number; // Voluntarily Put Money In Pot
  pfr: number; // Pre-Flop Raise
  af: number; // Aggression Factor
  wtsd: number; // Went to Showdown
  wsd: number; // Won at Showdown
  bbPer100: number; // Big Blinds per 100 hands
}

const StatsPage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [activeTab, setActiveTab] = useState<'overview' | 'hands' | 'performance' | 'achievements'>('overview');
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month' | 'year'>('all');
  const [loading, setLoading] = useState(false);

  // Mock data for demonstration
  const [gameStats] = useState<GameStats>({
    totalGames: 156,
    gamesWon: 89,
    gamesLost: 67,
    totalWinnings: 15420,
    totalLosses: 8920,
    biggestPot: 1250,
    averagePot: 320,
    handsPlayed: 1247,
    handsWon: 412,
    winRate: 33.1,
    totalPlayTime: 2840, // minutes
    bestHand: 'Royal Flush',
    currentStreak: 3,
    longestStreak: 8
  });

  const [performanceMetrics] = useState<PerformanceMetrics>({
    vpip: 24.5,
    pfr: 18.2,
    af: 2.8,
    wtsd: 28.3,
    wsd: 65.2,
    bbPer100: 12.4
  });

  const [handHistory] = useState<HandHistory[]>([
    {
      id: '1',
      date: '2024-01-15T14:30:00Z',
      tableId: 'table-1',
      handNumber: 42,
      stage: 'river',
      pot: 450,
      action: 'raise',
      amount: 150,
      result: 'win',
      holeCards: ['AS', 'KH'],
      communityCards: ['QD', 'JC', '2H', '9S', '4C'],
      players: 5
    },
    {
      id: '2',
      date: '2024-01-15T14:25:00Z',
      tableId: 'table-1',
      handNumber: 41,
      stage: 'flop',
      pot: 120,
      action: 'fold',
      amount: 0,
      result: 'fold',
      holeCards: ['7D', '3H'],
      communityCards: ['AS', 'KH', 'QD'],
      players: 4
    },
    {
      id: '3',
      date: '2024-01-15T14:20:00Z',
      tableId: 'table-1',
      handNumber: 40,
      stage: 'showdown',
      pot: 320,
      action: 'call',
      amount: 80,
      result: 'loss',
      holeCards: ['9C', '6S'],
      communityCards: ['AS', 'KH', 'QD', 'JC', '2H'],
      players: 3
    }
  ]);

  const achievements = [
    { id: '1', name: 'First Win', description: 'Win your first hand', icon: Trophy, earned: true, date: '2024-01-10' },
    { id: '2', name: 'Big Pot', description: 'Win a pot worth 1000+ chips', icon: CircleDollarSign, earned: true, date: '2024-01-12' },
    { id: '3', name: 'Streak Master', description: 'Win 5 hands in a row', icon: Sparkles, earned: true, date: '2024-01-14' },
    { id: '4', name: 'Royal Flush', description: 'Get a royal flush', icon: Star, earned: false },
    { id: '5', name: 'Iron Man', description: 'Play 1000 hands', icon: Crown, earned: false },
    { id: '6', name: 'Comeback King', description: 'Win after being down 500+ chips', icon: Flame, earned: false }
  ];

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case 'win': return 'text-green-400';
      case 'loss': return 'text-red-400';
      case 'fold': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case 'win': return <Target className="w-4 h-4" />;
      case 'loss': return <Skull className="w-4 h-4" />;
      case 'fold': return <Crosshair className="w-4 h-4" />;
      default: return <Crosshair className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Player Statistics</h1>
          <p className="text-gray-400">Track your poker performance and achievements</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-poker-dark-800 rounded-lg p-1 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: Gamepad2 },
            { id: 'hands', label: 'Hand History', icon: Dices },
            { id: 'performance', label: 'Performance', icon: Target },
            { id: 'achievements', label: 'Achievements', icon: Trophy }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`
                flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
                ${activeTab === tab.id 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Time Filter */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Crosshair className="w-4 h-4 text-gray-400" />
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="bg-poker-dark-700 text-sm rounded-lg p-1 outline-none"
              aria-label="Time filter"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setLoading(true)}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <Crosshair className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors">
              <Dices className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Content based on active tab */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">Win Rate</div>
                    <Target className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400">{gameStats.winRate}%</div>
                  <div className="text-sm text-gray-400 mt-2">
                    {gameStats.handsWon} of {gameStats.handsPlayed} hands
                  </div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">Total Winnings</div>
                    <CircleDollarSign className="w-5 h-5 text-poker-gold-400" />
                  </div>
                  <div className="text-3xl font-bold text-poker-gold-400">
                    {formatChips(gameStats.totalWinnings)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Net: {formatChips(gameStats.totalWinnings - gameStats.totalLosses)}
                  </div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">Biggest Pot</div>
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">
                    {formatChips(gameStats.biggestPot)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Average: {formatChips(gameStats.averagePot)}
                  </div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">Play Time</div>
                    <Dices className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400">
                    {formatTime(gameStats.totalPlayTime)}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {gameStats.totalGames} games played
                  </div>
                </div>
              </div>

              {/* Performance Chart */}
              <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Performance Over Time</h3>
                <div className="h-64 bg-poker-dark-900 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <Dices className="w-12 h-12 mx-auto mb-2" />
                    <p>Performance chart will be displayed here</p>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {handHistory.slice(0, 5).map((hand) => (
                    <div key={hand.id} className="flex items-center justify-between p-3 bg-poker-dark-900 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded ${getResultColor(hand.result)}`}>
                          {getResultIcon(hand.result)}
                        </div>
                        <div>
                          <div className="font-semibold">Hand #{hand.handNumber}</div>
                          <div className="text-sm text-gray-400">{formatDate(hand.date)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatChips(hand.pot)}</div>
                        <div className="text-sm text-gray-400 capitalize">{hand.result}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'hands' && (
            <motion.div
              key="hands"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="bg-poker-dark-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-700">
                  <h3 className="text-xl font-semibold">Hand History</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-poker-dark-900">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Hand
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Stage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Pot
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {handHistory.map((hand) => (
                        <tr key={hand.id} className="hover:bg-poker-dark-900">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium">#{hand.handNumber}</div>
                            <div className="text-sm text-gray-400">Table {hand.tableId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {formatDate(hand.date)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-poker-dark-900 text-gray-300">
                              {hand.stage}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium capitalize">{hand.action}</div>
                            {hand.amount > 0 && (
                              <div className="text-sm text-gray-400">{formatChips(hand.amount)}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {formatChips(hand.pot)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getResultColor(hand.result)}`}>
                              {getResultIcon(hand.result)}
                              <span className="ml-1 capitalize">{hand.result}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'performance' && (
            <motion.div
              key="performance"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Performance Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">VPIP</div>
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-bold text-blue-400">{performanceMetrics.vpip}%</div>
                  <div className="text-sm text-gray-400 mt-2">Voluntarily Put Money In Pot</div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">PFR</div>
                    <Dices className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-400">{performanceMetrics.pfr}%</div>
                  <div className="text-sm text-gray-400 mt-2">Pre-Flop Raise</div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">AF</div>
                    <Swords className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400">{performanceMetrics.af}</div>
                  <div className="text-sm text-gray-400 mt-2">Aggression Factor</div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">WTSD</div>
                    <Crosshair className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-purple-400">{performanceMetrics.wtsd}%</div>
                  <div className="text-sm text-gray-400 mt-2">Went to Showdown</div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">WSD</div>
                    <Trophy className="w-5 h-5 text-poker-gold-400" />
                  </div>
                  <div className="text-3xl font-bold text-poker-gold-400">{performanceMetrics.wsd}%</div>
                  <div className="text-sm text-gray-400 mt-2">Won at Showdown</div>
                </div>

                <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-gray-400">BB/100</div>
                    <CircleDollarSign className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold text-green-400">{performanceMetrics.bbPer100}</div>
                  <div className="text-sm text-gray-400 mt-2">Big Blinds per 100 hands</div>
                </div>
              </div>

              {/* Performance Analysis */}
              <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Performance Analysis</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-poker-dark-900 rounded-lg">
                    <div>
                      <div className="font-semibold">Playing Style</div>
                      <div className="text-sm text-gray-400">Tight-Aggressive</div>
                    </div>
                    <div className="text-green-400 font-semibold">Good</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-poker-dark-900 rounded-lg">
                    <div>
                      <div className="font-semibold">Position Play</div>
                      <div className="text-sm text-gray-400">Strong in late position</div>
                    </div>
                    <div className="text-green-400 font-semibold">Excellent</div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-poker-dark-900 rounded-lg">
                    <div>
                      <div className="font-semibold">Bankroll Management</div>
                      <div className="text-sm text-gray-400">Consistent bet sizing</div>
                    </div>
                    <div className="text-yellow-400 font-semibold">Average</div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`bg-poker-dark-800 rounded-lg p-6 border border-gray-700 ${
                      achievement.earned ? 'ring-2 ring-poker-gold-400' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-lg ${
                        achievement.earned 
                          ? 'bg-poker-gold-400/20 text-poker-gold-400' 
                          : 'bg-gray-600/20 text-gray-400'
                      }`}>
                        <achievement.icon className="w-6 h-6" />
                      </div>
                      {achievement.earned && (
                        <div className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          Earned
                        </div>
                      )}
                    </div>
                    
                    <h3 className="text-lg font-semibold mb-2">{achievement.name}</h3>
                    <p className="text-gray-400 text-sm mb-3">{achievement.description}</p>
                    
                    {achievement.earned && (
                      <div className="text-xs text-gray-500">
                        Earned on {achievement.date}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Achievement Progress */}
              <div className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-xl font-semibold mb-4">Achievement Progress</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Total Achievements</span>
                      <span>3/6 (50%)</span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div className="bg-poker-gold-400 h-2 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-poker-dark-900 rounded-lg">
                      <div className="text-2xl font-bold text-green-400">3</div>
                      <div className="text-gray-400">Earned</div>
                    </div>
                    <div className="text-center p-3 bg-poker-dark-900 rounded-lg">
                      <div className="text-2xl font-bold text-gray-400">3</div>
                      <div className="text-gray-400">Remaining</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StatsPage; 