import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Settings, 
  Users, 
  DollarSign, 
  Clock, 
  Shield, 
  Crown, 
  Zap,
  Target,
  Lock,
  Play,
  Trophy,
  Gamepad2
} from 'lucide-react';
import { useAppDispatch } from '../../../store/hooks';
import { closeModal } from '../../../store/slices/uiSlice';
import { formatChips } from '../../../utils/formatting';

interface TableCreateForm {
  name: string;
  type: 'cash' | 'tournament' | 'sit-n-go';
  gameType: 'texas-holdem' | 'omaha' | 'seven-card-stud';
  maxPlayers: number;
  minBuyIn: number;
  maxBuyIn: number;
  smallBlind: number;
  bigBlind: number;
  timeBank: number;
  isPrivate: boolean;
  isHighStakes: boolean;
  isFastPaced: boolean;
  password: string;
  autoStart: boolean;
  startingChips: number;
  tournamentConfig?: {
    buyIn: number;
    prizePool: number;
  };
}

const TableCreateModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced' | 'tournament'>('basic');
  
  const [form, setForm] = useState<TableCreateForm>({
    name: '',
    type: 'cash',
    gameType: 'texas-holdem',
    maxPlayers: 9,
    minBuyIn: 100,
    maxBuyIn: 1000,
    smallBlind: 5,
    bigBlind: 10,
    timeBank: 30,
    isPrivate: false,
    isHighStakes: false,
    isFastPaced: false,
    password: '',
    autoStart: false,
    startingChips: 1000,
    tournamentConfig: {
      buyIn: 100,
      prizePool: 900
    }
  });

  const handleInputChange = (field: keyof TableCreateForm, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (field: keyof TableCreateForm, nestedField: string, value: any) => {
    setForm(prev => ({
      ...prev,
      [field]: {
        [nestedField]: value
      }
    }));
  };

  const getStakesLevel = () => {
    if (form.bigBlind >= 50) return 'high';
    if (form.bigBlind >= 10) return 'medium';
    return 'low';
  };

  const getStakesColor = () => {
    const level = getStakesLevel();
    switch (level) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-green-400';
      default: return 'text-gray-400';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Implement actual API call
      // const response = await createTable(form);
      
      // Mock API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Creating table:', form);
      
      // Close modal and show success message
      dispatch(closeModal());
      // TODO: Show success notification
      
    } catch (error) {
      console.error('Failed to create table:', error);
      // TODO: Show error notification
    } finally {
      setLoading(false);
    }
  };

  const quickPresets = [
    {
      name: 'Beginner Friendly',
      config: {
        name: 'Beginner Table',
        type: 'cash' as const,
        smallBlind: 1,
        bigBlind: 2,
        minBuyIn: 50,
        maxBuyIn: 200,
        maxPlayers: 6,
        timeBank: 60,
        isHighStakes: false,
        isFastPaced: false
      }
    },
    {
      name: 'Standard Cash Game',
      config: {
        name: 'Standard Table',
        type: 'cash' as const,
        smallBlind: 5,
        bigBlind: 10,
        minBuyIn: 200,
        maxBuyIn: 1000,
        maxPlayers: 9,
        timeBank: 30,
        isHighStakes: false,
        isFastPaced: false
      }
    },
    {
      name: 'High Stakes',
      config: {
        name: 'High Stakes Table',
        type: 'cash' as const,
        smallBlind: 25,
        bigBlind: 50,
        minBuyIn: 1000,
        maxBuyIn: 5000,
        maxPlayers: 6,
        timeBank: 20,
        isHighStakes: true,
        isFastPaced: false
      }
    },
    {
      name: 'Speed Poker',
      config: {
        name: 'Speed Table',
        type: 'cash' as const,
        smallBlind: 5,
        bigBlind: 10,
        minBuyIn: 200,
        maxBuyIn: 1000,
        maxPlayers: 8,
        timeBank: 15,
        isHighStakes: false,
        isFastPaced: true
      }
    }
  ];

  const applyPreset = (preset: any) => {
    setForm(prev => ({
      ...prev,
      ...preset.config
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={() => dispatch(closeModal())}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-poker-dark-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-poker-green-600 rounded-lg flex items-center justify-center">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Table</h2>
                <p className="text-sm text-gray-400">Configure your poker table settings</p>
              </div>
            </div>
            <button
              onClick={() => dispatch(closeModal())}
              className="text-gray-400 hover:text-white transition-colors"
              title="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Quick Presets */}
          <div className="p-6 border-b border-gray-700">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Quick Presets</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {quickPresets.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => applyPreset(preset)}
                  className="p-3 bg-poker-dark-900 border border-gray-600 rounded-lg hover:border-poker-green-500 transition-colors text-left"
                >
                  <div className="text-sm font-medium text-white mb-1">{preset.name}</div>
                  <div className="text-xs text-gray-400">
                    {formatChips(preset.config.smallBlind)}/{formatChips(preset.config.bigBlind)}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[60vh]">
            {/* Tab Navigation */}
            <div className="flex space-x-1 p-6 border-b border-gray-700">
              {[
                { id: 'basic', label: 'Basic Settings', icon: Settings },
                { id: 'advanced', label: 'Advanced', icon: Target },
                { id: 'tournament', label: 'Tournament', icon: Trophy }
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-md transition-colors
                    ${activeTab === tab.id 
                      ? 'bg-poker-green-600 text-white' 
                      : 'text-gray-300 hover:text-white hover:bg-poker-dark-700'
                    }
                  `}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                {activeTab === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Table Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Table Name
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        placeholder="Enter table name..."
                        required
                      />
                    </div>

                    {/* Game Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Game Type
                        </label>
                        <select
                          title="Game Type"
                          value={form.type}
                          onChange={(e) => handleInputChange('type', e.target.value)}
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        >
                          <option value="cash">Cash Game</option>
                          <option value="tournament">Tournament</option>
                          <option value="sit-n-go">Sit & Go</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Poker Variant
                        </label>
                        <select
                          title="Poker Variant"
                          value={form.gameType}
                          onChange={(e) => handleInputChange('gameType', e.target.value)}
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        >
                          <option value="texas-holdem">Texas Hold'em</option>
                          <option value="omaha">Omaha</option>
                          <option value="seven-card-stud">Seven Card Stud</option>
                        </select>
                      </div>
                    </div>

                    {/* Players and Stakes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Players
                        </label>
                        <div className="relative">
                          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            title="Max Players"
                            placeholder="Enter max players"
                            value={form.maxPlayers}
                            onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                            min="2"
                            max="10"
                            className="w-full pl-10 pr-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Small Blind
                        </label>
                        <input
                          type="number"
                          title="Small Blind"
                          placeholder="Enter small blind"
                          value={form.smallBlind}
                          onChange={(e) => handleInputChange('smallBlind', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Big Blind
                        </label>
                        <input
                          type="number"
                          title="Big Blind"
                          placeholder="Enter big blind"
                          value={form.bigBlind}
                          onChange={(e) => handleInputChange('bigBlind', parseInt(e.target.value))}
                          min="1"
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>
                    </div>

                    {/* Stakes Level Indicator */}
                    <div className="flex items-center space-x-2 p-3 bg-poker-dark-900 rounded-lg">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Stakes Level:</span>
                      <span className={`text-sm font-medium ${getStakesColor()}`}>
                        {getStakesLevel().charAt(0).toUpperCase() + getStakesLevel().slice(1)}
                      </span>
                    </div>

                    {/* Buy-in Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Min Buy-in
                        </label>
                        <input
                          type="number"
                          title="Min Buy-in"
                          placeholder="Enter min buy-in"
                          value={form.minBuyIn}
                          onChange={(e) => handleInputChange('minBuyIn', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Max Buy-in
                        </label>
                        <input
                          type="number"
                          title="Max Buy-in"
                          placeholder="Enter max buy-in"
                          value={form.maxBuyIn}
                          onChange={(e) => handleInputChange('maxBuyIn', parseInt(e.target.value))}
                          min="0"
                          className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'advanced' && (
                  <motion.div
                    key="advanced"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {/* Time Bank */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Time Bank (seconds)
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          title="Time Bank"
                          placeholder="Enter time bank"
                          value={form.timeBank}
                          onChange={(e) => handleInputChange('timeBank', parseInt(e.target.value))}
                          min="10"
                          max="300"
                          className="w-full pl-10 pr-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>
                    </div>

                    {/* Starting Chips */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Starting Chips
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="number"
                          title="Starting Chips"
                          placeholder="Enter starting chips"
                          value={form.startingChips}
                          onChange={(e) => handleInputChange('startingChips', parseInt(e.target.value))}
                          min="100"
                          className="w-full pl-10 pr-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                        />
                      </div>
                    </div>

                    {/* Table Options */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-gray-300">Table Options</h4>
                      
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            title="Private Table"
                            checked={form.isPrivate}
                            onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                            className="w-4 h-4 text-poker-green-600 bg-poker-dark-900 border-gray-600 rounded focus:ring-poker-green-500"
                          />
                          <Shield className="w-4 h-4 text-blue-400" />
                          <span className="text-sm text-gray-300">Private Table</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            title="High Stakes"
                            checked={form.isHighStakes}
                            onChange={(e) => handleInputChange('isHighStakes', e.target.checked)}
                            className="w-4 h-4 text-poker-green-600 bg-poker-dark-900 border-gray-600 rounded focus:ring-poker-green-500"
                          />
                          <Crown className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm text-gray-300">High Stakes</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            title="Fast Paced"
                            checked={form.isFastPaced}
                            onChange={(e) => handleInputChange('isFastPaced', e.target.checked)}
                            className="w-4 h-4 text-poker-green-600 bg-poker-dark-900 border-gray-600 rounded focus:ring-poker-green-500"
                          />
                          <Zap className="w-4 h-4 text-purple-400" />
                          <span className="text-sm text-gray-300">Fast Paced</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            title="Auto Start"
                            checked={form.autoStart}
                            onChange={(e) => handleInputChange('autoStart', e.target.checked)}
                            className="w-4 h-4 text-poker-green-600 bg-poker-dark-900 border-gray-600 rounded focus:ring-poker-green-500"
                          />
                          <Play className="w-4 h-4 text-green-400" />
                          <span className="text-sm text-gray-300">Auto Start</span>
                        </label>
                      </div>
                    </div>

                    {/* Password (if private) */}
                    {form.isPrivate && (
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Table Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="password"
                            value={form.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                            placeholder="Enter table password..."
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {activeTab === 'tournament' && (
                  <motion.div
                    key="tournament"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    {form.type === 'tournament' && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Tournament Buy-in
                            </label>
                            <input
                              title="Tournament Buy-in"
                              placeholder="Enter tournament buy-in"
                              type="number"
                              value={form.tournamentConfig?.buyIn || 0}
                              onChange={(e) => handleNestedChange('tournamentConfig', 'buyIn', parseInt(e.target.value))}
                              min="0"
                              className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                              Prize Pool
                            </label>
                            <input
                              title="Prize Pool"
                              placeholder="Enter prize pool"
                              type="number"
                              value={form.tournamentConfig?.prizePool || 0}
                              onChange={(e) => handleNestedChange('tournamentConfig', 'prizePool', parseInt(e.target.value))}
                              min="0"
                              className="w-full px-3 py-2 bg-poker-dark-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-poker-green-500"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-poker-dark-900 rounded-lg border border-gray-600">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Tournament Info</h4>
                          <div className="text-sm text-gray-400 space-y-1">
                            <div>• Tournament tables have fixed buy-ins</div>
                            <div>• Players start with equal chip stacks</div>
                            <div>• Blind levels increase over time</div>
                            <div>• Last player standing wins the prize pool</div>
                          </div>
                        </div>
                      </>
                    )}

                    {form.type === 'sit-n-go' && (
                      <div className="p-4 bg-poker-dark-900 rounded-lg border border-gray-600">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Sit & Go Info</h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>• Starts when table fills up</div>
                          <div>• Single table tournament</div>
                          <div>• Quick gameplay</div>
                          <div>• Winner takes all</div>
                        </div>
                      </div>
                    )}

                    {form.type === 'cash' && (
                      <div className="p-4 bg-poker-dark-900 rounded-lg border border-gray-600">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Cash Game Info</h4>
                        <div className="text-sm text-gray-400 space-y-1">
                          <div>• Players can buy in and cash out anytime</div>
                          <div>• Chips represent real money value</div>
                          <div>• No tournament structure</div>
                          <div>• Continuous gameplay</div>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700">
              <button
                type="button"
                onClick={() => dispatch(closeModal())}
                className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={loading || !form.name}
                className={`
                  flex items-center space-x-2 px-6 py-2 rounded-lg transition-colors
                  ${loading || !form.name
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-poker-green-600 hover:bg-poker-green-700 text-white'
                  }
                `}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Create Table</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default TableCreateModal; 