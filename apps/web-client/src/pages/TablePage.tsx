import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  connectToTable, 
  setMyCards, 
  setCanAct, 
  setBettingOptions,
  processPlayerAction,
  resetForNewHand,
  addToPot,
  updatePlayerChips
} from '../store/slices/gameSlice';
import PlayingCard from '../components/game/PlayingCard';
import PokerChip from '../components/game/PokerChip';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, MessageCircle } from 'lucide-react';
import { formatChips } from '../utils/formatting';
import { Card } from '@poker-game/shared';
import { toggleSound } from '../store/slices/uiSlice';

const TablePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.game);
  const { user } = useSelector((state: RootState) => state.auth);
  const { soundEnabled } = useSelector((state: RootState) => state.ui);
  
  const [isConnected, setIsConnected] = useState(false);
  const [gamePaused, setGamePaused] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; username: string; message: string; timestamp: number }>>([]);
  const [myCards, setMyCardsLocal] = useState<any[]>([]);
  const [actionTimer, setActionTimer] = useState<number | null>(null);

  useEffect(() => {
    if (tableId) {
      // Connect to table and initialize game state
      dispatch(connectToTable({ tableId, sessionId: `session_${tableId}_${Date.now()}` }));
      
      // Simulate joining table (in real app, this would be via API)
      setTimeout(() => {
        setIsConnected(true);
        
        // Mock initial game state
        const mockCards: Card[] = [
          { suit: 'hearts' as const, rank: 'A' as const, value: 14 },
          { suit: 'spades' as const, rank: 'K' as const, value: 13 }
        ];
        setMyCardsLocal(mockCards);
        dispatch(setMyCards(mockCards));
        
        // Mock player can act
        dispatch(setCanAct(true));
        dispatch(setBettingOptions({
          canFold: true,
          canCheck: true,
          canCall: false,
          canBet: true,
          canRaise: false,
          minBet: 10,
          maxRaise: 200,
          callAmount: 0
        }));
      }, 1500);
    }
    
    return () => {
      // Clean up connection
      setIsConnected(false);
    };
  }, [tableId, dispatch]);

  // Action timer effect
  useEffect(() => {
    if (gameState.canAct && gameState.currentPlayer === user?.id) {
      setActionTimer(30);
      const timer = setInterval(() => {
        setActionTimer(prev => {
          if (prev === null || prev <= 1) {
            // Auto-fold on timeout
            handlePlayerAction('fold');
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    } else {
      setActionTimer(null);
    }
  }, [gameState.canAct, gameState.currentPlayer, user?.id]);

  // Action handlers
  const handlePlayerAction = (action: string, amount?: number) => {
    if (!gameState.canAct) return;

    console.log(`Player action: ${action}${amount ? ` (${amount})` : ''}`);

    const playerAction = {
      type: action as 'fold' | 'check' | 'call' | 'bet' | 'raise' | 'all-in',
      playerId: user?.id || 'guest',
      amount,
      timestamp: Date.now()
    };

    // Update local game state
    dispatch(processPlayerAction(playerAction));
    
    // Update pot if betting
    if (amount && (action === 'bet' || action === 'call' || action === 'raise')) {
      dispatch(addToPot(amount));
      dispatch(updatePlayerChips({ 
        playerId: user?.id || 'guest', 
        chips: (gameState.players[user?.id || 'guest']?.chips || 0) - amount,
        currentBet: amount
      }));
    }
    
    // Reset action state
    dispatch(setCanAct(false));
    setActionTimer(null);
    
    // In real app, send action to backend
    // socketService.sendAction(playerAction);
  };

  const handleSendChat = (message: string) => {
    if (!message.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      username: user?.username || 'Guest',
      message: message.trim(),
      timestamp: Date.now()
    };
    setChatMessages(prev => [...prev, newMessage].slice(-50)); // Keep last 50 messages
    setChatInput('');
    
    // In real app, send to backend
    // socketService.sendChatMessage(newMessage);
  };

  const handleLeaveTable = () => {
    if (window.confirm('Are you sure you want to leave this table?')) {
      // Clean up game state
      dispatch(resetForNewHand());
      setIsConnected(false);
      
      // Navigate back to tables
      navigate('/tables');
      
      // In real app, notify backend
      // socketService.leaveTable();
    }
  };


  const getPlayerPosition = (position: number, totalPlayers: number = 6) => {
    // Calculate CSS position for player around the table
    const angle = (position / totalPlayers) * 2 * Math.PI - Math.PI / 2;
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
    if (!gameState.canAct) return [];
    
    return ['fold', 'check', 'bet', 'call', 'raise', 'all-in'].filter(action => {
      // Filter based on betting options
      return gameState.validActions.includes(action);
    });
  };

  const getMockPlayers = () => {
    // Mock players for demonstration
    const mockPlayers = [
      {
        id: user?.id || 'guest',
        name: user?.username || 'You',
        chips: 1000,
        currentBet: 0,
        status: 'active',
        position: 1,
        cards: myCards,
        isDealer: false,
        isSmallBlind: true,
        isBigBlind: false
      },
      {
        id: 'player2',
        name: 'Alice',
        chips: 850,
        currentBet: 10,
        status: 'active',
        position: 2,
        cards: [{ suit: 'hidden' as const, rank: 'hidden' as const, value: 0 }, { suit: 'hidden' as const, rank: 'hidden' as const, value: 0 }],
        isDealer: true,
        isSmallBlind: false,
        isBigBlind: false
      },
      {
        id: 'player3',
        name: 'Bob',
        chips: 1200,
        currentBet: 20,
        status: 'active',
        position: 3,
        cards: [{ suit: 'hidden' as const, rank: 'hidden' as const, value: 0 }, { suit: 'hidden' as const, rank: 'hidden' as const, value: 0 }],
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: true
      },
      {
        id: 'player4',
        name: 'Charlie',
        chips: 750,
        currentBet: 0,
        status: 'folded',
        position: 4,
        cards: null,
        isDealer: false,
        isSmallBlind: false,
        isBigBlind: false
      }
    ];
    
    return mockPlayers;
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
                Hand #{gameState.handNumber} • {Object.values(gameState.players).filter(p => p.status !== 'sitting-out').length}/{gameState.tableConfig.maxPlayers}
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
              onClick={() => dispatch(toggleSound())}
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
                {/* Mock community cards */}
                {[
                  { suit: 'hearts' as const, rank: 'A' as const, value: 14 },
                  { suit: 'diamonds' as const, rank: 'K' as const, value: 13 },
                  { suit: 'clubs' as const, rank: 'Q' as const, value: 12 }
                ].map((card, index) => (
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
                {/* Placeholder cards for turn and river */}
                {Array.from({ length: 2 }, (_, index) => (
                  <div 
                    key={`placeholder-${index}`}
                    className="w-16 h-24 bg-gray-600 rounded-lg border-2 border-gray-500 opacity-30"
                  />
                ))}
              </div>
              
              {/* Pot Display */}
              <div className="text-center">
                <div className="bg-gray-800/90 rounded-lg px-4 py-2 border border-gray-600">
                  <div className="flex items-center space-x-2">
                    <PokerChip value={100} size="small" />
                    <span className="text-white font-bold text-lg">
                      {formatChips(gameState.pot || 150)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Players around the table */}
            {getMockPlayers().map((player) => (
              <motion.div
                key={player.id}
                className="absolute"
                style={getPlayerPosition(player.position, 6)}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: player.position * 0.1 }}
              >
                <div className={`
                  relative bg-gray-800 rounded-lg border-2 p-3 min-w-[120px]
                  ${gameState.canAct && player.id === user?.id ? 'border-green-400 shadow-lg shadow-green-400/50' : 'border-gray-600'}
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
                    {player.id === user?.id && actionTimer !== null && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-green-400 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${(actionTimer / 30) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-white mt-1">
                          {actionTimer}s
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
      {gameState.canAct && getValidActions().length > 0 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <div className="bg-gray-800/95 backdrop-blur rounded-lg border border-gray-600 p-4">
            <div className="flex space-x-3">
              {getValidActions().map((action) => (
                <button
                  key={action}
                  onClick={() => handlePlayerAction(action, action === 'bet' ? 20 : undefined)}
                  disabled={gamePaused}
                  className={`
                    px-6 py-3 rounded-lg font-bold text-white transition-all duration-200 capitalize
                    ${action === 'fold' ? 'bg-red-600 hover:bg-red-700' : 
                      action === 'call' ? 'bg-blue-600 hover:bg-blue-700' :
                      'bg-green-600 hover:bg-green-700'}
                    ${gamePaused ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                  `}
                >
                  {action} {action === 'call' ? '($20)' : action === 'bet' ? '($20)' : ''}
                </button>
              ))}
            </div>
            
            {/* Action Timer Display */}
            {actionTimer !== null && (
              <div className="mt-3 text-center">
                <div className="text-sm text-gray-400">Time remaining</div>
                <div className="text-2xl font-bold text-white">
                  {actionTimer}s
                </div>
                <div className="w-full bg-gray-600 rounded-full h-1 mt-1">
                  <div 
                    className="bg-green-400 h-1 rounded-full transition-all duration-1000"
                    style={{ width: `${(actionTimer / 30) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Stage Indicator */}
      <div className="absolute top-20 left-6 z-20">
        <div className="bg-gray-800/90 backdrop-blur rounded-lg px-4 py-2 border border-gray-600">
          <div className="text-white font-semibold capitalize">
            {gameState.phase || 'Flop'}
          </div>
          <div className="text-gray-400 text-sm">
            {getMockPlayers().filter(p => p.status === 'active').length} active players
          </div>
        </div>
      </div>
    </div>
  );
};

export default TablePage;