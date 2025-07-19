import React from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../store/hooks';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, Coins, Lock, Zap } from 'lucide-react';
import { TableInfo } from '@shared/types/table.types';
import { RootState } from '../../store';
import { joinTable } from '../../store/slices/tableSlice';
import { formatChips } from '../../utils/formatting';

interface TableCardProps {
  table: TableInfo;
}

const TableCard: React.FC<TableCardProps> = ({ table }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { loading } = useSelector((state: RootState) => state.table);

  const canJoin = () => {
    if (!user) return false;
    if (table.playerCount >= table.maxPlayers) return false;
    if (table.isPrivate) return false;
    // Check if user has enough chips (at least 20 big blinds)
    if (table.blinds && user.chips < table.blinds.big * 20) return false;
    return true;
  };

  const getTableStatus = () => {
    if (table.playerCount === 0) return 'Waiting for players';
    if (table.playerCount >= table.maxPlayers) return 'Full';
    if (table.playerCount === 1) return 'Heads up';
    return 'Active';
  };

  const getStatusColor = () => {
    if (table.playerCount === 0) return 'text-yellow-400';
    if (table.playerCount >= table.maxPlayers) return 'text-red-400';
    return 'text-green-400';
  };

  const handleJoin = async () => {
    if (!canJoin()) return;
    
    try {
      await dispatch(joinTable({ tableId: table.id }));
      navigate(`/table/${table.id}`);
    } catch (error) {
      console.error('Failed to join table:', error);
    }
  };

  const getTableType = () => {
    // Determine table type based on blind levels
    if (!table.blinds) return 'Unknown';
    
    const bigBlind = table.blinds.big;
    if (bigBlind >= 1000) return 'High Stakes';
    if (bigBlind >= 100) return 'Mid Stakes';
    if (bigBlind >= 10) return 'Low Stakes';
    return 'Micro Stakes';
  };

  const getTableTypeColor = () => {
    const type = getTableType();
    switch (type) {
      case 'High Stakes': return 'text-purple-400 bg-purple-500/10';
      case 'Mid Stakes': return 'text-blue-400 bg-blue-500/10';
      case 'Low Stakes': return 'text-green-400 bg-green-500/10';
      case 'Micro Stakes': return 'text-gray-400 bg-gray-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-poker-dark-800 rounded-xl border border-gray-700 hover:border-poker-green-500/50 transition-all duration-300 overflow-hidden"
    >
      {/* Table Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-semibold text-white">
              {table.name || `Table ${table.id.slice(-6)}`}
            </h3>
            {table.isPrivate && <Lock className="w-4 h-4 text-yellow-400" />}
          </div>
          
          <span className={`text-xs px-2 py-1 rounded-full ${getTableTypeColor()}`}>
            {getTableType()}
          </span>
        </div>
        
        <div className="flex items-center mt-2">
          <span className={`text-sm ${getStatusColor()}`}>
            {getTableStatus()}
          </span>
          {table.handsPerHour > 0 && (
            <div className="flex items-center ml-4 text-gray-400">
              <Zap className="w-3 h-3 mr-1" />
              <span className="text-xs">{table.handsPerHour} hands/hr</span>
            </div>
          )}
        </div>
      </div>

      {/* Table Body */}
      <div className="p-4">
        {/* Players and Blinds */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center">
            <Users className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-white">
              {table.playerCount}/{table.maxPlayers}
            </span>
            {table.waitingList > 0 && (
              <span className="text-xs text-yellow-400 ml-2">
                (+{table.waitingList} waiting)
              </span>
            )}
          </div>
          
          <div className="flex items-center">
            <Coins className="w-4 h-4 text-poker-gold-400 mr-2" />
            <span className="text-white">
              {table.blinds ? `${table.blinds.small}/${table.blinds.big}` : 'N/A'}
            </span>
          </div>
        </div>

        {/* Average Pot */}
        {table.averagePot > 0 && (
          <div className="flex items-center justify-between mb-4 p-2 bg-poker-dark-700 rounded-lg">
            <span className="text-sm text-gray-400">Average Pot:</span>
            <span className="text-sm font-bold text-poker-gold-400">
              {formatChips(table.averagePot)}
            </span>
          </div>
        )}

        {/* Player Avatars */}
        <div className="flex items-center mb-4">
          <span className="text-xs text-gray-400 mr-2">Players:</span>
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(table.playerCount, 6) }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-gradient-to-br from-poker-green-400 to-poker-green-600 border-2 border-poker-dark-800 flex items-center justify-center"
              >
                <span className="text-xs font-bold text-white">
                  {String.fromCharCode(65 + i)}
                </span>
              </div>
            ))}
            {table.playerCount > 6 && (
              <div className="w-6 h-6 rounded-full bg-gray-600 border-2 border-poker-dark-800 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  +{table.playerCount - 6}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Buy-in Range (estimated) */}
        {table.blinds && (
          <div className="text-xs text-gray-400 mb-4">
            <span>Suggested buy-in: </span>
            <span className="text-white">
              {formatChips(table.blinds.big * 20)} - {formatChips(table.blinds.big * 100)}
            </span>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          {!user ? (
            <button
              disabled
              className="w-full poker-button poker-button-secondary opacity-50 cursor-not-allowed"
            >
              Login Required
            </button>
          ) : !canJoin() ? (
            <button
              disabled
              className="w-full poker-button poker-button-secondary opacity-50 cursor-not-allowed"
            >
              {table.playerCount >= table.maxPlayers 
                ? 'Table Full' 
                : table.isPrivate 
                  ? 'Private Table'
                  : table.blinds && user.chips < table.blinds.big * 20
                    ? 'Insufficient Chips'
                    : 'Cannot Join'
              }
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={loading}
              className="w-full poker-button poker-button-primary flex items-center justify-center"
            >
              {loading ? (
                <div className="loading-spinner w-4 h-4 mr-2" />
              ) : null}
              Join Table
            </button>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-400">
          <div>Game: Texas Hold'em</div>
          <div>Limit: No Limit</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TableCard; 