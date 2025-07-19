import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PlayerState } from '../../types'
import PlayingCard from './PlayingCard'
import ChipStack from './ChipStack'

interface PlayerSeatProps {
  player: PlayerState | null
  position: number
  style?: React.CSSProperties
  isCurrentPlayer: boolean
  isCurrentUser: boolean
  isHighlighted: boolean
  lastAction: string | null
  timeRemaining: number
  onSeatClick: () => void
}

const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  position,
  style,
  isCurrentPlayer,
  isCurrentUser,
  isHighlighted,
  lastAction,
  timeRemaining,
  onSeatClick,
}) => {
  const getStatusColor = () => {
    if (!player) return 'border-gray-600'
    
    switch (player.status) {
      case 'active':
        return isCurrentPlayer ? 'border-poker-accent-500 shadow-lg shadow-poker-accent-500/50' : 'border-green-500'
      case 'folded':
        return 'border-gray-500 opacity-60'
      case 'all-in':
        return 'border-red-500'
      case 'sitting-out':
        return 'border-yellow-500 opacity-80'
      case 'disconnected':
        return 'border-red-600 opacity-40'
      default:
        return 'border-gray-600'
    }
  }

  const getActionDisplay = () => {
    if (!lastAction) return null
    
    const actionColors = {
      fold: 'text-red-400',
      check: 'text-blue-400',
      call: 'text-green-400',
      bet: 'text-yellow-400',
      raise: 'text-orange-400',
      'all-in': 'text-red-500',
    }
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        className={`absolute -top-8 left-1/2 transform -translate-x-1/2 bg-poker-dark-800 px-2 py-1 rounded text-xs font-bold ${actionColors[lastAction as keyof typeof actionColors]}`}
      >
        {lastAction.toUpperCase()}
      </motion.div>
    )
  }

  const TimeBar = () => {
    if (!isCurrentPlayer || timeRemaining <= 0) return null
    
    const percentage = (timeRemaining / 30) * 100 // Assuming 30 seconds max
    
    return (
      <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-poker-accent-500"
          initial={{ width: '100%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'linear' }}
        />
      </div>
    )
  }

  // Empty seat
  if (!player) {
    return (
      <motion.div
        style={style}
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        onClick={onSeatClick}
      >
        <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-600 bg-poker-dark-700 bg-opacity-50 flex items-center justify-center group-hover:border-poker-accent-500 group-hover:bg-poker-accent-900 group-hover:bg-opacity-30 transition-all">
          <svg className="w-8 h-8 text-gray-500 group-hover:text-poker-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">
          Seat {position + 1}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      style={style}
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      layout
    >
      {/* Action Display */}
      <AnimatePresence>
        {isHighlighted && lastAction && getActionDisplay()}
      </AnimatePresence>

      {/* Player Avatar Container */}
      <motion.div
        className={`relative w-24 h-24 rounded-full border-4 ${getStatusColor()} bg-poker-dark-700 overflow-hidden`}
        animate={isCurrentPlayer ? { 
          boxShadow: ['0 0 0 rgba(217, 119, 6, 0)', '0 0 20px rgba(217, 119, 6, 0.8)', '0 0 0 rgba(217, 119, 6, 0)']
        } : {}}
        transition={isCurrentPlayer ? { duration: 2, repeat: Infinity } : {}}
      >
        {/* Avatar Image or Initials */}
        {player.avatar ? (
          <img
            src={player.avatar}
            alt={player.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-poker-accent-600 to-poker-accent-800 text-white font-bold text-xl">
            {player.name.charAt(0).toUpperCase()}
          </div>
        )}

        {/* Status Indicators */}
        <div className="absolute inset-0 flex items-center justify-center">
          {player.status === 'folded' && (
            <div className="bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded">
              FOLDED
            </div>
          )}
          {player.status === 'all-in' && (
            <div className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
              ALL-IN
            </div>
          )}
          {player.status === 'sitting-out' && (
            <div className="bg-yellow-600 text-white text-xs font-bold px-2 py-1 rounded">
              AWAY
            </div>
          )}
          {player.status === 'disconnected' && (
            <div className="bg-red-700 text-white text-xs font-bold px-2 py-1 rounded">
              OFFLINE
            </div>
          )}
        </div>

        {/* Dealer/Blind Indicators */}
        {player.isDealer && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-poker-accent-600 flex items-center justify-center text-xs font-bold">
            D
          </div>
        )}
        {player.isSmallBlind && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
            S
          </div>
        )}
        {player.isBigBlind && (
          <div className="absolute -top-2 -left-2 w-6 h-6 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white">
            B
          </div>
        )}

        {/* Connection Status */}
        <div className={`absolute bottom-1 right-1 w-3 h-3 rounded-full ${player.isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      </motion.div>

      {/* Player Info */}
      <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center min-w-max">
        <div className={`text-sm font-medium ${isCurrentUser ? 'text-poker-accent-300' : 'text-white'}`}>
          {player.name}
          {isCurrentUser && ' (You)'}
        </div>
        <div className="text-xs text-poker-accent-400">
          ${player.chips.toLocaleString()}
        </div>
      </div>

      {/* Player Cards */}
      {player.cards && player.cards.length > 0 && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {player.cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ y: -20, rotation: Math.random() * 40 - 20 }}
              animate={{ y: 0, rotation: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PlayingCard
                card={isCurrentUser || player.status === 'active' ? card : null}
                size="small"
                faceDown={!isCurrentUser && player.status !== 'folded'}
              />
            </motion.div>
          ))}
        </div>
      )}

      {/* Current Bet */}
      {player.currentBet > 0 && (
        <motion.div
          className="absolute -right-8 top-1/2 transform -translate-y-1/2"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <ChipStack amount={player.currentBet} size="small" />
        </motion.div>
      )}

      {/* Time Bar */}
      <TimeBar />

      {/* Highlight Effect */}
      <AnimatePresence>
        {isHighlighted && (
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-poker-accent-400"
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 0.8, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PlayerSeat