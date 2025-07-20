import React from 'react';
import { motion } from 'framer-motion';

interface PokerChipProps {
  value?: number;
  count?: number;
  size?: 'small' | 'medium' | 'large' | 'xs' | 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
  animationDelay?: number;
  color?: string;
}

const PokerChip: React.FC<PokerChipProps> = ({
  value,
  count = 1,
  size = 'medium',
  className = '',
  onClick,
  animationDelay = 0,
}) => {
  const getChipColor = (value?: number) => {
    if (!value) return 'bg-gradient-to-br from-gray-500 to-gray-700 border-gray-400';
    if (value >= 1000000) return 'bg-gradient-to-br from-purple-500 to-purple-700 border-purple-400';
    if (value >= 100000) return 'bg-gradient-to-br from-orange-500 to-orange-700 border-orange-400';
    if (value >= 25000) return 'bg-gradient-to-br from-pink-500 to-pink-700 border-pink-400';
    if (value >= 5000) return 'bg-gradient-to-br from-yellow-400 to-yellow-600 border-yellow-300';
    if (value >= 1000) return 'bg-gradient-to-br from-green-500 to-green-700 border-green-400';
    if (value >= 500) return 'bg-gradient-to-br from-purple-400 to-purple-600 border-purple-300';
    if (value >= 100) return 'bg-gradient-to-br from-gray-800 to-black border-gray-600';
    if (value >= 25) return 'bg-gradient-to-br from-green-400 to-green-600 border-green-300';
    if (value >= 10) return 'bg-gradient-to-br from-blue-500 to-blue-700 border-blue-400';
    if (value >= 5) return 'bg-gradient-to-br from-red-500 to-red-700 border-red-400';
    return 'bg-gradient-to-br from-white to-gray-200 border-gray-300 text-black';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
      case 'sm':
        return 'w-6 h-6 text-xs';
      case 'large':
      case 'lg':
        return 'w-12 h-12 text-lg';
      case 'xs':
        return 'w-4 h-4 text-xs';
      case 'medium':
      default:
        return 'w-8 h-8 text-xs';
    }
  };

  const formatValue = (value?: number) => {
    if (!value) return '';
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const renderChipStack = () => {
    const stackHeight = Math.min(count, 10); // Max visual stack of 10
    const chips = [];

    for (let i = 0; i < stackHeight; i++) {
      chips.push(
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            delay: animationDelay + (i * 0.05),
            type: 'spring',
            stiffness: 200,
          }}
          className={`
            absolute poker-chip border-2 ${getChipColor(value)} ${getSizeClasses()}
            ${onClick ? 'cursor-pointer hover:scale-110' : ''}
          `}
          style={{
            bottom: `${i * 2}px`,
            zIndex: stackHeight - i,
          }}
          whileHover={onClick ? { scale: 1.1, y: -2 } : undefined}
          whileTap={onClick ? { scale: 0.95 } : undefined}
          onClick={onClick}
        >
          <div className="flex items-center justify-center w-full h-full">
            <span className="font-bold text-shadow">
              {formatValue(value)}
            </span>
          </div>
        </motion.div>
      );
    }

    return chips;
  };

  return (
    <div className={`relative ${className}`} style={{ height: `${Math.min(count, 10) * 2 + 32}px` }}>
      {renderChipStack()}
      {count > 10 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: animationDelay + 0.5 }}
          className="absolute -top-2 -right-2 bg-poker-gold-500 text-black rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
        >
          {count > 99 ? '99+' : count}
        </motion.div>
      )}
    </div>
  );
};

export default PokerChip; 