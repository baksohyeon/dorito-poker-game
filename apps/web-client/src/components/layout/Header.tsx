import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  Settings, 
  Coins, 
  Trophy,
  Home,
  Users,
  BarChart3,
  Wifi,
  WifiOff,
  Crown,
  Star
} from 'lucide-react';
import { RootState } from '../../store';
import { openModal } from '../../store/slices/uiSlice';
import { formatChips } from '../../utils/formatting';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { connectionStatus } = useSelector((state: RootState) => state.ui);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getUserLevelBadge = () => {
    if (!user?.level) return null;
    
    const level = user.level;
    const badgeColor = level >= 50 ? 'text-purple-400' : 
                     level >= 25 ? 'text-blue-400' : 
                     level >= 10 ? 'text-green-400' : 'text-gray-400';
    
    return (
      <div className={`flex items-center space-x-1 ${badgeColor}`}>
        <Star className="w-3 h-3" />
        <span className="text-xs font-bold">{level}</span>
      </div>
    );
  };

  const getRankIcon = () => {
    if (!user?.rank) return null;
    
    const rankIcons: Record<string, JSX.Element> = {
      'bronze': <Crown className="w-4 h-4 text-amber-600" />,
      'silver': <Crown className="w-4 h-4 text-gray-400" />,
      'gold': <Crown className="w-4 h-4 text-yellow-400" />,
      'platinum': <Crown className="w-4 h-4 text-blue-400" />,
      'diamond': <Crown className="w-4 h-4 text-cyan-400" />,
      'master': <Crown className="w-4 h-4 text-purple-400" />
    };
    
    return rankIcons[user.rank.toLowerCase()] || null;
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Wifi className="w-4 h-4 text-green-400" />;
      case 'connecting':
        return <Wifi className="w-4 h-4 text-yellow-400 animate-pulse" />;
      case 'error':
        return <WifiOff className="w-4 h-4 text-red-400" />;
      case 'disconnected':
      default:
        return <WifiOff className="w-4 h-4 text-gray-400" />;
    }
  };

  const isActivePath = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-poker-dark-800 border-b border-gray-700 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-poker-green-400 to-poker-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold text-white">PokerDorito</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-6">
            <Link
              to="/lobby"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${isActivePath('/lobby') 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <Home className="w-4 h-4" />
              <span>Lobby</span>
            </Link>
            
            <Link
              to="/tables"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${isActivePath('/tables') 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <Users className="w-4 h-4" />
              <span>Tables</span>
            </Link>
            
            <Link
              to="/leaderboard"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${isActivePath('/leaderboard') 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </Link>
            
            <Link
              to="/statistics"
              className={`
                flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors
                ${isActivePath('/statistics') 
                  ? 'bg-poker-green-600 text-white' 
                  : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                }
              `}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Statistics</span>
            </Link>
          </nav>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon()}
              <span className="text-xs text-gray-400 hidden sm:block">
                {connectionStatus}
              </span>
            </div>

            {/* User Info Display */}
            {user && (
              <div className="hidden sm:flex items-center space-x-3">
                {/* Chips */}
                <div className="flex items-center space-x-2 bg-poker-dark-700 px-3 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-poker-gold-400" />
                  <span className="text-white font-mono">
                    {formatChips(user.chips)}
                  </span>
                </div>
                
                {/* Level and Rank */}
                <div className="flex items-center space-x-2 bg-poker-dark-700 px-3 py-2 rounded-lg">
                  {getRankIcon()}
                  {getUserLevelBadge()}
                  <span className="text-white text-sm">{user.username}</span>
                </div>
              </div>
            )}

            {/* Settings Button */}
            <button
              onClick={() => dispatch(openModal({ type: 'settings' }))}
              className="flex items-center space-x-2 bg-poker-dark-700 hover:bg-poker-dark-600 px-3 py-2 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:block">Settings</span>
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-gray-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-700"
          >
            {/* Mobile User Info */}
            {user && (
              <div className="px-3 py-3 mb-4 bg-poker-dark-900/50 rounded-lg mx-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-white">{user.username}</span>
                      {getRankIcon()}
                      {getUserLevelBadge()}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      <Coins className="w-3 h-3 inline mr-1" />
                      {formatChips(user.chips)}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getConnectionStatusIcon()}
                  </div>
                </div>
              </div>
            )}
            
            <nav className="space-y-2 px-3">
              <Link
                to="/lobby"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-4 h-4" />
                <span>Lobby</span>
              </Link>
              
              <Link
                to="/tables"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Users className="w-4 h-4" />
                <span>Tables</span>
              </Link>
              
              <Link
                to="/leaderboard"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>
              
              <Link
                to="/statistics"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <BarChart3 className="w-4 h-4" />
                <span>Statistics</span>
              </Link>
              
              <hr className="my-3 border-gray-700" />
              
              <button
                onClick={() => {
                  dispatch(openModal({ type: 'settings' }));
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 