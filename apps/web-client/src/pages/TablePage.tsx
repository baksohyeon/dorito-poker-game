import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { socketService } from '../services/socketService';
import PlayingCard from '../components/game/PlayingCard';
import ActionButtons from '../components/game/ActionButtons';
import PokerChip from '../components/game/PokerChip';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { formatChips } from '../utils/formatting';

const TablePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const gameState = useSelector((state: RootState) => state.game);
  const { user } = useSelector((state: RootState) => state.auth);
  const [isConnected, setIsConnected] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; username: string; message: string }>>([]);

  useEffect(() => {
    if (tableId) {
      socketService.joinTable(tableId);
      setIsConnected(true);
    }
    return () => {
      socketService.leaveTable();
    };
  }, [tableId]);

  // Action handlers
  const handlePlayerAction = (action: string, amount?: number) => {
    if (!gameState) return;

    console.log(`Player action: ${action}${amount ? ` (${amount})` : ''}`);

    // Update game state based on action
    // This part needs to be adapted to send actions to the backend
    // For now, it's a placeholder.
    // In a real scenario, you would dispatch an action to update the game state
    // and then send the action to the socket.
  };

  const handleSendChat = (message: string) => {
    if (!message.trim()) return;

    // This part needs to be adapted to send chat messages to the backend
    // For now, it's a placeholder.
    // In a real scenario, you would send the message to the socket.
    const newMessage = {
      id: Date.now().toString(),
      username: user?.username || 'Guest',
      message: message.trim()
    };
    setChatMessages(prev => [...prev, newMessage]);
    setChatInput('');
  };

  const handleLeaveTable = () => {
    // This part needs to be adapted to leave the table via the backend
    // For now, it's a placeholder.
    // In a real scenario, you would dispatch an action to leave the table
    // and then send a leave table event to the socket.
  };

  const getCurrentPlayer = () => {
    if (!gameState || !user) return null;
    const player = Array.from(gameState.players.values()).find(p => p.id === user.id);
    return player || null;
  };

  const getPlayerPosition = (position: number) => {
    // Calculate CSS position for player around the table
    const angle = (position / (gameState.tableConfig.maxPlayers || 9)) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  const getValidActions = () => {
    const currentPlayer = getCurrentPlayer();
    if (!currentPlayer || currentPlayer.status === 'folded') return [];

    const actions = ['fold'];
    
    if (gameState.minRaise === 0) {
      actions.push('check', 'bet');
    } else {
      actions.push('call', 'raise');
    }

    if (currentPlayer.chips <= gameState.minRaise) {
      actions.push('all-in');
    }

    return actions;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner w-12 h-12 mx-auto mb-4" />
          <p className="text-white text-lg">Connecting to table...</p>
          <p className="text-gray-400">Table {tableId}</p>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg mb-4">Loading table data...</p>
          <div className="loading-spinner w-8 h-8 mx-auto" />
        </div>
      </div>
    );
  }

  const currentPlayer = getCurrentPlayer();
  const isPlayerTurn = gameState.currentPlayer === user?.id;
  const isPlayerSeated = !!currentPlayer && currentPlayer.status !== 'sitting-out';
  const validActions = getValidActions();

  return (
    <div className="min-h-screen bg-poker-dark-900 relative overflow-hidden">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-poker-dark-800/95 backdrop-blur border-b border-gray-700">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveTable}
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Leave Table</span>
            </button>
            
            <div className="text-white">
              <span className="font-semibold">Table {tableId}</span>
              <span className="text-gray-400 ml-2">
                Hand #{gameState.handNumber} • {Array.from(gameState.players.values()).filter(p => p.status !== 'sitting-out').length}/{gameState.tableConfig.maxPlayers}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-300">
              Blinds: {formatChips(gameState.blinds.small)}/{formatChips(gameState.blinds.big)}
            </div>
            
            <button
              onClick={() => setGamePaused(!gamePaused)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {gamePaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
            </button>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
              title="Chat"
              onClick={() => setShowChat(!showChat)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="pt-16 h-screen flex">
        {/* Poker Table */}
        <div className="flex-1 relative">
          {/* Table Surface */}
          <div className="absolute inset-4 bg-gradient-to-br from-green-800 to-green-900 rounded-full shadow-2xl border-8 border-amber-600">
            {/* Community Cards Area */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="flex space-x-2 mb-4">
                {gameState.communityCards.map((card, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0, rotateY: 180 }}
                    animate={{ scale: 1, rotateY: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <PlayingCard 
                      card={card} 
                      size="lg"
                      className="shadow-lg"
                    />
                  </motion.div>
                ))}
                {/* Placeholder cards for unrevealed community cards */}
                {Array.from({ length: 5 - gameState.communityCards.length }, (_, index) => (
                  <div 
                    key={`placeholder-${index}`}
                    className="w-16 h-24 bg-gray-600 rounded-lg border-2 border-gray-500 opacity-30"
                  />
                ))}
              </div>
              
              {/* Pot Display */}
              <div className="text-center">
                <div className="bg-poker-dark-800/90 rounded-lg px-4 py-2 border border-gray-600">
                  <div className="flex items-center space-x-2">
                    <PokerChip value={100} size="small" />
                    <span className="text-white font-bold text-lg">
                      {formatChips(gameState.pot)}
                    </span>
                  </div>
                  {gameState.sidePots.length > 0 && (
                    <div className="text-xs text-gray-400 mt-1">
                      + {gameState.sidePots.length} side pot(s)
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Players around the table */}
            {Array.from(gameState.players.values()).map((player) => (
              <motion.div
                key={player.id}
                className="absolute"
                style={getPlayerPosition(player.position)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: player.position * 0.1 }}
              >
                <div className={`
                  relative bg-poker-dark-800 rounded-lg border-2 p-3 min-w-[120px]
                  ${player.id === gameState.currentPlayer ? 'border-poker-green-400 shadow-lg shadow-poker-green-400/50' : 'border-gray-600'}
                  ${player.id === user?.id ? 'ring-2 ring-blue-400' : ''}
                  ${player.status === 'folded' ? 'opacity-50' : ''}
                `}>
                  {/* Dealer Button */}
                  {player.isDealer && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center border-2 border-gray-800">
                      <span className="text-xs font-bold text-black">D</span>
                    </div>
                  )}
                  
                  {/* Blind indicators */}
                  {(player.isSmallBlind || player.isBigBlind) && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 bg-poker-gold-500 rounded-full flex items-center justify-center border-2 border-gray-800">
                      <span className="text-xs font-bold text-black">
                        {player.isSmallBlind ? 'SB' : 'BB'}
                      </span>
                    </div>
                  )}

                  {/* Player Info */}
                  <div className="text-center">
                    <div className="text-white font-semibold text-sm mb-1">
                      {player.name}
                      {player.id === user?.id && <span className="text-blue-400 ml-1">(You)</span>}
                    </div>
                    
                    <div className="text-poker-gold-400 font-mono text-sm mb-2">
                      {formatChips(player.chips)}
                    </div>

                    {/* Player cards */}
                    {player.cards && player.id === user?.id ? (
                      <div className="flex space-x-1 justify-center mb-2">
                        {player.cards.map((card, index) => (
                          <PlayingCard 
                            key={index}
                            card={card} 
                            size="sm"
                          />
                        ))}
                      </div>
                    ) : player.cards ? (
                      <div className="flex space-x-1 justify-center mb-2">
                        {player.cards.map((_, index) => (
                          <div 
                            key={index}
                            className="w-8 h-12 bg-blue-800 rounded border border-blue-600"
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="h-12 mb-2" />
                    )}

                    {/* Current bet */}
                    {player.currentBet > 0 && (
                      <div className="flex items-center justify-center space-x-1">
                        <PokerChip value={25} size="small" />
                        <span className="text-xs text-white">
                          {formatChips(player.currentBet)}
                        </span>
                      </div>
                    )}

                    {/* Last action */}
                    {player.status !== 'active' && (
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {player.status}
                      </div>
                    )}

                    {/* Turn timer */}
                    {player.id === gameState.currentPlayer && gameState.actionTimeLimit && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-poker-green-400 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${(gameState.actionTimeLimit / 30) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-white mt-1">
                          {gameState.actionTimeLimit}s
                        </div>
                      </div>
                    )}

                    {/* Fold indicator */}
                    {player.status === 'folded' && (
                      <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                        <span className="text-red-400 font-bold text-sm">FOLDED</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="w-80 bg-poker-dark-800 border-l border-gray-700 flex flex-col"
            >
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-white font-semibold">Table Chat</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <span className="text-poker-green-400 font-semibold">
                      {msg.username}:
                    </span>
                    <span className="text-gray-300 ml-2">{msg.message}</span>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat(chatInput)}
                    placeholder="Type a message..."
                    className="flex-1 poker-input text-sm"
                    maxLength={100}
                  />
                  <button
                    onClick={() => handleSendChat(chatInput)}
                    disabled={!chatInput.trim()}
                    className="poker-button poker-button-primary text-sm px-3"
                  >
                    Send
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Buttons */}
      {isPlayerSeated && isPlayerTurn && validActions.length > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <ActionButtons
            validActions={validActions}
            currentBet={gameState.minRaise}
            minRaise={gameState.minRaise}
            maxRaise={gameState.minRaise * 4}
            playerChips={currentPlayer?.chips || 0}
            onAction={handlePlayerAction}
            disabled={gamePaused}
          />
        </div>
      )}

      {/* Game Stage Indicator */}
      <div className="absolute top-20 left-6 z-20">
        <div className="bg-poker-dark-800/90 backdrop-blur rounded-lg px-4 py-2 border border-gray-600">
          <div className="text-white font-semibold capitalize">
            {gameState.phase === 'preflop' ? 'Waiting for players' : gameState.phase}
          </div>
          {gameState.phase !== 'preflop' && (
            <div className="text-gray-400 text-sm">
              {Array.from(gameState.players.values()).filter(p => p.status === 'active').length} active players
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TablePage;