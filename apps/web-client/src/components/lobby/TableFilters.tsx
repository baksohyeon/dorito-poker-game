import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { RootState } from '../../store';
import { updateLobbyFilters } from '../../store/slices/tableSlice';

const TableFilters: React.FC = () => {
  const dispatch = useDispatch();
  const { lobbyFilters } = useSelector((state: RootState) => state.table);

  const handleFilterChange = (key: string, value: any) => {
    dispatch(updateLobbyFilters({ [key]: value }));
  };

  const handleBlindRangeChange = (index: number, value: number) => {
    const newRange = [...lobbyFilters.blindRange] as [number, number];
    newRange[index] = value;
    handleFilterChange('blindRange', newRange);
  };

  const handlePlayerCountChange = (index: number, value: number) => {
    const newRange = [...lobbyFilters.playerCount] as [number, number];
    newRange[index] = value;
    handleFilterChange('playerCount', newRange);
  };

  const resetFilters = () => {
    dispatch(updateLobbyFilters({
      gameType: 'all',
      blindRange: [0, 1000],
      playerCount: [1, 10],
      showPrivate: false,
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filter Tables</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-poker-green-400 hover:text-poker-green-300 transition-colors"
        >
          Reset Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game Type
          </label>
          <select
            value={lobbyFilters.gameType}
            onChange={(e) => handleFilterChange('gameType', e.target.value)}
            className="poker-input w-full"
            aria-label="Select game type"
          >
            <option value="all">All Games</option>
            <option value="texas-holdem">Texas Hold'em</option>
            <option value="omaha">Omaha</option>
            <option value="seven-card-stud">Seven Card Stud</option>
          </select>
        </div>

        {/* Blind Range */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Big Blind Range
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="0"
                value={lobbyFilters.blindRange[0]}
                onChange={(e) => handleBlindRangeChange(0, parseInt(e.target.value) || 0)}
                className="poker-input flex-1 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="0"
                value={lobbyFilters.blindRange[1]}
                onChange={(e) => handleBlindRangeChange(1, parseInt(e.target.value) || 1000)}
                className="poker-input flex-1 text-sm"
                placeholder="Max"
              />
            </div>
            
            {/* Quick Blind Presets */}
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Micro', range: [1, 10] as [number, number] },
                { label: 'Low', range: [10, 50] as [number, number] },
                { label: 'Mid', range: [50, 200] as [number, number] },
                { label: 'High', range: [200, 1000] as [number, number] },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleFilterChange('blindRange', preset.range)}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Player Count */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Player Count
          </label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="number"
                min="1"
                max="10"
                value={lobbyFilters.playerCount[0]}
                onChange={(e) => handlePlayerCountChange(0, parseInt(e.target.value) || 1)}
                className="poker-input flex-1 text-sm"
                placeholder="Min"
              />
              <span className="text-gray-400">to</span>
              <input
                type="number"
                min="1"
                max="10"
                value={lobbyFilters.playerCount[1]}
                onChange={(e) => handlePlayerCountChange(1, parseInt(e.target.value) || 10)}
                className="poker-input flex-1 text-sm"
                placeholder="Max"
              />
            </div>
            
            {/* Quick Player Count Presets */}
            <div className="flex flex-wrap gap-1">
              {[
                { label: 'Heads-up', range: [2, 2] as [number, number] },
                { label: 'Short', range: [3, 6] as [number, number] },
                { label: 'Full', range: [7, 10] as [number, number] },
              ].map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handleFilterChange('playerCount', preset.range)}
                  className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded transition-colors"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Options */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Options
          </label>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={lobbyFilters.showPrivate}
                onChange={(e) => handleFilterChange('showPrivate', e.target.checked)}
                className="h-4 w-4 text-poker-green-600 focus:ring-poker-green-500 border-gray-600 bg-poker-dark-700 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Show Private Tables</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="h-4 w-4 text-poker-green-600 focus:ring-poker-green-500 border-gray-600 bg-poker-dark-700 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Show Empty Tables</span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={false}
                onChange={() => {}}
                className="h-4 w-4 text-poker-green-600 focus:ring-poker-green-500 border-gray-600 bg-poker-dark-700 rounded"
              />
              <span className="ml-2 text-sm text-gray-300">Show Full Tables</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Filters Summary */}
      <div className="mt-6 pt-4 border-t border-gray-700">
        <div className="flex flex-wrap gap-2">
          {lobbyFilters.gameType !== 'all' && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-poker-green-500/20 text-poker-green-400">
              Game: {lobbyFilters.gameType}
            </span>
          )}
          
          {(lobbyFilters.blindRange[0] > 0 || lobbyFilters.blindRange[1] < 1000) && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-500/20 text-blue-400">
              Blinds: {lobbyFilters.blindRange[0]} - {lobbyFilters.blindRange[1]}
            </span>
          )}
          
          {(lobbyFilters.playerCount[0] > 1 || lobbyFilters.playerCount[1] < 10) && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-500/20 text-purple-400">
              Players: {lobbyFilters.playerCount[0]} - {lobbyFilters.playerCount[1]}
            </span>
          )}
          
          {lobbyFilters.showPrivate && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-yellow-500/20 text-yellow-400">
              Include Private
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TableFilters; 