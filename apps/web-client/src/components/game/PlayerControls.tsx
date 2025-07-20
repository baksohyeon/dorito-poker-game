import React, { useState, useEffect } from 'react';
import { Minus, Plus, DollarSign, Clock, AlertTriangle, Calculator } from 'lucide-react';
import { useGame } from '../../hooks/useGame';
import { GameState, PlayerState } from '@poker-game/shared';
import { PotOddsCalculator } from './PotOddsCalculator';

interface PlayerControlsProps {
  tableId: string;
}

export const PlayerControls: React.FC<PlayerControlsProps> = ({ tableId }) => {
  const {
    gameState,
    currentPlayerId,
    actionTimeRemaining,
    fold,
    check,
    call,
    bet,
    raise,
    allIn
  } = useGame(tableId);

  const [betAmount, setBetAmount] = useState(0);
  const [isAllIn, setIsAllIn] = useState(false);
  const [showPotOdds, setShowPotOdds] = useState(false);

  // Reset bet amount when game state changes
  useEffect(() => {
    setBetAmount(0);
    setIsAllIn(false);
  }, [gameState?.phase, gameState?.currentPlayer]);

  if (!gameState || !currentPlayerId) return null;

  const currentPlayer = gameState.players.get(currentPlayerId);
  if (!currentPlayer) return null;

  const isMyTurn = gameState.currentPlayer === currentPlayerId;
  const playerChips = currentPlayer.chips;
  const currentBet = currentPlayer.currentBet;
  const totalBet = currentPlayer.totalBet;
  
  // Calculate betting limits
  const minBet = gameState.blinds.big;
  const maxBet = playerChips;
  const callAmount = Math.max(0, totalBet - currentBet);
  const raiseAmount = Math.max(minBet, callAmount + minBet);

  const handleBetChange = (amount: number) => {
    const newAmount = Math.max(0, Math.min(maxBet, amount));
    setBetAmount(newAmount);
    setIsAllIn(newAmount === maxBet);
  };

  const handleAction = (action: string) => {
    if (!isMyTurn) return;

    switch (action) {
      case 'fold':
        fold();
        break;
      case 'check':
        check();
        break;
      case 'call':
        call();
        break;
      case 'bet':
        if (betAmount > 0) {
          bet(betAmount);
        }
        break;
      case 'raise':
        if (betAmount > 0) {
          raise(betAmount);
        }
        break;
      case 'all-in':
        allIn();
        break;
    }
  };

  const getValidActions = () => {
    if (!isMyTurn) return { canFold: false, canCheck: false, canCall: false, canBet: false, canRaise: false };

    const canFold = true;
    const canCheck = callAmount === 0;
    const canCall = callAmount > 0 && callAmount <= playerChips;
    const canBet = callAmount === 0 && playerChips > 0;
    const canRaise = callAmount > 0 && playerChips > callAmount;

    return { canFold, canCheck, canCall, canBet, canRaise };
  };

  const validActions = getValidActions();
  const quickBetAmounts = [minBet, minBet * 2, minBet * 4, maxBet].filter(amount => amount <= maxBet);

  return (
    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-90 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Player Info and Timer */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-6">
            <div className="text-white">
              <div className="text-sm text-gray-300">Your Chips</div>
              <div className="text-xl font-bold">{playerChips.toLocaleString()}</div>
            </div>
            <div className="text-white">
              <div className="text-sm text-gray-300">Current Bet</div>
              <div className="text-xl font-bold">{currentBet.toLocaleString()}</div>
            </div>
            {callAmount > 0 && (
              <div className="text-white">
                <div className="text-sm text-gray-300">To Call</div>
                <div className="text-xl font-bold text-yellow-400">{callAmount.toLocaleString()}</div>
              </div>
            )}
            {callAmount > 0 && (
              <button
                onClick={() => setShowPotOdds(true)}
                className="text-blue-400 hover:text-blue-300 transition-colors"
                title="Calculate pot odds"
              >
                <Calculator className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Action Timer */}
          {isMyTurn && actionTimeRemaining > 0 && (
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
              actionTimeRemaining <= 10 ? 'bg-red-600' : 'bg-gray-700'
            }`}>
              <Clock className="h-4 w-4 text-white" />
              <span className="text-white font-bold">{actionTimeRemaining}s</span>
              {actionTimeRemaining <= 10 && <AlertTriangle className="h-4 w-4 text-white" />}
            </div>
          )}
        </div>

        {/* Betting Controls */}
        {isMyTurn && (validActions.canBet || validActions.canRaise) && (
          <>
            <div className="flex items-center space-x-4 mb-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-white mb-2">
                  {validActions.canRaise ? 'Raise Amount' : 'Bet Amount'}
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleBetChange(betAmount - minBet)}
                    disabled={betAmount <= 0}
                    className="w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Decrease bet amount"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-1 relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => handleBetChange(parseInt(e.target.value) || 0)}
                      min={validActions.canRaise ? raiseAmount : minBet}
                      max={maxBet}
                      className="w-full pl-10 pr-4 py-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:ring-2 focus:ring-poker-green focus:border-transparent"
                      placeholder={validActions.canRaise ? raiseAmount.toString() : minBet.toString()}
                    />
                  </div>
                  
                  <button
                    onClick={() => handleBetChange(betAmount + minBet)}
                    disabled={betAmount >= maxBet}
                    className="w-10 h-10 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    title="Increase bet amount"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Bet Buttons */}
            <div className="flex space-x-2 mb-6">
              {quickBetAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => handleBetChange(amount)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    betAmount === amount
                      ? 'bg-poker-green text-white'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {amount === maxBet ? 'All In' : amount.toLocaleString()}
                </button>
              ))}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => handleAction('fold')}
            disabled={!isMyTurn || !validActions.canFold}
            className="bg-red-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Fold
          </button>
          
          <button
            onClick={() => handleAction(validActions.canCall ? 'call' : 'check')}
            disabled={!isMyTurn || (!validActions.canCheck && !validActions.canCall)}
            className="bg-gray-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {validActions.canCall ? `Call ${callAmount.toLocaleString()}` : 'Check'}
          </button>
          
          <button
            onClick={() => handleAction(validActions.canRaise ? 'raise' : 'bet')}
            disabled={!isMyTurn || (!validActions.canBet && !validActions.canRaise) || betAmount === 0}
            className="bg-poker-green text-white py-3 px-6 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAllIn ? 'All In' : validActions.canRaise ? `Raise ${betAmount.toLocaleString()}` : `Bet ${betAmount.toLocaleString()}`}
          </button>
        </div>

        {/* All In Button (separate) */}
        {isMyTurn && playerChips > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => handleAction('all-in')}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors"
            >
              ALL IN ({playerChips.toLocaleString()})
            </button>
          </div>
        )}

        {/* Turn Indicator */}
        {!isMyTurn && (
          <div className="mt-4 text-center">
            <div className="bg-gray-700 text-white px-4 py-2 rounded-lg">
              Waiting for other players...
            </div>
          </div>
        )}
      </div>

      {/* Pot Odds Calculator */}
      <PotOddsCalculator
        pot={gameState.pot}
        callAmount={callAmount}
        isOpen={showPotOdds}
        onClose={() => setShowPotOdds(false)}
      />
    </div>
  );
}; 