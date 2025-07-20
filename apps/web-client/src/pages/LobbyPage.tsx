
// apps/web-client/src/pages/LobbyPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchTables, joinTable } from '../store/slices/game.slice';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { TableList } from '../components/lobby/TableList';
import { TableFilters } from '../components/lobby/TableFilters';
import { CreateTableModal } from '../components/lobby/CreateTableModal';
import { QuickMatchButton } from '../components/lobby/QuickMatchButton';
import { PlayerStats } from '../components/lobby/PlayerStats';
import { Plus, Users, Zap } from 'lucide-react';

export const LobbyPage: React.FC = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    gameType: '',
    blindRange: { min: 0, max: 1000 },
    maxPlayers: 0,
    isPrivate: false
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { tables, isLoading, error } = useAppSelector(state => state.game);

  useEffect(() => {
    dispatch(fetchTables({}));
  }, [dispatch]);

  const handleJoinTable = async (tableId: string) => {
    const result = await dispatch(joinTable(tableId));
    if (result.type === 'game/joinTable/fulfilled') {
      navigate(`/game/${tableId}`);
    }
  };

  const handleQuickMatch = () => {
    // Quick match logic will be implemented
    console.log('Quick match requested');
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    dispatch(fetchTables(newFilters));
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold text-white mb-4">
          Welcome to the Lobby
        </h1>
        <p className="text-xl text-gray-300 mb-8">
          Find your perfect poker table and start playing!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <QuickMatchButton onQuickMatch={handleQuickMatch} />
          <Button
            onClick={() => setShowCreateModal(true)}
            variant="outline"
            size="lg"
            className="min-w-[200px]"
          >
            <Plus size={20} className="mr-2" />
            Create Table
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Player Stats */}
        <div className="lg:col-span-1">
          <PlayerStats />
        </div>

        {/* Main Content - Table List */}
        <div className="lg:col-span-3 space-y-6">
          {/* Filters */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Table Filters</h2>
            <TableFilters 
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </Card>

          {/* Tables */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Available Tables</h2>
              <div className="flex items-center space-x-2 text-gray-300">
                <Users size={16} />
                <span>{tables.length} tables available</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
            )}

            <TableList
              tables={tables}
              isLoading={isLoading}
              onJoinTable={handleJoinTable}
            />
          </Card>
        </div>
      </div>

      {/* Create Table Modal */}
      {showCreateModal && (
        <CreateTableModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onTableCreated={(tableId) => {
            setShowCreateModal(false);
            navigate(`/game/${tableId}`);
          }}
        />
      )}
    </div>
  );
};