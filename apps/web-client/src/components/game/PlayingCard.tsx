import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@shared/types/game.types';
import { Spade, Heart, Diamond, Club } from 'lucide-react';

interface PlayingCardProps {
  card?: Card | string;
  faceDown?: boolean;
  size?: 'small' | 'medium' | 'large' | 'sm' | 'lg';
  className?: string;
  onClick?: () => void;
  animationDelay?: number;
}

const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  faceDown = false,
  size = 'medium',
  className = '',
  onClick,
  animationDelay = 0,
}) => {
  const getSuitIcon = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return <Heart className="w-full h-full" fill="currentColor" />;
      case 'diamonds':
        return <Diamond className="w-full h-full" fill="currentColor" />;
      case 'clubs':
        return <Club className="w-full h-full" fill="currentColor" />;
      case 'spades':
        return <Spade className="w-full h-full" fill="currentColor" />;
      default:
        return null;
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'card-suit-red' : 'card-suit-black';
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
      case 'sm':
        return 'w-10 h-14 text-sm';
      case 'large':
      case 'lg':
        return 'w-16 h-22 text-xl';
      case 'medium':
      default:
        return 'w-12 h-16 text-lg';
    }
  };

  const cardContent = () => {
    if (faceDown || !card) {
      return (
        <div className="poker-card-back w-full h-full flex items-center justify-center">
          <div className="text-white opacity-50 text-xs">♠♥♦♣</div>
        </div>
      );
    }

    // Handle string card format (e.g., "AS", "KH")
    let cardData: { rank: string; suit: string };
    if (typeof card === 'string') {
      const rank = card[0];
      const suitCode = card[1];
      const suitMap: { [key: string]: string } = {
        'S': 'spades',
        'H': 'hearts',
        'D': 'diamonds',
        'C': 'clubs'
      };
      cardData = { rank, suit: suitMap[suitCode] || 'spades' };
    } else {
      cardData = card;
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-between p-1 bg-white text-black">
        {/* Top rank and suit */}
        <div className={`flex flex-col items-center ${getSuitColor(cardData.suit)}`}>
          <span className="text-xs font-bold leading-none">{cardData.rank}</span>
          <div className="w-2 h-2">
            {getSuitIcon(cardData.suit)}
          </div>
        </div>

        {/* Center suit */}
        <div className={`w-4 h-4 ${getSuitColor(cardData.suit)}`}>
          {getSuitIcon(cardData.suit)}
        </div>

        {/* Bottom rank and suit (rotated) */}
        <div className={`flex flex-col items-center transform rotate-180 ${getSuitColor(cardData.suit)}`}>
          <span className="text-xs font-bold leading-none">{cardData.rank}</span>
          <div className="w-2 h-2">
            {getSuitIcon(cardData.suit)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, rotateY: 180 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{
        duration: 0.6,
        delay: animationDelay,
        type: 'spring',
        stiffness: 100,
      }}
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      className={`
        poker-card ${getSizeClasses()} cursor-pointer
        ${onClick ? 'hover:shadow-lg' : ''}
        ${className}
      `}
      onClick={onClick}
    >
      {cardContent()}
    </motion.div>
  );
};

export default PlayingCard; 