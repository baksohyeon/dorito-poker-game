
// apps/web-client/src/components/lobby/PlayerStats.tsx
import React from 'react';
import { useAppSelector } from '../../hooks/redux';
import { Card } from '../ui/Card';
import { 
  Trophy,
  Target,
  TrendingUp,
  Award,
  Coins
} from 'lucide-react';

export const PlayerStats: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  const stats = [
    {
      label: 'Games Played',
      value: user?.gamesPlayed || 0,
      icon: Target,
      color: 'text-blue-400'
    },
 {
      label: 'Win Rate',
      value: user?.gamesPlayed ? 
        `${Math.round((user.gamesWon / user.gamesPlayed) * 100)}%` : '0%',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      label: 'Net Profit',
      value: `${(user?.totalWinnings || 0) - (user?.totalLosses || 0)}`,
      icon: Coins,
      color: 'text-poker-gold'
    },
    {
      label: 'Rank',
      value: user?.rank || 'Beginner',
      icon: Award,
      color: 'text-purple-400'
    }
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center space-x-3 mb-6">
        <Trophy className="text-poker-gold" size={24} />
        <h2 className="text-xl font-semibold text-white">Your Stats</h2>
      </div>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <stat.icon size={18} className={stat.color} />
              <span className="text-gray-300 text-sm">{stat.label}</span>
            </div>
            <span className="text-white font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300 text-sm">Level Progress</span>
          <span className="text-white text-sm font-medium">
            Level {user?.level || 1}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-poker-gold to-yellow-600 h-2 rounded-full transition-all duration-300"
            style={{ 
              width: `${((user?.experience || 0) % 1000) / 10}%` 
            }}
          />
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {(user?.experience || 0) % 1000}/1000 XP to next level
        </div>
      </div>
    </Card>
  );
};