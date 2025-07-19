import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SidePot } from '../../types'
import ChipStack from './ChipStack'

interface PotDisplayProps {
  pot: number
  sidePots?: SidePot[]
  isAnimating?: boolean
  className?: string
}

const PotDisplay: React.FC<PotDisplayProps> = ({
  pot,
  sidePots = [],
  isAnimating = false,
  className = '',
}) => {
  const formatPotAmount = (amount: number) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `$${(amount / 1000).toFixed(1)}K`
    return `$${amount.toLocaleString()}`
  }

  const totalPot = pot + (sidePots?.reduce((sum, sidePot) => sum + sidePot.amount, 0) || 0)

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 15
      }
    }
  }

  const glowVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  return (
    <motion.div
      className={`relative flex flex-col items-center space-y-4 ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Main Pot */}
      {pot > 0 && (
        <motion.div
          className="relative"
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          {/* Pot Background */}
          <div className="relative bg-poker-dark-800 bg-opacity-90 rounded-xl border-2 border-poker-accent-600 px-6 py-4 min-w-32">
            {/* Glow effect for large pots */}
            {pot >= 1000 && (
              <motion.div
                className="absolute inset-0 bg-gradient-radial from-poker-accent-500 via-transparent to-transparent opacity-30 rounded-xl"
                variants={glowVariants}
                animate="animate"
              />
            )}

            {/* Pot label */}
            <div className="text-center">
              <div className="text-poker-accent-300 text-xs font-medium uppercase tracking-wider mb-1">
                Main Pot
              </div>
              
              {/* Pot amount */}
              <motion.div
                className="text-white text-xl font-bold"
                animate={isAnimating ? {
                  scale: [1, 1.2, 1],
                  color: ['#ffffff', '#f59e0b', '#ffffff']
                } : {}}
                transition={{ duration: 0.5 }}
              >
                {formatPotAmount(pot)}
              </motion.div>
            </div>

            {/* Decorative chips around pot */}
            <div className="absolute -top-2 -left-2">
              <ChipStack amount={Math.min(pot * 0.1, 100)} size="small" animated={false} />
            </div>
            <div className="absolute -top-2 -right-2">
              <ChipStack amount={Math.min(pot * 0.15, 150)} size="small" animated={false} />
            </div>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <ChipStack amount={Math.min(pot * 0.2, 200)} size="small" animated={false} />
            </div>
          </div>

          {/* Animation effects */}
          <AnimatePresence>
            {isAnimating && (
              <motion.div
                className="absolute inset-0 border-2 border-poker-accent-400 rounded-xl"
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{ scale: 1.2, opacity: 0 }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 1 }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Side Pots */}
      <AnimatePresence>
        {sidePots && sidePots.length > 0 && (
          <motion.div
            className="flex flex-wrap justify-center gap-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5 }}
          >
            {sidePots.map((sidePot, index) => (
              <motion.div
                key={index}
                className="relative bg-poker-dark-700 bg-opacity-90 rounded-lg border border-poker-accent-500 px-4 py-2"
                variants={itemVariants}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-center">
                  <div className="text-poker-accent-400 text-xs font-medium mb-1">
                    Side Pot {index + 1}
                  </div>
                  <div className="text-white text-sm font-bold">
                    {formatPotAmount(sidePot.amount)}
                  </div>
                  <div className="text-poker-accent-400 text-xs mt-1">
                    {sidePot.eligiblePlayers.length} players
                  </div>
                </div>

                {/* Small chip decoration */}
                <div className="absolute -top-1 -right-1">
                  <ChipStack amount={Math.min(sidePot.amount * 0.1, 50)} size="small" animated={false} />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Total Pot (when there are side pots) */}
      {sidePots && sidePots.length > 0 && totalPot !== pot && (
        <motion.div
          className="text-center border-t border-poker-accent-600 pt-2"
          variants={itemVariants}
        >
          <div className="text-poker-accent-300 text-xs font-medium uppercase tracking-wider">
            Total Pot
          </div>
          <div className="text-poker-accent-100 text-lg font-bold">
            {formatPotAmount(totalPot)}
          </div>
        </motion.div>
      )}

      {/* Empty pot state */}
      {pot === 0 && (!sidePots || sidePots.length === 0) && (
        <motion.div
          className="text-center text-poker-accent-400"
          variants={itemVariants}
        >
          <div className="w-24 h-16 border-2 border-dashed border-poker-accent-600 rounded-lg flex items-center justify-center mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <div className="text-sm">No pot yet</div>
        </motion.div>
      )}

      {/* Winner announcement overlay */}
      <AnimatePresence>
        {/* This would be triggered by a prop for showing winners */}
        {false && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-green-600 text-white px-4 py-2 rounded-lg font-bold"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Winner!
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default PotDisplay