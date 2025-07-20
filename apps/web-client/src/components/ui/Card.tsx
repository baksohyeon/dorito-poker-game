
// apps/web-client/src/components/ui/Card.tsx
import React from 'react';
import { clsx } from 'clsx';

interface CardProps {
  card: string; // e.g., "Ah", "Kd", "7c"
  size?: 'sm' | 'md' | 'lg';
  faceDown?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ card, size = 'md', faceDown = false, className }) => {
  const getCardDisplay = (cardCode: string) => {
    const rank = cardCode.charAt(0);
    const suit = cardCode.charAt(1);
    
    const rankMap: { [key: string]: string } = {
      'A': 'A',
      'K': 'K',
      'Q': 'Q',
      'J': 'J',
      'T': '10',
      '9': '9',
      '8': '8',
      '7': '7',
      '6': '6',
      '5': '5',
      '4': '4',
      '3': '3',
      '2': '2'
    };

    const suitMap: { [key: string]: string } = {
      'h': '♥',
      'd': '♦',
      'c': '♣',
      's': '♠'
    };

    return {
      rank: rankMap[rank] || rank,
      suit: suitMap[suit] || suit,
      isRed: suit === 'h' || suit === 'd'
    };
  };

  const sizeClasses = {
    sm: 'w-8 h-12 text-xs',
    md: 'w-12 h-16 text-sm',
    lg: 'w-16 h-24 text-lg'
  };

  const cardInfo = getCardDisplay(card);

  if (faceDown) {
    return (
      <div
        className={clsx(
          'bg-blue-800 border-2 border-white rounded shadow-lg flex items-center justify-center',
          sizeClasses[size],
          className
        )}
      >
        <div className="w-3/4 h-3/4 bg-blue-600 rounded border border-blue-400"></div>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        'bg-white border-2 border-gray-300 rounded shadow-lg flex flex-col items-center justify-center',
        sizeClasses[size],
        className
      )}
    >
      <div className={`font-bold ${cardInfo.isRed ? 'text-red-600' : 'text-black'}`}>
        {cardInfo.rank}
      </div>
      <div className={`text-xs ${cardInfo.isRed ? 'text-red-600' : 'text-black'}`}>
        {cardInfo.suit}
      </div>
    </div>
  );
};