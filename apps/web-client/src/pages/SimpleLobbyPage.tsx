import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../store/hooks';
import { RootState } from '../store';
import { fetchTables } from '../store/slices/tableSlice';

const SimpleLobbyPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { availableTables, loading, error } = useSelector((state: RootState) => state.table);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    dispatch(fetchTables());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading tables...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-poker-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">Error loading tables</div>
          <div className="text-gray-400">{error}</div>
          <button 
            onClick={() => dispatch(fetchTables())}
            className="mt-4 bg-poker-accent-600 hover:bg-poker-accent-700 text-white px-6 py-2 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-poker-dark-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Poker Lobby</h1>
        
        {user && (
          <div className="mb-6 p-4 bg-poker-dark-800 rounded-lg">
            <p className="text-lg">Welcome back! 🎰</p>
            <p className="text-poker-accent-300">Chips: {user.chips || 'Loading...'}</p>
          </div>
        )}

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Available Tables ({availableTables.length})</h2>
          
          {availableTables.length === 0 ? (
            <div className="text-center py-12 bg-poker-dark-800 rounded-lg">
              <p className="text-gray-400 mb-4">No tables available</p>
              <button className="bg-poker-accent-600 hover:bg-poker-accent-700 text-white px-6 py-2 rounded-lg">
                Create Table
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableTables.map((table: any) => (
                <div key={table.id} className="bg-poker-dark-800 rounded-lg p-6 border border-gray-700 hover:border-poker-accent-500 transition-colors">
                  <h3 className="text-lg font-semibold mb-2">{table.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Players:</span>
                      <span>{table.playerCount}/{table.maxPlayers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Blinds:</span>
                      <span>${table.blinds.small}/${table.blinds.big}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Avg Pot:</span>
                      <span>${table.averagePot}</span>
                    </div>
                  </div>
                  <button className="w-full mt-4 bg-poker-accent-600 hover:bg-poker-accent-700 text-white py-2 rounded-lg transition-colors">
                    Join Table
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SimpleLobbyPage;