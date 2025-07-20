import React, { useState } from 'react';
import { Calculator, Info } from 'lucide-react';

interface PotOddsCalculatorProps {
  pot: number;
  callAmount: number;
  isOpen: boolean;
  onClose: () => void;
}

export const PotOddsCalculator: React.FC<PotOddsCalculatorProps> = ({
  pot,
  callAmount,
  isOpen,
  onClose
}) => {
  const [outs, setOuts] = useState(0);
  const [showInfo, setShowInfo] = useState(false);

  if (!isOpen) return null;

  // Calculate pot odds
  const potOdds = callAmount > 0 ? (pot / callAmount) : 0;
  const potOddsPercentage = callAmount > 0 ? (callAmount / (pot + callAmount)) * 100 : 0;

  // Calculate drawing odds (simplified)
  const calculateDrawingOdds = (outsCount: number, isFlop: boolean) => {
    if (outsCount === 0) return 0;
    
    // Simplified calculation - in reality this is more complex
    const cardsLeft = isFlop ? 47 : 46; // 52 - 5 community - your 2 cards
    const probability = (outsCount * 4) / cardsLeft; // Rough approximation
    return Math.min(probability * 100, 100);
  };

  const flopOdds = calculateDrawingOdds(outs, true);
  const turnOdds = calculateDrawingOdds(outs, false);

  const isProfitableCall = flopOdds > potOddsPercentage;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <Calculator className="h-5 w-5 mr-2" />
            Pot Odds Calculator
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Pot Info */}
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Current Situation</div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <div className="text-xs text-gray-400">Pot Size</div>
                <div className="font-bold">{pot.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">To Call</div>
                <div className="font-bold">{callAmount.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Pot Odds */}
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-2">Pot Odds</div>
            <div className="grid grid-cols-2 gap-4 text-white">
              <div>
                <div className="text-xs text-gray-400">Ratio</div>
                <div className="font-bold">{potOdds.toFixed(2)}:1</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Percentage</div>
                <div className="font-bold">{potOddsPercentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>

          {/* Outs Input */}
          <div className="bg-gray-700 p-3 rounded-lg">
            <div className="text-sm text-gray-300 mb-2 flex items-center">
              Number of Outs
              <button
                onClick={() => setShowInfo(!showInfo)}
                className="ml-2 text-blue-400 hover:text-blue-300"
                title="Show outs information"
              >
                <Info className="h-4 w-4" />
              </button>
            </div>
            <input
              type="number"
              value={outs}
              onChange={(e) => setOuts(Math.max(0, parseInt(e.target.value) || 0))}
              min="0"
              max="21"
              className="w-full bg-gray-600 text-white px-3 py-2 rounded border border-gray-500 focus:ring-2 focus:ring-poker-green focus:border-transparent"
              placeholder="Enter number of outs"
            />
            
            {showInfo && (
              <div className="mt-2 text-xs text-gray-400 bg-gray-600 p-2 rounded">
                <div className="font-medium mb-1">Common Outs:</div>
                <div>• Flush draw: 9 outs</div>
                <div>• Open-ended straight: 8 outs</div>
                <div>• Overcards: 6 outs</div>
                <div>• Gutshot straight: 4 outs</div>
              </div>
            )}
          </div>

          {/* Drawing Odds */}
          {outs > 0 && (
            <div className="bg-gray-700 p-3 rounded-lg">
              <div className="text-sm text-gray-300 mb-2">Drawing Odds</div>
              <div className="grid grid-cols-2 gap-4 text-white">
                <div>
                  <div className="text-xs text-gray-400">Flop to Turn</div>
                  <div className="font-bold">{flopOdds.toFixed(1)}%</div>
                </div>
                <div>
                  <div className="text-xs text-gray-400">Turn to River</div>
                  <div className="font-bold">{turnOdds.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          <div className={`p-3 rounded-lg ${
            isProfitableCall ? 'bg-green-900 bg-opacity-50' : 'bg-red-900 bg-opacity-50'
          }`}>
            <div className="text-sm font-medium text-white">
              Recommendation: {isProfitableCall ? 'CALL' : 'FOLD'}
            </div>
            <div className="text-xs text-gray-300 mt-1">
              {isProfitableCall 
                ? `Your drawing odds (${flopOdds.toFixed(1)}%) are better than pot odds (${potOddsPercentage.toFixed(1)}%)`
                : `Pot odds (${potOddsPercentage.toFixed(1)}%) are better than your drawing odds (${flopOdds.toFixed(1)}%)`
              }
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
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