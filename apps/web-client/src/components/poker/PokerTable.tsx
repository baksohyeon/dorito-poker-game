import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../../store'
import { socketService } from '../../services/socketService'
import { PlayerState, Card, GameState } from '../../types'
import PlayerSeat from './PlayerSeat'
import CommunityCards from './CommunityCards'
import PotDisplay from './PotDisplay'
import ActionButtons from './ActionButtons'
import ChatPanel from './ChatPanel'
import { motion, AnimatePresence } from 'framer-motion'

interface PokerTableProps {
  tableId: string
  className?: string
}

const PokerTable: React.FC<PokerTableProps> = ({ tableId, className = '' }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { gameState, isInGame, currentPlayerId, timeRemaining, validActions } = useSelector((state: RootState) => state.game)
  const { currentTable } = useSelector((state: RootState) => state.table)
  const { user } = useSelector((state: RootState) => state.auth)
  const { chatOpen, screenSize } = useSelector((state: RootState) => state.ui)
  
  const [tablePositions, setTablePositions] = useState<Array<{ x: number; y: number; rotation: number }>>([])
  const [highlightedAction, setHighlightedAction] = useState<string | null>(null)

  // Calculate player positions around the table
  useEffect(() => {
    if (currentTable) {
      const maxSeats = currentTable.maxPlayers
      const positions = []
      
      // Table dimensions
      const centerX = 400
      const centerY = 300
      const radiusX = 280
      const radiusY = 180
      
      for (let i = 0; i < maxSeats; i++) {
        const angle = (i / maxSeats) * 2 * Math.PI - Math.PI / 2 // Start from top
        const x = centerX + radiusX * Math.cos(angle)
        const y = centerY + radiusY * Math.sin(angle)
        const rotation = (angle * 180) / Math.PI + 90 // Face towards center
        
        positions.push({ x, y, rotation })
      }
      
      setTablePositions(positions)
    }
  }, [currentTable])

  // Highlight recent actions
  useEffect(() => {
    if (gameState?.lastAction) {
      setHighlightedAction(gameState.lastAction.playerId)
      const timer = setTimeout(() => setHighlightedAction(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [gameState?.lastAction])

  const getPlayersArray = (): (PlayerState | null)[] => {
    if (!gameState || !currentTable) return []
    
    const players: (PlayerState | null)[] = new Array(currentTable.maxPlayers).fill(null)
    
    if (gameState.players instanceof Map) {
      gameState.players.forEach((player) => {
        if (player.position >= 0 && player.position < players.length) {
          players[player.position] = player
        }
      })
    }
    
    return players
  }

  const isCurrentPlayer = (playerId: string): boolean => {
    return gameState?.currentPlayer === playerId
  }

  const getPlayerAction = (playerId: string): string | null => {
    if (gameState?.lastAction?.playerId === playerId) {
      return gameState.lastAction.type
    }
    return null
  }

  const handleJoinTable = () => {
    if (tableId && !isInGame) {
      socketService.joinTable(tableId)
    }
  }

  const handleLeaveTable = () => {
    socketService.leaveTable()
  }

  if (!currentTable) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-poker-accent-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-poker-accent-300">Loading table...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`poker-table-container ${className}`}>
      <div className="flex flex-col lg:flex-row h-full">
        {/* Main Table Area */}
        <div className="flex-1 relative">
          {/* Table Background */}
          <div className="absolute inset-0 table-felt rounded-2xl border-4 border-poker-accent-600">
            {/* Table felt texture overlay */}
            <div className="absolute inset-0 opacity-10 bg-gradient-radial from-green-400 via-green-600 to-green-800 rounded-2xl"></div>
          </div>

          {/* Table Content */}
          <div className="relative z-10 w-full h-full p-8">
            {/* Players positioned around the table */}
            <AnimatePresence>
              {getPlayersArray().map((player, position) => (
                <PlayerSeat
                  key={position}
                  player={player}
                  position={position}
                  style={{
                    position: 'absolute',
                    left: tablePositions[position]?.x - 60,
                    top: tablePositions[position]?.y - 40,
                    transform: `rotate(${tablePositions[position]?.rotation || 0}deg)`,
                  }}
                  isCurrentPlayer={player ? isCurrentPlayer(player.id) : false}
                  isCurrentUser={player?.id === user?.id}
                  isHighlighted={player?.id === highlightedAction}
                  lastAction={player ? getPlayerAction(player.id) : null}
                  timeRemaining={player?.id === gameState?.currentPlayer ? timeRemaining : 0}
                  onSeatClick={() => {
                    if (!player && !isInGame) {
                      // Try to join this specific seat
                      socketService.joinTable(tableId, position)
                    }
                  }}
                />
              ))}
            </AnimatePresence>

            {/* Center of table */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              {/* Community Cards */}
              <div className="mb-6">
                <CommunityCards 
                  cards={gameState?.communityCards || []}
                  phase={gameState?.phase || 'waiting'}
                />
              </div>

              {/* Pot Display */}
              <PotDisplay
                pot={gameState?.pot || 0}
                sidePots={gameState?.sidePots || []}
                isAnimating={false}
              />

              {/* Dealer Button */}
              {gameState && (
                <motion.div
                  className="absolute w-8 h-8 bg-white rounded-full border-2 border-poker-accent-600 flex items-center justify-center text-xs font-bold"
                  style={{
                    left: tablePositions[gameState.dealerPosition]?.x - 200 + 'px',
                    top: tablePositions[gameState.dealerPosition]?.y - 300 + 'px',
                  }}
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  D
                </motion.div>
              )}
            </div>

            {/* Table Info Overlay */}
            <div className="absolute top-4 left-4 bg-poker-dark-800 bg-opacity-90 rounded-lg p-4 text-white">
              <h3 className="font-bold text-lg mb-2">{currentTable.name}</h3>
              <div className="text-sm space-y-1">
                <p className="text-poker-accent-300">
                  Stakes: ${currentTable.blinds.small}/${currentTable.blinds.big}
                </p>
                <p className="text-poker-accent-300">
                  Players: {currentTable.playerCount}/{currentTable.maxPlayers}
                </p>
                <p className="text-poker-accent-300">
                  Game: {currentTable.gameType.replace('-', ' ').toUpperCase()}
                </p>
                {gameState && (
                  <p className="text-poker-accent-300 capitalize">
                    Phase: {gameState.phase}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isInGame && gameState?.currentPlayer === user?.id && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <ActionButtons
                  validActions={validActions}
                  currentBet={gameState.players instanceof Map ? 
                    gameState.players.get(user.id)?.currentBet || 0 : 0}
                  maxBet={user?.chips || 0}
                  callAmount={0} // Calculate from game state
                  minRaise={currentTable.blinds.big}
                  timeRemaining={timeRemaining}
                />
              </div>
            )}

            {/* Join/Leave Table Button */}
            {!isInGame && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <motion.button
                  onClick={handleJoinTable}
                  className="bg-poker-accent-600 hover:bg-poker-accent-700 text-white font-bold py-3 px-8 rounded-lg shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Join Table
                </motion.button>
              </div>
            )}

            {isInGame && (
              <div className="absolute top-4 right-4">
                <motion.button
                  onClick={handleLeaveTable}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Leave Table
                </motion.button>
              </div>
            )}

            {/* Game Status Messages */}
            {gameState && (
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
                <AnimatePresence>
                  {gameState.phase === 'waiting' && (
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      className="bg-poker-dark-800 bg-opacity-90 rounded-lg p-4 text-white"
                    >
                      <p className="text-center">Waiting for players...</p>
                    </motion.div>
                  )}

                  {gameState.phase === 'showdown' && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="bg-poker-dark-800 bg-opacity-90 rounded-lg p-4 text-white"
                    >
                      <p className="text-center font-bold">Showdown!</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Chat Panel (Desktop) */}
        {screenSize !== 'mobile' && chatOpen && (
          <div className="w-80 border-l border-poker-accent-600">
            <ChatPanel />
          </div>
        )}
      </div>

      {/* Mobile Chat Overlay */}
      {screenSize === 'mobile' && chatOpen && (
        <div className="fixed inset-x-4 bottom-4 top-20 z-50 bg-poker-dark-800 rounded-lg border border-poker-accent-600">
          <ChatPanel />
        </div>
      )}
    </div>
  )
}

export default PokerTable