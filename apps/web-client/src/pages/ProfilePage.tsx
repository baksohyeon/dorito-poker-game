<<<<<<< Updated upstream
import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth)

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Player Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Info */}
        <div className="lg:col-span-1">
          <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
            <div className="text-center">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-24 h-24 rounded-full border-4 border-poker-accent-600 mx-auto mb-4"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-poker-accent-600 flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-2xl">
                    {user?.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              
              <h2 className="text-white text-xl font-bold">{user?.username}</h2>
              <p className="text-poker-accent-300">Level {user?.level || 1}</p>
              
              <div className="mt-4 pt-4 border-t border-poker-accent-600">
                <div className="flex justify-between mb-2">
                  <span className="text-poker-accent-300">Chips:</span>
                  <span className="text-white font-medium">{user?.chips?.toLocaleString() || '0'}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-poker-accent-300">Games Played:</span>
                  <span className="text-white">{user?.gamesPlayed || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-poker-accent-300">Games Won:</span>
                  <span className="text-white">{user?.gamesWon || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="lg:col-span-2">
          <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
            <h3 className="text-white text-lg font-bold mb-4">Statistics</h3>
            <p className="text-poker-accent-400">Detailed statistics will be implemented here</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage
=======
import React from 'react';

const ProfilePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-poker-dark-900 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">User Profile</h1>
        <p className="text-gray-300">Profile management coming soon...</p>
      </div>
    </div>
  );
};

export default ProfilePage; 
>>>>>>> Stashed changes
