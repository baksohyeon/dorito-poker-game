import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
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
  WifiOff,
  Clock,
  Shield,
  AlertCircle,
  ChevronDown,
  Crown,
  Star
} from 'lucide-react';
import { RootState } from '../../store';
import { logout, refreshAccessToken } from '../../store/slices/authSlice';
import { openModal } from '../../store/slices/uiSlice';
import { formatChips, formatTimeAgo } from '../../utils/formatting';

const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { isAuthenticated, user, token, error } = useSelector((state: RootState) => state.auth);
  const { connectionStatus } = useSelector((state: RootState) => state.ui);
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [tokenExpiryWarning, setTokenExpiryWarning] = useState(false);
  const [sessionInfo, setSessionInfo] = useState({
    timeRemaining: '',
    lastActivity: '',
    sessionHealth: 'good' as 'good' | 'warning' | 'critical'
  });
  
  const tokenCheckRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef<Date>(new Date());

  // Session monitoring
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const checkTokenExpiry = () => {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        const timeRemaining = expiryTime - currentTime;
        
        // Update session info
        setSessionInfo(prev => ({
          ...prev,
          timeRemaining: formatTimeAgo(new Date(currentTime + timeRemaining)),
          lastActivity: formatTimeAgo(lastActivityRef.current),
          sessionHealth: timeRemaining < 5 * 60 * 1000 ? 'critical' : 
                        timeRemaining < 15 * 60 * 1000 ? 'warning' : 'good'
        }));
        
        // Show warning if token expires in less than 5 minutes
        if (timeRemaining < 5 * 60 * 1000 && timeRemaining > 0) {
          setTokenExpiryWarning(true);
        } else {
          setTokenExpiryWarning(false);
        }
        
        // Auto-refresh if token expires in less than 2 minutes
        if (timeRemaining < 2 * 60 * 1000 && timeRemaining > 0) {
          dispatch(refreshAccessToken());
        }
      } catch (error) {
        console.error('Error checking token expiry:', error);
      }
    };

    // Check immediately and then every 30 seconds
    checkTokenExpiry();
    tokenCheckRef.current = setInterval(checkTokenExpiry, 30000);

    return () => {
      if (tokenCheckRef.current) {
        clearInterval(tokenCheckRef.current);
      }
    };
  }, [isAuthenticated, token, dispatch]);

  // Update last activity on user interaction
  useEffect(() => {
    const updateActivity = () => {
      lastActivityRef.current = new Date();
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keypress', updateActivity);
    window.addEventListener('scroll', updateActivity);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keypress', updateActivity);
      window.removeEventListener('scroll', updateActivity);
    };
  }, []);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
    setUserMenuOpen(false);
  };

  const handleRefreshToken = () => {
    dispatch(refreshAccessToken());
    setTokenExpiryWarning(false);
  };

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
    
    return rankIcons[user.rank.toLowerCase()] || <Shield className="w-4 h-4 text-gray-400" />;
  };

  const getSessionStatusIcon = () => {
    switch (sessionInfo.sessionHealth) {
      case 'critical':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case 'warning':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      default:
        return <Shield className="w-4 h-4 text-green-400" />;
    }
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
                {/* Session Status Warning */}
                {tokenExpiryWarning && (
                  <div className="hidden sm:flex items-center space-x-2 bg-red-900/50 border border-red-600 px-3 py-2 rounded-lg animate-pulse">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <span className="text-red-300 text-xs">
                      Session expiring soon
                    </span>
                    <button
                      onClick={handleRefreshToken}
                      className="text-red-200 hover:text-white text-xs underline"
                    >
                      Refresh
                    </button>
                  </div>
                )}

                {/* User Info Display */}
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
                  </div>
                  
                  {/* Session Status */}
                  <div className="flex items-center space-x-1">
                    {getSessionStatusIcon()}
                  </div>
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 bg-poker-dark-700 hover:bg-poker-dark-600 px-3 py-2 rounded-lg transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:block">{user.username}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute right-0 mt-2 w-64 bg-poker-dark-800 border border-gray-700 rounded-lg shadow-xl py-2"
                    >
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-gray-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-white">{user.username}</span>
                              {getRankIcon()}
                              {getUserLevelBadge()}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatChips(user.chips)} chips
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Session Info */}
                      <div className="px-4 py-2 bg-poker-dark-900/50">
                        <div className="text-xs text-gray-400 space-y-1">
                          <div className="flex items-center justify-between">
                            <span>Session:</span>
                            <div className="flex items-center space-x-1">
                              {getSessionStatusIcon()}
                              <span className={`
                                ${sessionInfo.sessionHealth === 'critical' ? 'text-red-400' :
                                  sessionInfo.sessionHealth === 'warning' ? 'text-yellow-400' :
                                  'text-green-400'}
                              `}>
                                {sessionInfo.sessionHealth}
                              </span>
                            </div>
                          </div>
                          <div className="flex justify-between">
                            <span>Last activity:</span>
                            <span>{sessionInfo.lastActivity}</span>
                          </div>
                          {tokenExpiryWarning && (
                            <button
                              onClick={handleRefreshToken}
                              className="w-full mt-2 px-2 py-1 bg-yellow-600 hover:bg-yellow-500 text-yellow-100 rounded text-xs transition-colors"
                            >
                              Refresh Session
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
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
                      </div>
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
                    {getSessionStatusIcon()}
                    {getConnectionStatusIcon()}
                  </div>
                </div>
                
                {tokenExpiryWarning && (
                  <button
                    onClick={handleRefreshToken}
                    className="w-full mt-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-500 text-yellow-100 rounded text-sm transition-colors"
                  >
                    Refresh Session
                  </button>
                )}
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
              
              <Link
                to="/profile"
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-300 hover:bg-poker-dark-700 hover:text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                <User className="w-4 h-4" />
                <span>Profile</span>
              </Link>
              
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
              
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center space-x-2 w-full px-3 py-2 rounded-lg text-red-400 hover:bg-poker-dark-700"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </motion.div>
        )}
      </div>
    </header>
  );
};

export default Header; 