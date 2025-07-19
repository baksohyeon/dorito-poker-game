import React from 'react'
import { motion } from 'framer-motion'
import { Card } from '../../types'

interface PlayingCardProps {
  card: Card | null
  size?: 'small' | 'medium' | 'large'
  faceDown?: boolean
  isHighlighted?: boolean
  onClick?: () => void
  className?: string
}

const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  size = 'medium',
  faceDown = false,
  isHighlighted = false,
  onClick,
  className = '',
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-8 h-12 text-xs'
      case 'large':
        return 'w-20 h-28 text-lg'
      case 'medium':
      default:
        return 'w-12 h-16 text-sm'
    }
  }

  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return '♥'
      case 'diamonds':
        return '♦'
      case 'clubs':
        return '♣'
      case 'spades':
        return '♠'
      default:
        return '?'
    }
  }

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black'
  }

  const getRankDisplay = (rank: string) => {
    return rank === '10' ? 'T' : rank
  }

  if (faceDown || !card) {
    return (
      <motion.div
        className={`
          ${getSizeClasses()} 
          playing-card face-down relative cursor-pointer
          ${isHighlighted ? 'ring-2 ring-poker-accent-500' : ''}
          ${className}
        `}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: faceDown ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {/* Card back design */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-800 via-blue-900 to-blue-950 rounded-lg border border-gray-300">
          {/* Decorative pattern */}
          <div className="absolute inset-2 border border-blue-300 rounded-md opacity-30">
            <div className="absolute inset-1 border border-blue-400 rounded-sm opacity-50">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-blue-300 text-lg font-bold opacity-60">♠</div>
              </div>
            </div>
          </div>
          
          {/* Corner patterns */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-blue-300 rounded-full opacity-30"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-blue-300 rounded-full opacity-30"></div>
          <div className="absolute bottom-1 left-1 w-2 h-2 bg-blue-300 rounded-full opacity-30"></div>
          <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-300 rounded-full opacity-30"></div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={`
        ${getSizeClasses()} 
        playing-card relative cursor-pointer bg-white border border-gray-300 rounded-lg shadow-md
        ${isHighlighted ? 'ring-2 ring-poker-accent-500 shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Top-left rank and suit */}
      <div className={`absolute top-0.5 left-0.5 ${getSuitColor(card.suit)} font-bold leading-none`}>
        <div className="text-center">
          <div>{getRankDisplay(card.rank)}</div>
          <div className="-mt-1">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>

      {/* Bottom-right rank and suit (rotated) */}
      <div className={`absolute bottom-0.5 right-0.5 ${getSuitColor(card.suit)} font-bold leading-none transform rotate-180`}>
        <div className="text-center">
          <div>{getRankDisplay(card.rank)}</div>
          <div className="-mt-1">{getSuitSymbol(card.suit)}</div>
        </div>
      </div>

      {/* Center symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${getSuitColor(card.suit)}`}>
        <span className={`${size === 'large' ? 'text-4xl' : size === 'small' ? 'text-lg' : 'text-2xl'} font-bold`}>
          {getSuitSymbol(card.suit)}
        </span>
      </div>

      {/* Card highlight effect */}
      {isHighlighted && (
        <motion.div
          className="absolute inset-0 bg-poker-accent-500 bg-opacity-20 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}

      {/* Shine effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white to-transparent opacity-0 hover:opacity-10 transition-opacity duration-300 rounded-lg pointer-events-none" />
    </motion.div>
  )
}

export default PlayingCard