import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../../store'
import { socketService } from '../../services/socketService'
import { PlayerAction } from '../../types'

interface ActionButtonsProps {
  validActions: string[]
  currentBet: number
  maxBet: number
  callAmount: number
  minRaise: number
  timeRemaining: number
  className?: string
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  validActions,
  currentBet,
  maxBet,
  callAmount,
  minRaise,
  timeRemaining,
  className = '',
}) => {
  const dispatch = useDispatch<AppDispatch>()
  const [betAmount, setBetAmount] = useState(minRaise)
  const [showBetSlider, setShowBetSlider] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)

  useEffect(() => {
    setBetAmount(Math.max(minRaise, callAmount + minRaise))
  }, [minRaise, callAmount])

  const handleAction = (actionType: string, amount?: number) => {
    setSelectedAction(actionType)
    
    const action: PlayerAction = {
      playerId: '', // Will be set by the server
      type: actionType as any,
      amount: amount,
      timestamp: Date.now(),
    }

    socketService.performAction(action)

    // Reset UI state after action
    setTimeout(() => {
      setSelectedAction(null)
      setShowBetSlider(false)
    }, 500)
  }

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'fold':
        return 'Fold'
      case 'check':
        return 'Check'
      case 'call':
        return `Call $${callAmount}`
      case 'bet':
        return 'Bet'
      case 'raise':
        return 'Raise'
      case 'all-in':
        return 'All-In'
      default:
        return action
    }
  }

  const getActionColor = (action: string) => {
    switch (action) {
      case 'fold':
        return 'bg-red-600 hover:bg-red-700 border-red-500'
      case 'check':
        return 'bg-blue-600 hover:bg-blue-700 border-blue-500'
      case 'call':
        return 'bg-green-600 hover:bg-green-700 border-green-500'
      case 'bet':
      case 'raise':
        return 'bg-orange-600 hover:bg-orange-700 border-orange-500'
      case 'all-in':
        return 'bg-purple-600 hover:bg-purple-700 border-purple-500'
      default:
        return 'bg-gray-600 hover:bg-gray-700 border-gray-500'
    }
  }

  const formatBetAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
    return amount.toLocaleString()
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 }
    }
  }

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 400, damping: 15 }
    }
  }

  const quickBetAmounts = [
    { label: '1/4 Pot', multiplier: 0.25 },
    { label: '1/2 Pot', multiplier: 0.5 },
    { label: 'Pot', multiplier: 1 },
    { label: '2x Pot', multiplier: 2 },
  ]

  return (
    <AnimatePresence>
      <motion.div
        className={`relative ${className}`}
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        {/* Time remaining indicator */}
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-poker-dark-800 bg-opacity-90 px-3 py-1 rounded-full text-white text-sm font-bold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {timeRemaining > 0 ? `${Math.ceil(timeRemaining)}s` : 'Your turn'}
        </motion.div>

        {/* Time bar */}
        {timeRemaining > 0 && (
          <motion.div
            className="absolute -top-6 left-0 right-0 h-1 bg-gray-700 rounded-full overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full bg-poker-accent-500"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: timeRemaining, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Bet/Raise Slider */}
        <AnimatePresence>
          {showBetSlider && (validActions.includes('bet') || validActions.includes('raise')) && (
            <motion.div
              className="absolute -top-32 left-1/2 transform -translate-x-1/2 bg-poker-dark-800 bg-opacity-95 border border-poker-accent-600 rounded-lg p-4 min-w-80"
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="text-white text-center mb-3">
                <div className="text-sm text-poker-accent-300 mb-2">
                  {validActions.includes('raise') ? 'Raise Amount' : 'Bet Amount'}
                </div>
                <div className="text-xl font-bold">${formatBetAmount(betAmount)}</div>
              </div>

              {/* Bet slider */}
              <div className="mb-4">
                <input
                  type="range"
                  min={minRaise}
                  max={maxBet}
                  value={betAmount}
                  onChange={(e) => setBetAmount(parseInt(e.target.value))}
                  className="w-full h-2 bg-poker-dark-600 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-poker-accent-400 mt-1">
                  <span>${minRaise}</span>
                  <span>${maxBet.toLocaleString()}</span>
                </div>
              </div>

              {/* Quick bet buttons */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickBetAmounts.map((quick) => (
                  <button
                    key={quick.label}
                    onClick={() => setBetAmount(Math.min(Math.max(currentBet * quick.multiplier, minRaise), maxBet))}
                    className="bg-poker-dark-600 hover:bg-poker-dark-500 text-white py-1 px-2 rounded text-xs transition-colors"
                  >
                    {quick.label}
                  </button>
                ))}
              </div>

              {/* Confirm/Cancel buttons */}
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAction(validActions.includes('raise') ? 'raise' : 'bet', betAmount)}
                  className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded font-medium transition-colors"
                >
                  {validActions.includes('raise') ? 'Raise' : 'Bet'} ${formatBetAmount(betAmount)}
                </button>
                <button
                  onClick={() => setShowBetSlider(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action buttons */}
        <motion.div
          className="flex items-center justify-center space-x-3 bg-poker-dark-800 bg-opacity-95 rounded-lg p-4 border border-poker-accent-600"
          layout
        >
          {validActions.map((action) => (
            <motion.button
              key={action}
              variants={buttonVariants}
              onClick={() => {
                if (action === 'bet' || action === 'raise') {
                  setShowBetSlider(true)
                } else {
                  handleAction(action, action === 'call' ? callAmount : undefined)
                }
              }}
              className={`
                ${getActionColor(action)} 
                text-white font-bold py-3 px-6 rounded-lg border-2 
                transition-all duration-200 transform
                ${selectedAction === action ? 'scale-95' : 'hover:scale-105'}
                active:scale-95 shadow-lg
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedAction !== null}
            >
              {getActionLabel(action)}
            </motion.button>
          ))}

          {/* All-in button (always available if player has chips) */}
          {maxBet > 0 && !validActions.includes('all-in') && (
            <motion.button
              variants={buttonVariants}
              onClick={() => handleAction('all-in', maxBet)}
              className={`
                ${getActionColor('all-in')} 
                text-white font-bold py-3 px-6 rounded-lg border-2 
                transition-all duration-200 transform hover:scale-105
                active:scale-95 shadow-lg
              `}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              disabled={selectedAction !== null}
            >
              All-In ${formatBetAmount(maxBet)}
            </motion.button>
          )}
        </motion.div>

        {/* Auto-actions */}
        <motion.div
          className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 flex space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <div className="bg-poker-dark-800 bg-opacity-90 rounded-lg p-2 text-xs">
            <label className="flex items-center space-x-2 text-poker-accent-300">
              <input type="checkbox" className="rounded" />
              <span>Auto-check/fold</span>
            </label>
          </div>
          <div className="bg-poker-dark-800 bg-opacity-90 rounded-lg p-2 text-xs">
            <label className="flex items-center space-x-2 text-poker-accent-300">
              <input type="checkbox" className="rounded" />
              <span>Auto-call any</span>
            </label>
          </div>
        </motion.div>

        {/* Loading overlay when action is being processed */}
        <AnimatePresence>
          {selectedAction && (
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-white text-center">
                <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                <div className="text-sm">Processing {selectedAction}...</div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}

export default ActionButtons