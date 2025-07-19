<<<<<<< Updated upstream
import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState, AppDispatch } from '../store'
import { fetchTables, quickJoin, joinTable } from '../store/slices/lobbySlice'
import LoadingScreen from '../components/ui/LoadingScreen'
import CreateTableModal from '../components/lobby/CreateTableModal'

const LobbyPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const [createTableModalOpen, setCreateTableModalOpen] = useState(false)
  const { 
    tables, 
    activeGames, 
    playersOnline, 
    isLoading, 
    error,
    quickJoinInProgress 
  } = useSelector((state: RootState) => state.lobby)

  useEffect(() => {
    // Fetch tables on component mount
    dispatch(fetchTables({}))
  }, [dispatch])

  const handleQuickJoin = () => {
    dispatch(quickJoin({
      gameType: 'texas-holdem',
      minStakes: 1,
      maxStakes: 100,
      preferredPlayerCount: 6,
    }))
  }

  const handleJoinTable = (tableId: string) => {
    navigate(`/table/${tableId}`)
  }

  if (isLoading) {
    return <LoadingScreen message="Loading lobby..." fullScreen={false} />
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Poker Lobby</h1>
        <p className="text-poker-accent-300">Choose a table and start playing!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div>
              <p className="text-poker-accent-300 text-sm">Active Games</p>
              <p className="text-white text-2xl font-bold">{activeGames}</p>
            </div>
          </div>
        </div>

        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="text-poker-accent-300 text-sm">Players Online</p>
              <p className="text-white text-2xl font-bold">{playersOnline}</p>
            </div>
          </div>
        </div>

        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-poker-accent-300 text-sm">Available Tables</p>
              <p className="text-white text-2xl font-bold">{tables.filter(t => t.status === 'waiting').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleQuickJoin}
            disabled={quickJoinInProgress}
            className="bg-poker-accent-600 hover:bg-poker-accent-700 disabled:bg-poker-accent-800 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            {quickJoinInProgress ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Finding Table...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>Quick Join</span>
              </>
            )}
          </button>

          <button 
            onClick={() => setCreateTableModalOpen(true)}
            className="bg-poker-dark-600 hover:bg-poker-dark-500 text-white px-6 py-3 rounded-lg font-medium transition-colors border border-poker-accent-600 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Create Table</span>
          </button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-900 border border-red-600 text-red-200 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Tables List */}
      <div className="mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Available Tables</h2>
        
        {tables.length === 0 ? (
          <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-8 text-center">
            <svg className="w-16 h-16 text-poker-accent-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <p className="text-poker-accent-300 text-lg mb-2">No tables available</p>
            <p className="text-poker-accent-400">Create a new table to start playing!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {tables.map((table) => (
              <div key={table.id} className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6 hover:border-poker-accent-500 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-white font-semibold text-lg">{table.name}</h3>
                    <p className="text-poker-accent-300 text-sm">{table.gameType.replace('-', ' ').toUpperCase()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    table.status === 'waiting' ? 'bg-green-900 text-green-200' :
                    table.status === 'active' ? 'bg-blue-900 text-blue-200' :
                    'bg-red-900 text-red-200'
                  }`}>
                    {table.status.charAt(0).toUpperCase() + table.status.slice(1)}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-poker-accent-300">Players:</span>
                    <span className="text-white">{table.playerCount}/{table.maxPlayers}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-poker-accent-300">Stakes:</span>
                    <span className="text-white">${table.blinds.small}/${table.blinds.big}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-poker-accent-300">Buy-in:</span>
                    <span className="text-white">${table.buyIn.min} - ${table.buyIn.max}</span>
                  </div>
                </div>

                <button 
                  onClick={() => handleJoinTable(table.id)}
                  className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                    table.status === 'full' 
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                      : 'bg-poker-accent-600 hover:bg-poker-accent-700 text-white'
                  }`}
                  disabled={table.status === 'full'}
                >
                  {table.status === 'full' ? 'Table Full' : 'Join Table'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Table Modal */}
      <CreateTableModal
        isOpen={createTableModalOpen}
        onClose={() => setCreateTableModalOpen(false)}
      />
    </div>
  )
}

export default LobbyPage
=======
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
>>>>>>> Stashed changes
