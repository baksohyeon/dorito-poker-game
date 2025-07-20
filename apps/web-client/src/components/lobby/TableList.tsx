
// apps/web-client/src/components/lobby/TableList.tsx
import React from 'react';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { Users, Lock, Eye } from 'lucide-react';

interface Table {
  id: string;
  name?: string;
  gameType: string;
  currentPlayers: number;
  maxPlayers: number;
  blinds: {
    small: number;
    big: number;
  };
  buyIn: {
    min: number;
    max: number;
  };
  isPrivate: boolean;
  serverStatus: string;
}

interface TableListProps {
  tables: Table[];
  isLoading: boolean;
  onJoinTable: (tableId: string) => void;
}

export const TableList: React.FC<TableListProps> = ({
  tables,
  isLoading,
  onJoinTable
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (tables.length === 0) {
    return (
      <div className="text-center py-12">
        <Users size={48} className="text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-300 mb-2">No tables available</h3>
        <p className="text-gray-500">Create a new table to start playing!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tables.map((table) => (
        <div
          key={table.id}
          className="bg-gray-800 border border-gray-700 rounded-lg p-6 hover:border-gray-600 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  {table.name || `Table ${table.id.slice(-4)}`}
                </h3>
                {table.isPrivate && (
                  <Lock size={16} className="text-yellow-500" />
                )}
                <span className="px-2 py-1 bg-poker-green text-white text-xs rounded-full">
                  {table.gameType.replace('-', ' ').toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-300">
                <div>
                  <span className="text-gray-500">Players:</span>
                  <div className="flex items-center space-x-1">
                    <Users size={14} />
                    <span className="text-white font-medium">
                      {table.currentPlayers}/{table.maxPlayers}
                    </span>
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Blinds:</span>
                  <div className="text-white font-medium">
                    ${table.blinds.small}/${table.blinds.big}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Buy-in:</span>
                  <div className="text-white font-medium">
                    ${table.buyIn.min} - ${table.buyIn.max}
                  </div>
                </div>
                
                <div>
                  <span className="text-gray-500">Status:</span>
                  <div className={`font-medium ${
                    table.serverStatus === 'online' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {table.serverStatus}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="min-w-[80px]"
              >
                <Eye size={16} className="mr-1" />
                Watch
              </Button>
              
              <Button
                onClick={() => onJoinTable(table.id)}
                disabled={
                  table.currentPlayers >= table.maxPlayers || 
                  table.serverStatus !== 'online'
                }
                size="sm"
                className="min-w-[80px]"
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};