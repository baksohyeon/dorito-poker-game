<<<<<<< Updated upstream
import React, { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { socketService } from '../services/socketService'
import PokerTable from '../components/poker/PokerTable'
import LoadingScreen from '../components/ui/LoadingScreen'

const TablePage: React.FC = () => {
  const { tableId } = useParams<{ tableId: string }>()
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  
  const { currentTable, isJoining, error } = useSelector((state: RootState) => state.table)
  const { connectionStatus } = useSelector((state: RootState) => state.game)
  const { user } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    if (!tableId) {
      navigate('/lobby')
      return
    }

    // Ensure socket connection
    if (connectionStatus === 'disconnected') {
      socketService.connect().catch((error) => {
        console.error('Failed to connect to server:', error)
        navigate('/lobby')
      })
    }
  }, [tableId, connectionStatus, navigate])

  // Handle connection errors
  useEffect(() => {
    if (error) {
      console.error('Table error:', error)
      // Could show a notification here
    }
  }, [error])

  // Redirect if no table ID
  if (!tableId) {
    return <LoadingScreen message="Redirecting to lobby..." />
  }

  // Show loading while joining table
  if (isJoining) {
    return <LoadingScreen message="Joining table..." />
  }

  // Show connection status
  if (connectionStatus === 'connecting' || connectionStatus === 'reconnecting') {
    return <LoadingScreen message={`${connectionStatus}...`} />
  }

  if (connectionStatus === 'disconnected') {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">Connection Lost</div>
          <p className="text-poker-accent-300 mb-4">Unable to connect to the game server</p>
          <button
            onClick={() => navigate('/lobby')}
            className="bg-poker-accent-600 hover:bg-poker-accent-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Return to Lobby
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <PokerTable tableId={tableId} className="flex-1" />
    </div>
  )
}

export default TablePage
=======
import React from 'react';
import { useParams } from 'react-router-dom';

const TablePage: React.FC = () => {
  const { tableId } = useParams();

  return (
    <div className="min-h-screen bg-poker-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Poker Table {tableId}</h1>
        <p className="text-gray-300">Poker table interface coming soon...</p>
      </div>
    </div>
  );
};

export default TablePage; 
>>>>>>> Stashed changes
