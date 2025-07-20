import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Settings, Volume2, VolumeX, History } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';
import { useGame } from '../hooks/useGame';
import { PokerTable } from '../components/game/PokerTable';
import { GameChat } from '../components/game/GameChat';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { PlayerControls } from '../components/game/PlayerControls';
import { GameSettings } from '../components/game/GameSettings';
import { HandHistory } from '../components/game/HandHistory';

export const GamePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector(state => state.auth);
  const { isLoading, error } = useAppSelector((state: any) => state.game);
  const [showSettings, setShowSettings] = useState(false);
  const [showHandHistory, setShowHandHistory] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  // Use the game hook for connection and state management
  const {
    isConnected,
    gameState,
    currentPlayerId,
    connectToTable,
    disconnectFromTable
  } = useGame(tableId!);

  useEffect(() => {
    if (!tableId) {
      toast.error('Invalid table ID');
      navigate('/lobby');
      return;
    }

    if (!user?.id) {
      toast.error('You must be logged in to join a game');
      navigate('/login');
      return;
    }

    // Connect to the game table
    const joinTable = async () => {
      const success = await connectToTable();
      if (!success) {
        navigate('/lobby');
      }
    };

    joinTable();

    // Cleanup on unmount
    return () => {
      disconnectFromTable();
    };
  }, [tableId, user, navigate, connectToTable, disconnectFromTable]);

  // Handle connection errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleLeaveTable = () => {
    disconnectFromTable();
    toast.success('Left table successfully');
    navigate('/lobby');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-white text-lg">Connecting to game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900">
      {/* Header */}
      <div className="bg-black bg-opacity-50 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleLeaveTable}
              className="flex items-center space-x-2 hover:text-green-400 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Leave Table</span>
            </button>
            <div className="border-l border-gray-600 h-6"></div>
            <div>
              <h1 className="text-lg font-semibold">Table #{tableId}</h1>
              <p className="text-sm text-gray-300">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowHandHistory(!showHandHistory)}
              className="hover:text-green-400 transition-colors"
              title="Hand History"
            >
              <History className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              className="hover:text-green-400 transition-colors"
            >
              {isSoundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="hover:text-green-400 transition-colors"
              title="Game Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Game Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Main Game Area */}
        <div className="flex-1 relative">
          <PokerTable 
            gameState={gameState} 
            currentPlayerId={currentPlayerId}
          />
          <PlayerControls tableId={tableId!} />
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-black bg-opacity-30 border-l border-gray-700">
          <GameChat tableId={tableId!} />
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <GameSettings
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          isSoundEnabled={isSoundEnabled}
          onSoundToggle={setIsSoundEnabled}
        />
      )}

      {/* Hand History Modal */}
      <HandHistory
        history={[]} // TODO: Get from game state
        isOpen={showHandHistory}
        onClose={() => setShowHandHistory(false)}
      />
    </div>
  );
}; 