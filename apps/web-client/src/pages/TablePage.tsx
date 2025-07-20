import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Users, 
  Settings, 
  MessageCircle, 
  Volume2, 
  VolumeX,
  Crown,
  Timer,
  DollarSign,
  Shuffle,
  Eye,
  EyeOff
} from 'lucide-react';
import { RootState } from '../store';
import { socketService } from '../services/socketService';
import PlayingCard from '../components/game/PlayingCard';
import PokerChip from '../components/game/PokerChip';
import ActionButtons from '../components/game/ActionButtons';
import { formatChips } from '../utils/formatting';

interface Player {
  id: string;
  username: string;
  chips: number;
  position: number;
  isActive: boolean;
  holeCards?: string[];
  currentBet: number;
  lastAction?: 'fold' | 'call' | 'raise' | 'check' | 'bet';
  timeLeft?: number;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isSittingOut: boolean;
  avatar?: string;
}

interface GameState {
  id: string;
  stage: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown' | 'waiting';
  pot: number;
  sidePots: Array<{ amount: number; eligiblePlayers: string[] }>;
  communityCards: string[];
  currentPlayer?: string;
  minimumBet: number;
  bigBlind: number;
  smallBlind: number;
  dealerPosition: number;
  players: Player[];
  maxPlayers: number;
  handNumber: number;
  isTableFull: boolean;
}

const TablePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ id: string; username: string; message: string; timestamp: number }>>([]);
  const [chatInput, setChatInput] = useState('');
  const [showChat, setShowChat] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [spectatorMode, setSpectatorMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Socket connection and event handlers
  useEffect(() => {
    if (!tableId || !isAuthenticated) return;

    const connectToTable = async () => {
      try {
        setLoading(true);
        
        // Connect to socket service
        await socketService.connect();
        
        // Join the specific table room
        socketService.joinTable(tableId, undefined, spectatorMode);
        
        setIsConnected(true);
      } catch (err) {
        setError('Failed to connect to table');
        console.error('Table connection error:', err);
      } finally {
        setLoading(false);
      }
    };

    connectToTable();

    // Set up socket event listeners
    const handleGameStateUpdate = (newGameState: GameState) => {
      setGameState(newGameState);
    };

    const handlePlayerJoined = (data: { player: Player }) => {
      // Handle player joining
      if (soundEnabled) {
        // Play join sound
      }
    };

    const handlePlayerLeft = (data: { playerId: string }) => {
      // Handle player leaving
      if (soundEnabled) {
        // Play leave sound
      }
    };

    const handleChatMessage = (message: { id: string; username: string; message: string; timestamp: number }) => {
      setChatMessages(prev => [...prev, message]);
    };

    const handleActionRequired = (data: { playerId: string; timeLimit: number; possibleActions: string[] }) => {
      if (data.playerId === user?.id) {
        // Highlight action buttons and start timer
        if (soundEnabled) {
          // Play action sound
        }
      }
    };

    const handleTableError = (error: { message: string }) => {
      setError(error.message);
    };

    // Register socket listeners
    socketService.on('game-state-update', handleGameStateUpdate);
    socketService.on('player-joined', handlePlayerJoined);
    socketService.on('player-left', handlePlayerLeft);
    socketService.on('chat-message', handleChatMessage);
    socketService.on('action-required', handleActionRequired);
    socketService.on('table-error', handleTableError);

    return () => {
      // Cleanup socket listeners
      socketService.off('game-state-update', handleGameStateUpdate);
      socketService.off('player-joined', handlePlayerJoined);
      socketService.off('player-left', handlePlayerLeft);
      socketService.off('chat-message', handleChatMessage);
      socketService.off('action-required', handleActionRequired);
      socketService.off('table-error', handleTableError);
      
      // Leave table room
      if (tableId) {
        socketService.leaveTable();
      }
      
      socketService.disconnect();
    };
  }, [tableId, isAuthenticated, user?.id, spectatorMode, soundEnabled]);

  // Action handlers
  const handlePlayerAction = useCallback((action: string, amount?: number) => {
    if (!gameState || !user) return;

    socketService.playerAction(action, amount);
  }, [tableId, gameState, user]);

  const handleSendChat = useCallback(() => {
    if (!chatInput.trim() || !user) return;

    socketService.sendChatMessage(chatInput.trim());
    setChatInput('');
  }, [chatInput, user]);

  const handleLeaveTable = useCallback(() => {
    if (gameState && user) {
      socketService.leaveTable();
    }
    navigate('/lobby');
  }, [gameState, user, navigate]);

  const getCurrentPlayer = () => {
    return gameState?.players.find(p => p.id === user?.id);
  };

  const getPlayerPosition = (position: number) => {
    // Calculate CSS position for player around the table
    const angle = (position / (gameState?.maxPlayers || 9)) * 2 * Math.PI - Math.PI / 2;
    const radius = 200;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      left: `calc(50% + ${x}px)`,
      top: `calc(50% + ${y}px)`,
      transform: 'translate(-50%, -50%)'
    };
  };

  if (loading) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 mb-4">
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/lobby')}
              className="poker-button poker-button-secondary"
            >
              Return to Lobby
            </button>
          </div>
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
  const isPlayerSeated = !!currentPlayer && !currentPlayer.isSittingOut;

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
                Hand #{gameState.handNumber} • {gameState.players.filter(p => !p.isSittingOut).length}/{gameState.maxPlayers}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-sm text-gray-300">
              Blinds: {formatChips(gameState.smallBlind)}/{formatChips(gameState.bigBlind)}
            </div>
            
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="text-gray-300 hover:text-white transition-colors"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            
            <button
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
                    <PokerChip color="gold" size="sm" />
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
            {gameState.players.map((player) => (
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
                      {player.username}
                      {player.id === user?.id && <span className="text-blue-400 ml-1">(You)</span>}
                    </div>
                    
                    <div className="text-poker-gold-400 font-mono text-sm mb-2">
                      {formatChips(player.chips)}
                    </div>

                    {/* Player cards */}
                    {player.holeCards && player.id === user?.id ? (
                      <div className="flex space-x-1 justify-center mb-2">
                        {player.holeCards.map((card, index) => (
                          <PlayingCard 
                            key={index}
                            card={card} 
                            size="sm"
                          />
                        ))}
                      </div>
                    ) : player.holeCards ? (
                      <div className="flex space-x-1 justify-center mb-2">
                        {player.holeCards.map((_, index) => (
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
                        <PokerChip color="red" size="xs" />
                        <span className="text-xs text-white">
                          {formatChips(player.currentBet)}
                        </span>
                      </div>
                    )}

                    {/* Last action */}
                    {player.lastAction && (
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {player.lastAction}
                      </div>
                    )}

                    {/* Turn timer */}
                    {player.id === gameState.currentPlayer && player.timeLeft && (
                      <div className="mt-1">
                        <div className="w-full bg-gray-600 rounded-full h-1">
                          <div 
                            className="bg-poker-green-400 h-1 rounded-full transition-all duration-1000"
                            style={{ width: `${(player.timeLeft / 30) * 100}%` }}
                          />
                        </div>
                        <div className="text-xs text-white mt-1">
                          {player.timeLeft}s
                        </div>
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
                    onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                    placeholder="Type a message..."
                    className="flex-1 poker-input text-sm"
                    maxLength={100}
                  />
                  <button
                    onClick={handleSendChat}
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
      {isPlayerSeated && isPlayerTurn && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
          <ActionButtons
            gameState={gameState}
            currentPlayer={currentPlayer}
            onAction={handlePlayerAction}
          />
        </div>
      )}

      {/* Game Stage Indicator */}
      <div className="absolute top-20 left-6 z-20">
        <div className="bg-poker-dark-800/90 backdrop-blur rounded-lg px-4 py-2 border border-gray-600">
          <div className="text-white font-semibold capitalize">
            {gameState.stage === 'waiting' ? 'Waiting for players' : gameState.stage}
          </div>
          {gameState.stage !== 'waiting' && (
            <div className="text-gray-400 text-sm">
              {gameState.players.filter(p => p.isActive && !p.isSittingOut).length} active players
            </div>
          )}
        </div>
      </div>

      {/* Spectator Mode Indicator */}
      {spectatorMode && (
        <div className="absolute top-20 right-6 z-20">
          <div className="bg-blue-600/90 backdrop-blur rounded-lg px-4 py-2 border border-blue-500">
            <div className="flex items-center space-x-2 text-white">
              <Eye className="w-4 h-4" />
              <span className="font-semibold">Spectating</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TablePage;