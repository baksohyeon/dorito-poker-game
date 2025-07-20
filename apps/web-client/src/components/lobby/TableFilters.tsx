
// apps/web-client/src/components/lobby/TableFilters.tsx
import React from 'react';
import { Button } from '../ui/Button';

interface TableFiltersProps {
  filters: {
    gameType: string;
    blindRange: { min: number; max: number };
    maxPlayers: number;
    isPrivate: boolean;
  };
  onFilterChange: (filters: any) => void;
}

export const TableFilters: React.FC<TableFiltersProps> = ({
  filters,
  onFilterChange
}) => {
  const gameTypes = [
    { value: '', label: 'All Games' },
    { value: 'texas-holdem', label: 'Texas Hold\'em' },
    { value: 'omaha', label: 'Omaha' }
  ];

  const playerCounts = [
    { value: 0, label: 'Any Size' },
    { value: 2, label: '2 Players' },
    { value: 6, label: '6 Players' },
    { value: 9, label: '9 Players' }
  ];

  const blindRanges = [
    { value: { min: 0, max: 1000 }, label: 'All Stakes' },
    { value: { min: 1, max: 5 }, label: 'Micro ($1/$2 - $2/$5)' },
    { value: { min: 5, max: 25 }, label: 'Low ($5/$10 - $10/$25)' },
    { value: { min: 25, max: 100 }, label: 'Medium ($25/$50 - $50/$100)' },
    { value: { min: 100, max: 1000 }, label: 'High ($100+)' }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Game Type
        </label>
        <select
          value={filters.gameType}
          onChange={(e) => onFilterChange({ ...filters, gameType: e.target.value })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
        >
          {gameTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Stakes
        </label>
        <select
          value={JSON.stringify(filters.blindRange)}
          onChange={(e) => onFilterChange({ 
            ...filters, 
            blindRange: JSON.parse(e.target.value) 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
        >
          {blindRanges.map((range, index) => (
            <option key={index} value={JSON.stringify(range.value)}>
              {range.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Table Size
        </label>
        <select
          value={filters.maxPlayers}
          onChange={(e) => onFilterChange({ 
            ...filters, 
            maxPlayers: parseInt(e.target.value) 
          })}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
        >
          {playerCounts.map((count) => (
            <option key={count.value} value={count.value}>
              {count.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Table Type
        </label>
        <div className="flex space-x-2">
          <Button
            variant={!filters.isPrivate ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onFilterChange({ ...filters, isPrivate: false })}
            className="flex-1"
          >
            Public
          </Button>
          <Button
            variant={filters.isPrivate ? 'primary' : 'outline'}
            size="sm"
            onClick={() => onFilterChange({ ...filters, isPrivate: true })}
            className="flex-1"
          >
            Private
          </Button>
        </div>
      </div>
    </div>
  );
};