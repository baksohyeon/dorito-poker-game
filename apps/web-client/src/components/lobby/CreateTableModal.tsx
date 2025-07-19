import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { createTable, setTableCreationData, resetTableCreationData } from '../../store/slices/lobbySlice'
import { closeModal } from '../../store/slices/uiSlice'

interface CreateTableModalProps {
  isOpen: boolean
  onClose: () => void
}

const CreateTableModal: React.FC<CreateTableModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch<AppDispatch>()
  const { tableCreation } = useSelector((state: RootState) => state.lobby)
  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    dispatch(setTableCreationData({ [field]: value }))
    setErrors([]) // Clear errors when user makes changes
  }

  const validateForm = () => {
    const newErrors: string[] = []
    const { newTableData } = tableCreation

    if (!newTableData.name.trim()) {
      newErrors.push('Table name is required')
    }
    if (newTableData.name.length < 3) {
      newErrors.push('Table name must be at least 3 characters')
    }
    if (newTableData.maxPlayers < 2 || newTableData.maxPlayers > 10) {
      newErrors.push('Player count must be between 2 and 10')
    }
    if (newTableData.blinds.small <= 0 || newTableData.blinds.big <= 0) {
      newErrors.push('Blinds must be greater than 0')
    }
    if (newTableData.blinds.big <= newTableData.blinds.small) {
      newErrors.push('Big blind must be greater than small blind')
    }
    if (newTableData.buyIn.min <= 0 || newTableData.buyIn.max <= 0) {
      newErrors.push('Buy-in amounts must be greater than 0')
    }
    if (newTableData.buyIn.max <= newTableData.buyIn.min) {
      newErrors.push('Maximum buy-in must be greater than minimum')
    }
    if (newTableData.buyIn.min < newTableData.blinds.big * 10) {
      newErrors.push('Minimum buy-in should be at least 10x the big blind')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      const result = await dispatch(createTable(tableCreation.newTableData))
      if (createTable.fulfilled.match(result)) {
        dispatch(resetTableCreationData())
        onClose()
      }
    } catch (error) {
      console.error('Failed to create table:', error)
    }
  }

  const handleClose = () => {
    dispatch(resetTableCreationData())
    setErrors([])
    onClose()
  }

  const presetConfigurations = [
    {
      name: 'Micro Stakes',
      blinds: { small: 1, big: 2 },
      buyIn: { min: 40, max: 200 },
      maxPlayers: 6
    },
    {
      name: 'Low Stakes', 
      blinds: { small: 5, big: 10 },
      buyIn: { min: 200, max: 1000 },
      maxPlayers: 9
    },
    {
      name: 'Mid Stakes',
      blinds: { small: 25, big: 50 },
      buyIn: { min: 1000, max: 5000 },
      maxPlayers: 6
    },
    {
      name: 'High Stakes',
      blinds: { small: 100, big: 200 },
      buyIn: { min: 4000, max: 20000 },
      maxPlayers: 6
    }
  ]

  const applyPreset = (preset: typeof presetConfigurations[0]) => {
    dispatch(setTableCreationData({
      blinds: preset.blinds,
      buyIn: preset.buyIn,
      maxPlayers: preset.maxPlayers
    }))
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
        >
          <motion.div
            className="bg-poker-dark-800 rounded-lg border border-poker-accent-600 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-poker-accent-600">
              <h2 className="text-xl font-bold text-white">Create New Table</h2>
              <button
                onClick={handleClose}
                className="text-poker-accent-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Preset configurations */}
            <div className="p-6 border-b border-poker-accent-600">
              <h3 className="text-white font-medium mb-4">Quick Setup</h3>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {presetConfigurations.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="bg-poker-dark-700 hover:bg-poker-dark-600 border border-poker-accent-600 rounded-lg p-3 text-left transition-colors"
                  >
                    <div className="text-white font-medium text-sm">{preset.name}</div>
                    <div className="text-poker-accent-300 text-xs mt-1">
                      ${preset.blinds.small}/${preset.blinds.big}
                    </div>
                    <div className="text-poker-accent-400 text-xs">
                      {preset.maxPlayers} players
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6">
              {/* Errors */}
              {errors.length > 0 && (
                <div className="bg-red-900 border border-red-600 rounded-lg p-4 mb-6">
                  <ul className="text-red-200 text-sm space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Settings */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Basic Settings</h3>
                  
                  {/* Table Name */}
                  <div>
                    <label className="block text-poker-accent-300 text-sm font-medium mb-2">
                      Table Name
                    </label>
                    <input
                      type="text"
                      value={tableCreation.newTableData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                      placeholder="Enter table name"
                      maxLength={50}
                    />
                  </div>

                  {/* Game Type */}
                  <div>
                    <label className="block text-poker-accent-300 text-sm font-medium mb-2">
                      Game Type
                    </label>
                    <select
                      value={tableCreation.newTableData.gameType}
                      onChange={(e) => handleInputChange('gameType', e.target.value)}
                      className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                    >
                      <option value="texas-holdem">Texas Hold'em</option>
                      <option value="omaha">Omaha</option>
                    </select>
                  </div>

                  {/* Max Players */}
                  <div>
                    <label className="block text-poker-accent-300 text-sm font-medium mb-2">
                      Maximum Players
                    </label>
                    <select
                      value={tableCreation.newTableData.maxPlayers}
                      onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value))}
                      className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                    >
                      {[2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <option key={num} value={num}>{num} players</option>
                      ))}
                    </select>
                  </div>

                  {/* Private Table */}
                  <div>
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={tableCreation.newTableData.isPrivate}
                        onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                        className="rounded border-poker-accent-600 bg-poker-dark-600 text-poker-accent-500 focus:ring-poker-accent-500"
                      />
                      <span className="text-poker-accent-300 text-sm">Private Table</span>
                    </label>
                    {tableCreation.newTableData.isPrivate && (
                      <input
                        type="password"
                        value={tableCreation.newTableData.password || ''}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full mt-2 bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                        placeholder="Table password"
                      />
                    )}
                  </div>
                </div>

                {/* Financial Settings */}
                <div className="space-y-4">
                  <h3 className="text-white font-medium">Stakes & Buy-in</h3>
                  
                  {/* Blinds */}
                  <div>
                    <label className="block text-poker-accent-300 text-sm font-medium mb-2">
                      Blinds
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          value={tableCreation.newTableData.blinds.small}
                          onChange={(e) => handleInputChange('blinds', {
                            ...tableCreation.newTableData.blinds,
                            small: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                          placeholder="Small blind"
                          min="1"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={tableCreation.newTableData.blinds.big}
                          onChange={(e) => handleInputChange('blinds', {
                            ...tableCreation.newTableData.blinds,
                            big: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                          placeholder="Big blind"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buy-in */}
                  <div>
                    <label className="block text-poker-accent-300 text-sm font-medium mb-2">
                      Buy-in Range
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <input
                          type="number"
                          value={tableCreation.newTableData.buyIn.min}
                          onChange={(e) => handleInputChange('buyIn', {
                            ...tableCreation.newTableData.buyIn,
                            min: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                          placeholder="Minimum"
                          min="1"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={tableCreation.newTableData.buyIn.max}
                          onChange={(e) => handleInputChange('buyIn', {
                            ...tableCreation.newTableData.buyIn,
                            max: parseInt(e.target.value) || 0
                          })}
                          className="w-full bg-poker-dark-600 border border-poker-accent-600 rounded-lg px-3 py-2 text-white placeholder-poker-accent-400 focus:ring-2 focus:ring-poker-accent-500 focus:border-poker-accent-500"
                          placeholder="Maximum"
                          min="1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buy-in recommendations */}
                  <div className="bg-poker-dark-700 rounded-lg p-3">
                    <div className="text-poker-accent-300 text-xs font-medium mb-2">Recommendations:</div>
                    <div className="text-poker-accent-400 text-xs space-y-1">
                      <div>Min: {(tableCreation.newTableData.blinds.big * 20).toLocaleString()} (20 BB)</div>
                      <div>Max: {(tableCreation.newTableData.blinds.big * 100).toLocaleString()} (100 BB)</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-poker-accent-600">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2 bg-poker-dark-600 hover:bg-poker-dark-500 text-white rounded-lg border border-poker-accent-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={tableCreation.isCreating}
                  className="px-6 py-2 bg-poker-accent-600 hover:bg-poker-accent-700 disabled:bg-poker-accent-800 text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {tableCreation.isCreating ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Table</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CreateTableModal