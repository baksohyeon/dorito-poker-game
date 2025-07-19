import React from 'react'
import { motion } from 'framer-motion'

interface ChipStackProps {
  amount: number
  size?: 'small' | 'medium' | 'large'
  animated?: boolean
  onClick?: () => void
  className?: string
}

const ChipStack: React.FC<ChipStackProps> = ({
  amount,
  size = 'medium',
  animated = true,
  onClick,
  className = '',
}) => {
  const getChipColor = (value: number) => {
    if (value >= 1000000) return { bg: 'bg-purple-600', border: 'border-purple-400', text: 'text-white' }
    if (value >= 100000) return { bg: 'bg-orange-600', border: 'border-orange-400', text: 'text-white' }
    if (value >= 10000) return { bg: 'bg-yellow-600', border: 'border-yellow-400', text: 'text-black' }
    if (value >= 1000) return { bg: 'bg-pink-600', border: 'border-pink-400', text: 'text-white' }
    if (value >= 100) return { bg: 'bg-black', border: 'border-gray-400', text: 'text-white' }
    if (value >= 25) return { bg: 'bg-green-600', border: 'border-green-400', text: 'text-white' }
    if (value >= 5) return { bg: 'bg-red-600', border: 'border-red-400', text: 'text-white' }
    return { bg: 'bg-white', border: 'border-gray-300', text: 'text-black' }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return { chip: 'w-6 h-6 text-xs', stack: 'space-y-0.5' }
      case 'large':
        return { chip: 'w-12 h-12 text-lg', stack: 'space-y-1' }
      case 'medium':
      default:
        return { chip: 'w-8 h-8 text-sm', stack: 'space-y-0.5' }
    }
  }

  const getChipStacks = (amount: number) => {
    const denominations = [1000000, 100000, 10000, 1000, 100, 25, 5, 1]
    const stacks: Array<{ value: number; count: number; color: any }> = []
    let remaining = amount

    for (const denom of denominations) {
      if (remaining >= denom) {
        const count = Math.floor(remaining / denom)
        if (count > 0) {
          stacks.push({
            value: denom,
            count: Math.min(count, 10), // Max 10 chips per stack for visual clarity
            color: getChipColor(denom)
          })
          remaining -= count * denom
        }
      }
    }

    return stacks.length > 0 ? stacks : [{ value: 0, count: 1, color: getChipColor(0) }]
  }

  const chipStacks = getChipStacks(amount)
  const sizeClasses = getSizeClasses()

  const formatAmount = (amount: number) => {
    if (amount >= 1000000) return `${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `${(amount / 1000).toFixed(1)}K`
    return amount.toString()
  }

  return (
    <motion.div
      className={`relative flex items-end space-x-1 ${className}`}
      onClick={onClick}
      initial={animated ? { opacity: 0, scale: 0.8 } : {}}
      animate={animated ? { opacity: 1, scale: 1 } : {}}
      transition={animated ? { type: "spring", stiffness: 300, damping: 20 } : {}}
      whileHover={onClick ? { scale: 1.05 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
    >
      {chipStacks.map((stack, stackIndex) => (
        <div key={`${stack.value}-${stackIndex}`} className={`flex flex-col-reverse ${sizeClasses.stack}`}>
          {Array.from({ length: stack.count }, (_, chipIndex) => (
            <motion.div
              key={chipIndex}
              className={`
                ${sizeClasses.chip} 
                ${stack.color.bg} 
                ${stack.color.border} 
                ${stack.color.text}
                border-2 rounded-full flex items-center justify-center font-bold
                shadow-lg relative overflow-hidden cursor-pointer
              `}
              initial={animated ? { 
                y: -20, 
                opacity: 0,
                rotate: Math.random() * 360
              } : {}}
              animate={animated ? { 
                y: 0, 
                opacity: 1,
                rotate: 0
              } : {}}
              transition={animated ? { 
                delay: stackIndex * 0.1 + chipIndex * 0.05,
                type: "spring",
                stiffness: 400,
                damping: 15
              } : {}}
              whileHover={{ z: 10, scale: 1.1 }}
            >
              {/* Chip face design */}
              <div className="absolute inset-0 flex items-center justify-center">
                {/* Center circle */}
                <div className="w-1/2 h-1/2 border border-current rounded-full opacity-30" />
                
                {/* Outer ring pattern */}
                <div className="absolute inset-1 border border-current rounded-full opacity-20" />
                
                {/* Value display (only on top chip of each stack) */}
                {chipIndex === stack.count - 1 && stack.value >= 5 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`font-bold ${size === 'small' ? 'text-xs' : 'text-xs'}`}>
                      {stack.value >= 1000 ? `${stack.value / 1000}K` : stack.value}
                    </span>
                  </div>
                )}
              </div>

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white to-transparent opacity-20 rounded-full" />
              
              {/* Edge highlight */}
              <div className="absolute inset-0 border border-white rounded-full opacity-10" />
            </motion.div>
          ))}
        </div>
      ))}

      {/* Amount display */}
      <motion.div
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-poker-dark-800 bg-opacity-90 text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap"
        initial={animated ? { opacity: 0, y: 10 } : {}}
        animate={animated ? { opacity: 1, y: 0 } : {}}
        transition={animated ? { delay: 0.5 } : {}}
      >
        ${formatAmount(amount)}
      </motion.div>

      {/* Glow effect for large amounts */}
      {amount >= 10000 && (
        <motion.div
          className="absolute inset-0 bg-gradient-radial from-yellow-400 via-transparent to-transparent opacity-20 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  )
}

export default ChipStack