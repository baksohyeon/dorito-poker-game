import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../store'
import { updateSettings } from '../store/slices/uiSlice'

const SettingsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { 
    animationsEnabled, 
    soundEnabled, 
    showTooltips, 
    tableTheme, 
    cardTheme 
  } = useSelector((state: RootState) => state.ui)

  const handleSettingChange = (setting: string, value: any) => {
    dispatch(updateSettings({ [setting]: value }))
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>
      
      <div className="space-y-8">
        {/* Game Settings */}
        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <h2 className="text-white text-xl font-bold mb-4">Game Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Animations</label>
                <p className="text-poker-accent-300 text-sm">Enable card dealing and chip animations</p>
              </div>
              <button
                onClick={() => handleSettingChange('animationsEnabled', !animationsEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  animationsEnabled ? 'bg-poker-accent-600' : 'bg-poker-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    animationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Sound Effects</label>
                <p className="text-poker-accent-300 text-sm">Play sounds for game actions</p>
              </div>
              <button
                onClick={() => handleSettingChange('soundEnabled', !soundEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  soundEnabled ? 'bg-poker-accent-600' : 'bg-poker-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-white font-medium">Tooltips</label>
                <p className="text-poker-accent-300 text-sm">Show helpful tooltips</p>
              </div>
              <button
                onClick={() => handleSettingChange('showTooltips', !showTooltips)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  showTooltips ? 'bg-poker-accent-600' : 'bg-poker-dark-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    showTooltips ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <h2 className="text-white text-xl font-bold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-white font-medium mb-2 block">Table Theme</label>
              <select
                value={tableTheme}
                onChange={(e) => handleSettingChange('tableTheme', e.target.value)}
                className="bg-poker-dark-600 border border-poker-accent-600 text-white rounded-lg px-3 py-2 w-full"
              >
                <option value="classic">Classic Green</option>
                <option value="modern">Modern Dark</option>
                <option value="neon">Neon Blue</option>
              </select>
            </div>

            <div>
              <label className="text-white font-medium mb-2 block">Card Design</label>
              <select
                value={cardTheme}
                onChange={(e) => handleSettingChange('cardTheme', e.target.value)}
                className="bg-poker-dark-600 border border-poker-accent-600 text-white rounded-lg px-3 py-2 w-full"
              >
                <option value="classic">Classic</option>
                <option value="modern">Modern</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6">
          <h2 className="text-white text-xl font-bold mb-4">Account</h2>
          
          <div className="space-y-4">
            <button className="w-full bg-poker-accent-600 hover:bg-poker-accent-700 text-white py-2 px-4 rounded-lg transition-colors">
              Change Password
            </button>
            
            <button className="w-full bg-poker-dark-600 hover:bg-poker-dark-500 text-white py-2 px-4 rounded-lg border border-poker-accent-600 transition-colors">
              Update Email
            </button>
            
            <button className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage