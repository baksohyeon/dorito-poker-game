import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { logout } from '../../store/slices/authSlice'
import { toggleSidebar, openModal } from '../../store/slices/uiSlice'

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { user } = useSelector((state: RootState) => state.auth)
  const { sidebarOpen, screenSize } = useSelector((state: RootState) => state.ui)
  const { connectionStatus } = useSelector((state: RootState) => state.game)

  const handleLogout = () => {
    dispatch(logout())
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  const handleSettingsClick = () => {
    navigate('/settings')
  }

  const handleMenuToggle = () => {
    dispatch(toggleSidebar())
  }

  return (
    <nav className="bg-poker-dark-800 border-b border-poker-accent-600 px-4 py-3 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center space-x-4">
        {/* Menu toggle for mobile */}
        {screenSize === 'mobile' && (
          <button
            onClick={handleMenuToggle}
            className="text-poker-accent-300 hover:text-white p-2 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        {/* Logo */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-poker-accent-400 to-poker-accent-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">♠</span>
          </div>
          <span className="text-white font-bold text-xl hidden sm:block">PokerDoritos</span>
        </div>
      </div>

      {/* Center - Connection status */}
      <div className="flex items-center space-x-2">
        {connectionStatus !== 'connected' && (
          <div className="flex items-center space-x-2 text-yellow-400 text-sm">
            <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse"></div>
            <span className="hidden sm:inline">
              {connectionStatus === 'connecting' && 'Connecting...'}
              {connectionStatus === 'reconnecting' && 'Reconnecting...'}
              {connectionStatus === 'disconnected' && 'Disconnected'}
            </span>
          </div>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center space-x-3">
        {/* User chips */}
        {user && (
          <div className="hidden sm:flex items-center space-x-2 text-poker-accent-300">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4zM18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" />
            </svg>
            <span className="font-medium">{user.chips.toLocaleString()}</span>
          </div>
        )}

        {/* User menu */}
        <div className="relative group">
          <button className="flex items-center space-x-2 text-white hover:text-poker-accent-300 transition-colors">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.username}
                className="w-8 h-8 rounded-full border-2 border-poker-accent-600"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-poker-accent-600 flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="hidden md:block font-medium">{user?.username}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          <div className="absolute right-0 mt-2 w-48 bg-poker-dark-700 rounded-lg shadow-lg border border-poker-accent-600 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
            <div className="py-2">
              <button
                onClick={handleProfileClick}
                className="w-full text-left px-4 py-2 text-poker-accent-300 hover:text-white hover:bg-poker-dark-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </button>

              <button
                onClick={handleSettingsClick}
                className="w-full text-left px-4 py-2 text-poker-accent-300 hover:text-white hover:bg-poker-dark-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Settings</span>
              </button>

              <div className="border-t border-poker-accent-600 my-2"></div>

              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-red-400 hover:text-red-300 hover:bg-poker-dark-600 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar