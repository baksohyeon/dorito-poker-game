import React from 'react';
import { Card } from '../ui/Card';
import { HandResult } from '@poker-game/shared';

interface HandHistoryItem {
  id: string;
  timestamp: number;
  type: 'potWon' | 'handDealt' | 'gameEnded';
  data: any;
}

interface HandHistoryProps {
  history: HandHistoryItem[];
  isOpen: boolean;
  onClose: () => void;
}

export const HandHistory: React.FC<HandHistoryProps> = ({ history, isOpen, onClose }) => {
  if (!isOpen) return null;

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getHandDescription = (handResult: HandResult) => {
    return handResult.description || handResult.type.replace('-', ' ').toUpperCase();
  };

  const renderHistoryItem = (item: HandHistoryItem) => {
    switch (item.type) {
      case 'potWon':
        return (
          <div key={item.id} className="bg-green-900 bg-opacity-50 p-3 rounded-lg mb-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-400 font-medium">
                {item.data.winnerName} won {item.data.amount.toLocaleString()} chips!
              </span>
              <span className="text-gray-400 text-sm">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
            {item.data.handResult && (
              <div className="flex items-center space-x-2">
                <span className="text-white text-sm">
                  {getHandDescription(item.data.handResult)}
                </span>
                <div className="flex space-x-1">
                  {item.data.handResult.cards?.map((card: any, index: number) => (
                    <Card 
                      key={index} 
                      card={`${card.rank}${card.suit.charAt(0)}`} 
                      size="sm" 
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'handDealt':
        return (
          <div key={item.id} className="bg-blue-900 bg-opacity-50 p-3 rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <span className="text-blue-400">
                New hand dealt
              </span>
              <span className="text-gray-400 text-sm">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
          </div>
        );

      case 'gameEnded':
        return (
          <div key={item.id} className="bg-purple-900 bg-opacity-50 p-3 rounded-lg mb-2">
            <div className="flex items-center justify-between">
              <span className="text-purple-400">
                Game ended - {item.data.reason}
              </span>
              <span className="text-gray-400 text-sm">
                {formatTimestamp(item.timestamp)}
              </span>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Hand History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto max-h-[60vh] space-y-2">
          {history.length === 0 ? (
            <div className="text-gray-400 text-center py-8">
              No hand history available
            </div>
          ) : (
            history.map(renderHistoryItem)
          )}
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="bg-poker-green text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}; 