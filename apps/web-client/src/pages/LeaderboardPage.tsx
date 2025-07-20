import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, TrendingUp, Users } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface LeaderboardPlayer {
  id: string;
  username: string;
  rank: number;
  chips: number;
  level: number;
  gamesPlayed: number;
  gamesWon: number;
  winRate: number;
  totalWinnings: number;
}

export const LeaderboardPage: React.FC = () => {
  const [players, setPlayers] = useState<LeaderboardPlayer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'chips' | 'wins' | 'winRate'>('chips');

  useEffect(() => {
    fetchLeaderboard();
  }, [filter]);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockPlayers: LeaderboardPlayer[] = [
        {
          id: '1',
          username: 'PokerKing',
          rank: 1,
          chips: 50000,
          level: 25,
          gamesPlayed: 500,
          gamesWon: 180,
          winRate: 36,
          totalWinnings: 150000
        },
        {
          id: '2',
          username: 'AceHigh',
          rank: 2,
          chips: 45000,
          level: 23,
          gamesPlayed: 420,
          gamesWon: 155,
          winRate: 37,
          totalWinnings: 135000
        },
        {
          id: '3',
          username: 'RoyalFlush',
          rank: 3,
          chips: 40000,
          level: 22,
          gamesPlayed: 380,
          gamesWon: 140,
          winRate: 37,
          totalWinnings: 120000
        },
        {
          id: '4',
          username: 'BluffMaster',
          rank: 4,
          chips: 35000,
          level: 20,
          gamesPlayed: 350,
          gamesWon: 125,
          winRate: 36,
          totalWinnings: 110000
        },
        {
          id: '5',
          username: 'CardShark',
          rank: 5,
          chips: 30000,
          level: 19,
          gamesPlayed: 320,
          gamesWon: 115,
          winRate: 36,
          totalWinnings: 100000
        }
      ];

      // Sort based on filter
      const sortedPlayers = [...mockPlayers].sort((a, b) => {
        switch (filter) {
          case 'chips':
            return b.chips - a.chips;
          case 'wins':
            return b.gamesWon - a.gamesWon;
          case 'winRate':
            return b.winRate - a.winRate;
          default:
            return b.chips - a.chips;
        }
      });

      // Update ranks
      sortedPlayers.forEach((player, index) => {
        player.rank = index + 1;
      });

      setPlayers(sortedPlayers);
    } catch (error) {
      toast.error('Failed to load leaderboard');
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getFilterValue = (player: LeaderboardPlayer) => {
    switch (filter) {
      case 'chips':
        return player.chips.toLocaleString();
      case 'wins':
        return player.gamesWon.toString();
      case 'winRate':
        return `${player.winRate}%`;
      default:
        return player.chips.toLocaleString();
    }
  };

  const getFilterLabel = () => {
    switch (filter) {
      case 'chips':
        return 'Chips';
      case 'wins':
        return 'Wins';
      case 'winRate':
        return 'Win Rate';
      default:
        return 'Chips';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Trophy className="h-12 w-12 text-yellow-500" />
            <h1 className="text-4xl font-bold text-white">Leaderboard</h1>
          </div>
          <p className="text-green-100 text-lg">Top players this season</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Users className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{players.length}</p>
            <p className="text-green-100">Active Players</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Math.max(...players.map(p => p.chips)).toLocaleString()}
            </p>
            <p className="text-green-100">Highest Chips</p>
          </div>
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 text-center">
            <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">
              {Math.max(...players.map(p => p.winRate))}%
            </p>
            <p className="text-green-100">Best Win Rate</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-4 mb-6">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('chips')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'chips'
                  ? 'bg-poker-green text-white'
                  : 'text-green-100 hover:text-white'
              }`}
            >
              By Chips
            </button>
            <button
              onClick={() => setFilter('wins')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'wins'
                  ? 'bg-poker-green text-white'
                  : 'text-green-100 hover:text-white'
              }`}
            >
              By Wins
            </button>
            <button
              onClick={() => setFilter('winRate')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === 'winRate'
                  ? 'bg-poker-green text-white'
                  : 'text-green-100 hover:text-white'
              }`}
            >
              By Win Rate
            </button>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-poker-green to-green-600 p-4">
            <h2 className="text-xl font-semibold text-white">Top Players by {getFilterLabel()}</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {getFilterLabel()}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Winnings
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {players.map((player) => (
                  <tr key={player.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-poker-green to-green-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {player.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {player.username}
                          </div>
                          <div className="text-sm text-gray-500">
                            {player.chips.toLocaleString()} chips
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Level {player.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getFilterValue(player)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {player.gamesPlayed}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {player.winRate}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {player.totalWinnings.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 