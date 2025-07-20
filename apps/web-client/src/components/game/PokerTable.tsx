import React from 'react';
import { Card } from '../ui/Card';
import { PlayerSeat } from './PlayerSeat';
import { GameState } from '@poker-game/shared';

interface PokerTableProps {
  gameState: GameState | null;
  currentPlayerId: string | null;
}

export const PokerTable: React.FC<PokerTableProps> = ({ gameState, currentPlayerId }) => {
  if (!gameState) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-white text-lg">Loading table...</div>
      </div>
    );
  }

  const { players, pot, communityCards, phase, currentPlayer, blinds } = gameState;

  // Convert Map to array for easier iteration
  const playersArray = Array.from(players.values());

  // Position players around the table
  const getPlayerPosition = (position: number) => {
    const positions = [
      { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }, // Center (dealer)
      { top: '10%', left: '50%', transform: 'translate(-50%, 0)' }, // Top
      { top: '20%', right: '10%' }, // Top right
      { bottom: '20%', right: '10%' }, // Bottom right
      { bottom: '10%', left: '50%', transform: 'translate(-50%, 0)' }, // Bottom
      { bottom: '20%', left: '10%' }, // Bottom left
      { top: '20%', left: '10%' }, // Top left
    ];
    return positions[position] || positions[0];
  };

  // Convert Card objects to string format for display
  const cardToString = (card: any) => {
    const rankMap: { [key: string]: string } = {
      'A': 'A', 'K': 'K', 'Q': 'Q', 'J': 'J', 'T': 'T',
      '10': 'T', '9': '9', '8': '8', '7': '7', '6': '6',
      '5': '5', '4': '4', '3': '3', '2': '2'
    };
    
    const suitMap: { [key: string]: string } = {
      'hearts': 'h', 'diamonds': 'd', 'clubs': 'c', 'spades': 's'
    };

    const rank = rankMap[card.rank] || card.rank;
    const suit = suitMap[card.suit] || card.suit;
    
    return `${rank}${suit}`;
  };

  const communityCardsStrings = communityCards.map(cardToString);

  return (
    <div className="relative w-full h-full bg-green-800 rounded-full border-8 border-brown-600 flex items-center justify-center">
      {/* Table felt texture */}
      <div className="absolute inset-0 bg-green-700 opacity-50 rounded-full"></div>
      
      {/* Blinds Info */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black bg-opacity-70 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400">SB:</span>
            <span>{blinds.small}</span>
            <span className="text-yellow-400">BB:</span>
            <span>{blinds.big}</span>
          </div>
        </div>
      </div>

      {/* Pot */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <div className="bg-yellow-400 rounded-full p-4 text-center shadow-lg">
          <div className="text-sm font-bold text-gray-800">Pot</div>
          <div className="text-lg font-bold text-gray-800">{pot.toLocaleString()}</div>
        </div>
      </div>

      {/* Community Cards */}
      {communityCardsStrings.length > 0 && (
        <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 z-10">
          <div className="flex space-x-2">
            {communityCardsStrings.map((card, index) => (
              <Card key={index} card={card} size="md" />
            ))}
          </div>
        </div>
      )}

      {/* Game Phase Indicator */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg">
          <span className="text-sm font-medium capitalize">{phase}</span>
        </div>
      </div>

      {/* Current Player Indicator */}
      {currentPlayer && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-yellow-400 text-gray-800 px-3 py-1 rounded-lg text-sm font-bold">
            {players.get(currentPlayer)?.name || 'Unknown'}'s Turn
          </div>
        </div>
      )}

      {/* Player Seats */}
      {playersArray.map((player) => (
        <div
          key={player.id}
          className="absolute z-20"
          style={getPlayerPosition(player.position)}
        >
          <PlayerSeat
            player={{
              id: player.id,
              username: player.name,
              chips: player.chips,
              position: player.position,
              isDealer: player.isDealer,
              cards: player.cards.map(cardToString),
              bet: player.currentBet,
              isActive: player.status === 'active',
              isFolded: player.status === 'folded'
            }}
            isCurrentPlayer={player.id === currentPlayer}
            isMyPlayer={player.id === currentPlayerId}
          />
        </div>
      ))}

      {/* Table Border Decoration */}
      <div className="absolute inset-0 rounded-full border-4 border-yellow-600 opacity-30"></div>
      <div className="absolute inset-4 rounded-full border-2 border-yellow-400 opacity-20"></div>
    </div>
  );
}; 