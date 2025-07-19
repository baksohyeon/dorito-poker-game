import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { motion } from 'framer-motion';
import { 
  Menu, 
  X, 
  User, 
  Settings, 
  LogOut, 
  Coins, 
  Trophy,
  Home,
  Users,
  BarChart3,
  Wifi,
  WifiOff
} from 'lucide-react';
import { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { openModal } from '../../store/slices/uiSlice';
import { formatChips } from '../../utils/formatting';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const { connectionStatus } = useSelector((state: RootState) => state.ui);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
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
            <span className="text-xl font-bold text-white">PokerDoritos</span>
          </Link>

          {/* Desktop Navigation */}
          {isAuthenticated && (
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
                <span>Stats</span>
              </Link>
            </nav>
          )}

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {getConnectionStatusIcon()}
              <span className="text-xs text-gray-400 hidden sm:block">
                {connectionStatus}
              </span>
            </div>

            {isAuthenticated && user ? (
              <>
                {/* Chips Display */}
                <div className="hidden sm:flex items-center space-x-2 bg-poker-dark-700 px-3 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-poker-gold-400" />
                  <span className="text-white font-mono">
                    {formatChips(user.chips)}
                  </span>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-poker-dark-700 hover:bg-poker-dark-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{user.username}</span>
                  </button>

                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-2 w-48 bg-poker-dark-800 border border-gray-700 rounded-lg shadow-xl py-2"
                    >
                      <Link
                        to="/profile"
                        className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Profile</span>
                      </Link>
                      
                      <button
                        onClick={() => {
                          dispatch(openModal({ type: 'settings' }));
                          setUserMenuOpen(false);
                        }}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings</span>
                      </button>
                      
                      <hr className="my-2 border-gray-700" />
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-400 hover:bg-poker-dark-700"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </>
            ) : (
              /* Auth Buttons */
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="poker-button poker-button-primary"
                >
                  Sign Up
                </Link>
              </div>
            )}

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
        {mobileMenuOpen && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden py-4 border-t border-gray-700"
          >
            <nav className="space-y-2">
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
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 