import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, DollarSign, Play, Filter, Search, RefreshCw } from 'lucide-react';
import { formatChips } from '../utils/formatting';

interface Table {
  id: string;
  name: string;
  gameType: 'texas-holdem' | 'omaha' | 'seven-card-stud';
  blinds: { small: number; big: number };
  maxPlayers: number;
  playerCount: number;
  status: 'waiting' | 'active' | 'full';
  isPrivate: boolean;
  averagePot: number;
  handsPerHour: number;
  serverId: string;
  serverHost?: string;
  serverPort?: number;
}

const TablesPage: React.FC = () => {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [gameTypeFilter, setGameTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [blindsFilter, setBlindsFilter] = useState<string>('all');

  // Mock data - in real app, this would come from the master server API
  useEffect(() => {
    const fetchTables = async () => {
      setLoading(true);
      try {
        // Simulate API call to master server
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTables: Table[] = [
          {
            id: 'server-1-table-1',
            name: 'Beginner Texas Hold\'em',
            gameType: 'texas-holdem',
            blinds: { small: 1, big: 2 },
            maxPlayers: 9,
            playerCount: 4,
            status: 'active',
            isPrivate: false,
            averagePot: 45,
            handsPerHour: 85,
            serverId: 'server-1'
          },
          {
            id: 'server-1-table-2',
            name: 'Intermediate Hold\'em',
            gameType: 'texas-holdem',
            blinds: { small: 5, big: 10 },
            maxPlayers: 9,
            playerCount: 6,
            status: 'active',
            isPrivate: false,
            averagePot: 120,
            handsPerHour: 78,
            serverId: 'server-1'
          },
          {
            id: 'server-2-table-1',
            name: 'High Stakes Club',
            gameType: 'texas-holdem',
            blinds: { small: 25, big: 50 },
            maxPlayers: 6,
            playerCount: 6,
            status: 'full',
            isPrivate: false,
            averagePot: 500,
            handsPerHour: 72,
            serverId: 'server-2'
          },
          {
            id: 'server-2-table-2',
            name: 'Fast Action Table',
            gameType: 'texas-holdem',
            blinds: { small: 10, big: 20 },
            maxPlayers: 6,
            playerCount: 2,
            status: 'waiting',
            isPrivate: false,
            averagePot: 180,
            handsPerHour: 120,
            serverId: 'server-2'
          },
          {
            id: 'server-1-table-3',
            name: 'Omaha Challenge',
            gameType: 'omaha',
            blinds: { small: 5, big: 10 },
            maxPlayers: 9,
            playerCount: 3,
            status: 'active',
            isPrivate: false,
            averagePot: 200,
            handsPerHour: 65,
            serverId: 'server-1'
          }
        ];
        
        setTables(mockTables);
      } catch (error) {
        console.error('Failed to fetch tables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
    
    // Refresh tables every 30 seconds
    const interval = setInterval(fetchTables, 30000);
    return () => clearInterval(interval);
  }, []);

  const filteredTables = tables.filter(table => {
    const matchesSearch = table.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGameType = gameTypeFilter === 'all' || table.gameType === gameTypeFilter;
    const matchesStatus = statusFilter === 'all' || table.status === statusFilter;
    const matchesBlinds = blindsFilter === 'all' || 
      (blindsFilter === 'low' && table.blinds.big <= 10) ||
      (blindsFilter === 'medium' && table.blinds.big > 10 && table.blinds.big <= 50) ||
      (blindsFilter === 'high' && table.blinds.big > 50);
    
    return matchesSearch && matchesGameType && matchesStatus && matchesBlinds;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'waiting': return 'text-yellow-400';
      case 'full': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'waiting': return 'Waiting';
      case 'full': return 'Full';
      default: return 'Unknown';
    }
  };


  const refreshTables = () => {
    setTables([]);
    setLoading(true);
    // Trigger refetch
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
              <p className="text-white text-lg">Loading tables...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Poker Tables</h1>
              <p className="text-gray-400">Join a table and start playing!</p>
            </div>
            <button
              onClick={refreshTables}
              className="flex items-center space-x-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search tables..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
              />
            </div>

            {/* Game Type Filter */}
            <select
              title="Game Type Filter"
              value={gameTypeFilter}
              onChange={(e) => setGameTypeFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Games</option>
              <option value="texas-holdem">Texas Hold'em</option>
              <option value="omaha">Omaha</option>
              <option value="seven-card-stud">Seven Card Stud</option>
            </select>

            {/* Status Filter */}
            <select
              title="Status Filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="waiting">Waiting</option>
              <option value="active">Active</option>
              <option value="full">Full</option>
            </select>

            {/* Blinds Filter */}
            <select
              title="Blinds Filter"
              value={blindsFilter}
              onChange={(e) => setBlindsFilter(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-green-400 focus:outline-none"
            >
              <option value="all">All Stakes</option>
              <option value="low">Low Stakes (≤$10)</option>
              <option value="medium">Medium Stakes ($10-$50)</option>
              <option value="high">High Stakes (&gt;$50)</option>
            </select>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setGameTypeFilter('all');
                setStatusFilter('all');
                setBlindsFilter('all');
              }}
              className="flex items-center justify-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
            >
              <Filter className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Tables Grid */}
        {filteredTables.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTables.map((table) => (
              <div
                key={table.id}
                className="bg-gray-800 rounded-xl border border-gray-700 hover:border-gray-600 transition-all duration-200 overflow-hidden"
              >
                {/* Table Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-1">{table.name}</h3>
                      <p className="text-gray-400 capitalize">{table.gameType.replace('-', ' ')}</p>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(table.status)} bg-gray-700`}>
                      {getStatusText(table.status)}
                    </div>
                  </div>

                  {/* Table Stats */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">
                        {table.playerCount}/{table.maxPlayers} players
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">
                        {formatChips(table.blinds.small)}/{formatChips(table.blinds.big)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-black">$</span>
                      </div>
                      <span className="text-white text-sm">
                        Avg pot: {formatChips(table.averagePot)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-white text-sm">
                        {table.handsPerHour} h/hr
                      </span>
                    </div>
                  </div>

                  {/* Player Progress Bar */}
                  <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                    <div
                      className="bg-green-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(table.playerCount / table.maxPlayers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Table Actions */}
                <div className="px-6 pb-6">
                  {table.status === 'full' ? (
                    <button
                      disabled
                      className="w-full bg-gray-600 text-gray-400 font-bold py-3 px-4 rounded-lg cursor-not-allowed"
                    >
                      Table Full
                    </button>
                  ) : (
                    <div className="flex space-x-3">
                      <Link
                        to={`/table/${table.id}`}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors duration-200 flex items-center justify-center space-x-2"
                      >
                        <Play className="w-4 h-4" />
                        <span>Join Table</span>
                      </Link>
                      <button
                        onClick={() => {/* Open table info modal */}}
                        className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200"
                      >
                        Info
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="text-gray-400 mb-4">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No tables found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your filters or check back later.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setGameTypeFilter('all');
                setStatusFilter('all');
                setBlindsFilter('all');
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Quick Stats */}
        <div className="mt-12 bg-gray-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Server Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {tables.length}
              </div>
              <div className="text-gray-400">Total Tables</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400 mb-1">
                {tables.reduce((sum, table) => sum + table.playerCount, 0)}
              </div>
              <div className="text-gray-400">Active Players</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400 mb-1">
                {Math.round(tables.reduce((sum, table) => sum + table.handsPerHour, 0) / tables.length) || 0}
              </div>
              <div className="text-gray-400">Avg Hands/Hour</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400 mb-1">
                2
              </div>
              <div className="text-gray-400">Servers Online</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablesPage; 