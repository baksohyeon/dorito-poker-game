import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

interface ActionButtonsProps {
  validActions: string[];
  currentBet: number;
  minRaise: number;
  maxRaise: number;
  playerChips: number;
  onAction: (action: string, amount?: number) => void;
  disabled?: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  validActions,
  currentBet,
  minRaise,
  maxRaise,
  playerChips,
  onAction,
  disabled = false,
}) => {
  const [betAmount, setBetAmount] = useState(minRaise);
  const [showBetSlider, setShowBetSlider] = useState(false);

  const handleBetChange = (value: number) => {
    setBetAmount(Math.max(minRaise, Math.min(maxRaise, value)));
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'fold':
        return 'Fold';
      case 'check':
        return 'Check';
      case 'call':
        return `Call ${currentBet}`;
      case 'bet':
        return 'Bet';
      case 'raise':
        return 'Raise';
      case 'all-in':
        return 'All In';
      default:
        return action;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'fold':
        return 'poker-button-danger';
      case 'check':
      case 'call':
        return 'poker-button-secondary';
      case 'bet':
      case 'raise':
      case 'all-in':
        return 'poker-button-primary';
      default:
        return 'poker-button-secondary';
    }
  };

  const handleAction = (action: string) => {
    if (action === 'bet' || action === 'raise') {
      if (showBetSlider) {
        onAction(action, betAmount);
        setShowBetSlider(false);
      } else {
        setShowBetSlider(true);
      }
    } else {
      onAction(action, action === 'call' ? currentBet : undefined);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-poker-dark-800 rounded-lg p-4 border border-gray-700"
    >
      {/* Bet Amount Slider */}
      {showBetSlider && (validActions.includes('bet') || validActions.includes('raise')) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-3 bg-poker-dark-700 rounded-lg"
        >
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-sm text-gray-300">Amount:</span>
            <span className="text-lg font-bold text-white">{betAmount}</span>
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleBetChange(betAmount - 10)}
              className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
              disabled={betAmount <= minRaise}
              aria-label="Decrease bet amount"
            >
              <Minus className="w-4 h-4" />
            </button>
            
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              value={betAmount}
              onChange={(e) => handleBetChange(parseInt(e.target.value))}
              className="flex-1 h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
              aria-label="Bet amount slider"
            />
            
            <button
              onClick={() => handleBetChange(betAmount + 10)}
              className="w-8 h-8 rounded bg-gray-600 hover:bg-gray-500 flex items-center justify-center"
              disabled={betAmount >= maxRaise}
              aria-label="Increase bet amount"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>Min: {minRaise}</span>
            <span>Max: {maxRaise}</span>
          </div>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={() => handleBetChange(minRaise)}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
            >
              Min
            </button>
            <button
              onClick={() => handleBetChange(Math.floor(maxRaise / 2))}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
            >
              1/2 Pot
            </button>
            <button
              onClick={() => handleBetChange(Math.floor(maxRaise * 0.75))}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
            >
              3/4 Pot
            </button>
            <button
              onClick={() => handleBetChange(maxRaise)}
              className="px-3 py-1 text-xs bg-gray-600 hover:bg-gray-500 rounded"
            >
              All In
            </button>
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {validActions.map((action) => (
          <motion.button
            key={action}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAction(action)}
            disabled={disabled}
            className={`
              poker-button ${getActionColor(action)} 
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              flex-1 min-w-[80px]
            `}
          >
            {getActionLabel(action)}
          </motion.button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex justify-between text-xs text-gray-400 mt-2">
        <span>Chips: {playerChips}</span>
        {currentBet > 0 && <span>To call: {currentBet}</span>}
      </div>
    </motion.div>
  );
};

export default ActionButtons; 