import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from './store'
import LoginPage from './pages/LoginPage'

// Simple placeholder component for lobby
const LobbyPage = () => (
  <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
    <div className="bg-poker-dark-800 p-8 rounded-lg">
      <h1 className="text-2xl font-bold text-poker-accent-500 mb-4">Poker Lobby</h1>
      <p className="text-white">Lobby Page - Coming Soon</p>
    </div>
  </div>
)

const App: React.FC = () => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div className="app">
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <LoginPage /> : <Navigate to="/lobby" replace />} 
        />
        <Route 
          path="/lobby" 
          element={isAuthenticated ? <LobbyPage /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/lobby" : "/login"} replace />} 
        />
      </Routes>
    </div>
  )
}

export default App
