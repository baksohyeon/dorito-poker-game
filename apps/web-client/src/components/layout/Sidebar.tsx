import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { RootState, AppDispatch } from '../../store'
import { setSidebarOpen } from '../../store/slices/uiSlice'

const Sidebar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const location = useLocation()
  const { sidebarOpen, screenSize } = useSelector((state: RootState) => state.ui)
  const { user } = useSelector((state: RootState) => state.auth)
  const { currentTable } = useSelector((state: RootState) => state.table)
  const { tables, activeGames, playersOnline } = useSelector((state: RootState) => state.lobby)

  const navigationItems = [
    {
      id: 'lobby',
      label: 'Lobby',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      path: '/lobby',
      badge: tables.filter(t => t.status === 'waiting').length,
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      path: '/profile',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      path: '/settings',
    },
  ]

  const handleNavigation = (path: string) => {
    navigate(path)
    if (screenSize === 'mobile') {
      dispatch(setSidebarOpen(false))
    }
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  if (!sidebarOpen && screenSize !== 'mobile') {
    return null
  }

  return (
    <>
      {/* Mobile backdrop */}
      {screenSize === 'mobile' && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-poker-dark-700 border-r border-poker-accent-600 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${screenSize === 'mobile' ? 'top-16' : 'top-0'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* User info section */}
          <div className="p-4 border-b border-poker-accent-600">
            <div className="flex items-center space-x-3">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-10 h-10 rounded-full border-2 border-poker-accent-600"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-poker-accent-600 flex items-center justify-center">
                  <span className="text-white font-bold">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium truncate">{user?.username}</p>
                <p className="text-poker-accent-300 text-sm">Level {user?.level || 1}</p>
              </div>
            </div>

            {/* Chips display */}
            <div className="mt-3 flex items-center justify-between">
              <span className="text-poker-accent-300 text-sm">Chips:</span>
              <span className="text-poker-accent-100 font-medium">
                {user?.chips?.toLocaleString() || '0'}
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.path)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors
                      ${isActive(item.path)
                        ? 'bg-poker-accent-600 text-white'
                        : 'text-poker-accent-300 hover:text-white hover:bg-poker-dark-600'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-poker-accent-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Current table info */}
          {currentTable && (
            <div className="p-4 border-t border-poker-accent-600">
              <h3 className="text-white font-medium mb-2">Current Table</h3>
              <div className="bg-poker-dark-600 rounded-lg p-3">
                <p className="text-white font-medium truncate">{currentTable.name}</p>
                <p className="text-poker-accent-300 text-sm">
                  {currentTable.playerCount}/{currentTable.maxPlayers} players
                </p>
                <p className="text-poker-accent-300 text-sm">
                  ${currentTable.blinds.small}/${currentTable.blinds.big}
                </p>
                <button
                  onClick={() => handleNavigation(`/table/${currentTable.id}`)}
                  className="w-full mt-2 bg-poker-accent-600 hover:bg-poker-accent-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  Return to Table
                </button>
              </div>
            </div>
          )}

          {/* Stats section */}
          <div className="p-4 border-t border-poker-accent-600">
            <h3 className="text-white font-medium mb-2">Online Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-poker-accent-300">Active Games:</span>
                <span className="text-white">{activeGames}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-poker-accent-300">Players Online:</span>
                <span className="text-white">{playersOnline}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-poker-accent-300">Available Tables:</span>
                <span className="text-white">{tables.filter(t => t.status === 'waiting').length}</span>
              </div>
            </div>
          </div>

          {/* Version info */}
          <div className="p-4 border-t border-poker-accent-600">
            <p className="text-poker-accent-400 text-xs text-center">
              PokerDoritos v1.0.0
            </p>
          </div>
        </div>
      </aside>
    </>
  )
}

export default Sidebar