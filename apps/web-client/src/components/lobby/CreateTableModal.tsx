
// apps/web-client/src/components/lobby/CreateTableModal.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';

interface CreateTableForm {
  name: string;
  gameType: 'texas-holdem' | 'omaha';
  maxPlayers: number;
  smallBlind: number;
  bigBlind: number;
  buyInMin: number;
  buyInMax: number;
  isPrivate: boolean;
  password?: string;
  timeLimit: number;
}

interface CreateTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTableCreated: (tableId: string) => void;
}

export const CreateTableModal: React.FC<CreateTableModalProps> = ({
  isOpen,
  onClose,
  onTableCreated
}) => {
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<CreateTableForm>({
    defaultValues: {
      gameType: 'texas-holdem',
      maxPlayers: 9,
      smallBlind: 10,
      bigBlind: 20,
      buyInMin: 200,
      buyInMax: 2000,
      isPrivate: false,
      timeLimit: 30
    }
  });

  const isPrivate = watch('isPrivate');
  const smallBlind = watch('smallBlind');

  const onSubmit = async (data: CreateTableForm) => {
    setIsCreating(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock table creation
      const tableId = `table_${Date.now()}`;
      onTableCreated(tableId);
    } catch (error) {
      console.error('Failed to create table:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Table">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Table Name */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Table Name
          </label>
          <input
            {...register('name', { required: 'Table name is required' })}
            type="text"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
            placeholder="Enter table name"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
          )}
        </div>

        {/* Game Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Game Type
          </label>
          <select
            {...register('gameType')}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
          >
            <option value="texas-holdem">Texas Hold'em</option>
            <option value="omaha">Omaha</option>
          </select>
        </div>

        {/* Max Players */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Maximum Players
          </label>
          <select
            {...register('maxPlayers', { valueAsNumber: true })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
          >
            <option value={2}>2 Players (Heads-up)</option>
            <option value={6}>6 Players</option>
            <option value={9}>9 Players</option>
          </select>
        </div>

        {/* Blinds */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Small Blind
            </label>
            <input
              {...register('smallBlind', { 
                required: 'Small blind is required',
                valueAsNumber: true,
                min: { value: 1, message: 'Minimum $1' }
              })}
              type="number"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
              placeholder="10"
            />
            {errors.smallBlind && (
              <p className="mt-1 text-sm text-red-400">{errors.smallBlind.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Big Blind
            </label>
            <input
              {...register('bigBlind', { 
                required: 'Big blind is required',
                valueAsNumber: true,
                min: { value: smallBlind * 2, message: 'Must be at least 2x small blind' }
              })}
              type="number"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
              placeholder="20"
            />
            {errors.bigBlind && (
              <p className="mt-1 text-sm text-red-400">{errors.bigBlind.message}</p>
            )}
          </div>
        </div>

        {/* Buy-in Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Min Buy-in
            </label>
            <input
              {...register('buyInMin', { 
                required: 'Min buy-in is required',
                valueAsNumber: true
              })}
              type="number"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
              placeholder="200"
            />
            {errors.buyInMin && (
              <p className="mt-1 text-sm text-red-400">{errors.buyInMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Buy-in
            </label>
            <input
              {...register('buyInMax', { 
                required: 'Max buy-in is required',
                valueAsNumber: true
              })}
              type="number"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
              placeholder="2000"
            />
            {errors.buyInMax && (
              <p className="mt-1 text-sm text-red-400">{errors.buyInMax.message}</p>
            )}
          </div>
        </div>

        {/* Privacy Settings */}
        <div>
          <div className="flex items-center space-x-3">
            <input
              {...register('isPrivate')}
              type="checkbox"
              className="w-4 h-4 text-poker-gold bg-gray-800 border-gray-600 rounded focus:ring-poker-gold focus:ring-2"
            />
            <label className="text-sm font-medium text-gray-300">
              Private Table
            </label>
          </div>
          {isPrivate && (
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                {...register('password', {
                  required: isPrivate ? 'Password is required for private tables' : false
                })}
                type="password"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-poker-gold"
                placeholder="Enter table password"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Action Time Limit */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Action Time Limit (seconds)
          </label>
          <select
            {...register('timeLimit', { valueAsNumber: true })}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-poker-gold"
          >
            <option value={15}>15 seconds</option>
            <option value={30}>30 seconds</option>
            <option value={60}>60 seconds</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={isCreating}
            className="flex-1"
          >
            Create Table
          </Button>
        </div>
      </form>
    </Modal>
  );
};