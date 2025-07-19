import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '../../types'
import PlayingCard from './PlayingCard'

interface CommunityCardsProps {
  cards: Card[]
  phase: string
  maxCards?: number
}

const CommunityCards: React.FC<CommunityCardsProps> = ({
  cards,
  phase,
  maxCards = 5,
}) => {
  const getPhaseCards = () => {
    switch (phase) {
      case 'preflop':
        return []
      case 'flop':
        return cards.slice(0, 3)
      case 'turn':
        return cards.slice(0, 4)
      case 'river':
      case 'showdown':
      case 'finished':
        return cards.slice(0, 5)
      default:
        return cards
    }
  }

  const visibleCards = getPhaseCards()
  const placeholderCount = Math.max(0, maxCards - visibleCards.length)

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: -50, 
      rotateX: 90,
      scale: 0.8
    },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      rotateX: 0,
      scale: 1,
      transition: {
        delay: index * 0.2,
        duration: 0.5,
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }),
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <motion.div
      className="flex items-center justify-center space-x-2 p-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Phase Label */}
      <motion.div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-poker-accent-300 text-sm font-medium capitalize"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        {phase !== 'waiting' && phase !== 'preflop' && (
          <span className="bg-poker-dark-800 bg-opacity-90 px-3 py-1 rounded-full">
            {phase === 'flop' && 'The Flop'}
            {phase === 'turn' && 'The Turn'}
            {phase === 'river' && 'The River'}
            {phase === 'showdown' && 'Showdown'}
            {phase === 'finished' && 'Hand Complete'}
          </span>
        )}
      </motion.div>

      {/* Community Cards */}
      <div className="flex space-x-2">
        <AnimatePresence mode="popLayout">
          {visibleCards.map((card, index) => (
            <motion.div
              key={`${card.suit}-${card.rank}-${index}`}
              custom={index}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <PlayingCard
                card={card}
                size="medium"
                isHighlighted={false}
                className="shadow-lg hover:shadow-xl transition-shadow duration-300"
              />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Placeholder cards for future community cards */}
        {phase !== 'finished' && phase !== 'showdown' && (
          <AnimatePresence>
            {Array.from({ length: placeholderCount }, (_, index) => (
              <motion.div
                key={`placeholder-${index}`}
                className="w-12 h-16 rounded-lg border-2 border-dashed border-poker-accent-600 bg-poker-dark-800 bg-opacity-30 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 0.5, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: (visibleCards.length + index) * 0.1 }}
              >
                <div className="text-poker-accent-600 text-xs opacity-60">?</div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Special Effects */}
      <AnimatePresence>
        {phase === 'flop' && visibleCards.length === 3 && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Flop reveal effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-radial from-poker-accent-500 via-transparent to-transparent opacity-20"
              initial={{ scale: 0 }}
              animate={{ scale: 2 }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {(phase === 'turn' || phase === 'river') && (
          <motion.div
            className="absolute -inset-2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Turn/River highlight */}
            <motion.div
              className="absolute inset-0 border-2 border-poker-accent-500 rounded-lg opacity-30"
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </motion.div>
        )}

        {phase === 'showdown' && (
          <motion.div
            className="absolute -inset-4 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Showdown glow effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg opacity-20 blur-sm"
              animate={{
                opacity: [0.2, 0.4, 0.2],
                scale: [1, 1.05, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card Count Display */}
      {visibleCards.length > 0 && (
        <motion.div
          className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-poker-accent-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          {visibleCards.length} of 5 community cards
        </motion.div>
      )}

      {/* No cards message */}
      {visibleCards.length === 0 && (phase === 'waiting' || phase === 'preflop') && (
        <motion.div
          className="flex items-center justify-center h-16 text-poker-accent-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {phase === 'waiting' ? 'Waiting for game to start...' : 'Community cards will appear here'}
        </motion.div>
      )}
    </motion.div>
  )
}

export default CommunityCards