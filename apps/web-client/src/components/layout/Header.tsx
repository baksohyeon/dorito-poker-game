
// apps/web-client/src/components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppSelector } from '../../hooks/redux';
import { Coins, Trophy } from 'lucide-react';
import { UserMenu } from './UserMenu';

export const Header: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);

  return (
    <header className="bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/lobby" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-poker-gold to-yellow-600 rounded-lg flex items-center justify-center">
              <span className="text-gray-900 font-bold text-lg">♠</span>
            </div>
            <span className="text-xl font-bold text-white">PokerMaster</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/lobby"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Lobby
            </Link>
            <Link
              to="/leaderboard"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-1"
            >
              <Trophy size={16} />
              <span>Leaderboard</span>
            </Link>
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-4">
            {/* Chips Display */}
            <div className="flex items-center space-x-2 bg-gray-800 px-3 py-1 rounded-lg">
              <Coins className="text-poker-gold" size={16} />
              <span className="text-white font-medium">
                {user?.chips?.toLocaleString() || '0'}
              </span>
            </div>

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </div>
    </header>
  );
};
