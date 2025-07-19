import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, RefreshCw, Users, Coins } from 'lucide-react';
import { RootState } from '../store';
import { fetchTables } from '../store/slices/tableSlice';
import { openModal } from '../store/slices/uiSlice';
import TableCard from '../components/lobby/TableCard';
import TableFilters from '../components/lobby/TableFilters';
import { formatChips } from '../utils/formatting';

const LobbyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableTables, loading, error, lobbyFilters } = useSelector((state: RootState) => state.table);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    dispatch(fetchTables());
    // Refresh tables every 30 seconds
    const interval = setInterval(() => {
      dispatch(fetchTables());
    }, 30000);

    return () => clearInterval(interval);
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchTables());
  };

  const handleCreateTable = () => {
    dispatch(openModal({ type: 'table-create' }));
  };

  const filteredTables = availableTables.filter(table => {
    // Search filter
    if (searchQuery && !table.name?.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Game type filter
    if (lobbyFilters.gameType !== 'all' && table.blinds && lobbyFilters.gameType !== 'texas-holdem') {
      return false;
    }

    // Blind range filter
    if (table.blinds) {
      const bigBlind = table.blinds.big;
      if (bigBlind < lobbyFilters.blindRange[0] || bigBlind > lobbyFilters.blindRange[1]) {
        return false;
      }
    }

    // Player count filter
    if (table.playerCount < lobbyFilters.playerCount[0] || table.playerCount > lobbyFilters.playerCount[1]) {
      return false;
    }

    // Private tables filter
    if (!lobbyFilters.showPrivate && table.isPrivate) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-poker-dark-900">
      {/* Header */}
      <div className="bg-poker-dark-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Game Lobby</h1>
              <p className="text-gray-400 mt-1">
                Find a table that suits your style and skill level
              </p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex items-center space-x-3">
              {user && (
                <div className="flex items-center space-x-2 bg-poker-dark-700 px-4 py-2 rounded-lg">
                  <Coins className="w-4 h-4 text-poker-gold-400" />
                  <span className="text-white font-mono">{formatChips(user.chips)}</span>
                </div>
              )}
              
              <button
                onClick={handleCreateTable}
                className="poker-button poker-button-primary flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Table</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="poker-input pl-10 w-full"
              />
            </div>

            {/* Filter and Refresh buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`poker-button ${showFilters ? 'poker-button-primary' : 'poker-button-secondary'} flex items-center space-x-2`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="poker-button poker-button-secondary flex items-center space-x-2"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <TableFilters />
            </motion.div>
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-poker-green-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Available Tables</p>
                <p className="text-xl font-bold text-white">{filteredTables.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Active Players</p>
                <p className="text-xl font-bold text-white">
                  {availableTables.reduce((sum, table) => sum + table.playerCount, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center">
              <Coins className="w-5 h-5 text-poker-gold-400 mr-2" />
              <div>
                <p className="text-sm text-gray-400">Average Pot</p>
                <p className="text-xl font-bold text-white">
                  {availableTables.length > 0 
                    ? formatChips(Math.round(availableTables.reduce((sum, table) => sum + table.averagePot, 0) / availableTables.length))
                    : '0'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-poker-red-500 bg-opacity-10 border border-poker-red-500 rounded-lg p-4 mb-6"
          >
            <p className="text-poker-red-500">{error}</p>
          </motion.div>
        )}

        {/* Tables Grid */}
        {loading && filteredTables.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="loading-spinner w-8 h-8 mr-3" />
            <span className="text-gray-400">Loading tables...</span>
          </div>
        ) : filteredTables.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Tables Found</h3>
            <p className="text-gray-400 mb-6">
              {searchQuery || Object.values(lobbyFilters).some(v => v !== 'all' && v !== false && !Array.isArray(v))
                ? 'Try adjusting your search or filters'
                : 'Be the first to create a table!'
              }
            </p>
            <button
              onClick={handleCreateTable}
              className="poker-button poker-button-primary"
            >
              Create New Table
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTables.map((table, index) => (
              <motion.div
                key={table.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <TableCard table={table} />
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 mb-4">
            Can't find the perfect table? Create your own or join a quick game.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCreateTable}
              className="poker-button poker-button-primary"
            >
              Create Custom Table
            </button>
            <button
              onClick={() => {
                // Quick join logic - find a suitable table
                const suitableTable = availableTables.find(table => 
                  table.playerCount < table.maxPlayers && 
                  !table.isPrivate &&
                  user && table.blinds && table.blinds.big * 20 <= user.chips
                );
                if (suitableTable) {
                  // Join the table
                  console.log('Quick joining table:', suitableTable.id);
                }
              }}
              className="poker-button poker-button-secondary"
            >
              Quick Join
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage; 