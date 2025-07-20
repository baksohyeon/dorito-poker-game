import React from 'react';
import { Card } from '../ui/Card';

interface Player {
  id: string;
  username: string;
  chips: number;
  position: number;
  isDealer: boolean;
  cards?: string[];
  bet?: number;
  isActive?: boolean;
  isFolded?: boolean;
}

interface PlayerSeatProps {
  player: Player;
  isCurrentPlayer: boolean;
  isMyPlayer?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({ player, isCurrentPlayer, isMyPlayer = false }) => {
  const { username, chips, bet, cards, isDealer, isActive, isFolded } = player;

  return (
    <div className={`relative ${isFolded ? 'opacity-50' : ''}`}>
      {/* Player Avatar */}
      <div className={`w-16 h-16 rounded-full border-4 ${
        isMyPlayer 
          ? 'border-blue-400 bg-blue-100' 
          : isCurrentPlayer 
            ? 'border-yellow-400 bg-yellow-100' 
            : isActive 
              ? 'border-green-400 bg-green-100'
              : 'border-gray-400 bg-gray-100'
      } flex items-center justify-center shadow-lg`}>
        <span className="text-lg font-bold text-gray-800">
          {username.charAt(0).toUpperCase()}
        </span>
      </div>

      {/* Dealer Button */}
      {isDealer && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full border-2 border-gray-800 flex items-center justify-center">
          <span className="text-xs font-bold text-gray-800">D</span>
        </div>
      )}

      {/* Player Info */}
      <div className="mt-2 text-center">
        <div className="text-sm font-medium text-white drop-shadow-lg">
          {username}
          {isMyPlayer && <span className="ml-1 text-blue-400">(You)</span>}
        </div>
        <div className="text-xs text-green-200">
          {chips.toLocaleString()} chips
        </div>
        {bet && bet > 0 && (
          <div className="text-xs text-yellow-300 font-medium">
            Bet: {bet.toLocaleString()}
          </div>
        )}
      </div>

      {/* Player Cards */}
      {cards && cards.length > 0 && (
        <div className="mt-2 flex justify-center space-x-1">
          {cards.map((card, index) => (
            <Card 
              key={index} 
              card={card} 
              size="sm" 
              faceDown={!isMyPlayer && isActive}
            />
          ))}
        </div>
      )}

      {/* Folded Indicator */}
      {isFolded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
            FOLDED
          </div>
        </div>
      )}

      {/* Current Player Indicator */}
      {isCurrentPlayer && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold">
            {isMyPlayer ? 'YOUR TURN' : 'THINKING...'}
          </div>
        </div>
      )}

      {/* My Player Indicator */}
      {isMyPlayer && !isCurrentPlayer && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="bg-blue-400 text-white px-3 py-1 rounded-full text-xs font-bold">
            YOU
          </div>
        </div>
      )}
    </div>
  );
}; 