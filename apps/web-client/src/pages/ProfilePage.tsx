import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { User, Mail, Trophy, Coins, Settings, Edit3, Save, X } from 'lucide-react';
import { useAppSelector } from '../hooks/redux';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  chips: number;
  level: number;
  rank: string;
  experience: number;
  stats: {
    gamesPlayed: number;
    gamesWon: number;
    totalWinnings: number;
    totalLosses: number;
  };
  settings: {
    soundEnabled: boolean;
    animationsEnabled: boolean;
    autoMuckEnabled: boolean;
    aiAssistEnabled: boolean;
  };
}

export const ProfilePage: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      // TODO: Replace with actual API call
      const mockProfile: UserProfile = {
        id: user?.id || '1',
        username: user?.username || 'Player',
        email: user?.email || 'player@example.com',
        chips: 5000,
        level: 15,
        rank: 'Gold',
        experience: 12500,
        stats: {
          gamesPlayed: 150,
          gamesWon: 45,
          totalWinnings: 25000,
          totalLosses: 18000
        },
        settings: {
          soundEnabled: true,
          animationsEnabled: true,
          autoMuckEnabled: false,
          aiAssistEnabled: true
        }
      };
      setProfile(mockProfile);
      setEditedProfile(mockProfile);
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      // TODO: Implement API call to save profile
      setProfile(prev => ({ ...prev!, ...editedProfile }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setIsEditing(false);
  };

  const updateSetting = (key: keyof UserProfile['settings'], value: boolean) => {
    if (!profile) return;
    setEditedProfile(prev => ({
      ...prev,
      settings: {
        soundEnabled: prev.settings?.soundEnabled ?? profile.settings.soundEnabled,
        animationsEnabled: prev.settings?.animationsEnabled ?? profile.settings.animationsEnabled,
        autoMuckEnabled: prev.settings?.autoMuckEnabled ?? profile.settings.autoMuckEnabled,
        aiAssistEnabled: prev.settings?.aiAssistEnabled ?? profile.settings.aiAssistEnabled,
        [key]: value
      }
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="mt-4 text-white text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-white text-lg">Profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-green to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-poker-green to-green-600 p-6 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">{profile.username}</h1>
                  <p className="text-green-100">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5" />
                    <span className="font-semibold">{profile.rank}</span>
                  </div>
                  <p className="text-sm text-green-100">Level {profile.level}</p>
                </div>
                <div className="text-center">
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span className="font-semibold">{profile.chips.toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-green-100">Chips</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
            {/* Stats Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Game Statistics</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Games Played</p>
                  <p className="text-2xl font-bold text-gray-800">{profile.stats.gamesPlayed}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Games Won</p>
                  <p className="text-2xl font-bold text-green-600">{profile.stats.gamesWon}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Winnings</p>
                  <p className="text-2xl font-bold text-green-600">{profile.stats.totalWinnings.toLocaleString()}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Total Losses</p>
                  <p className="text-2xl font-bold text-red-600">{profile.stats.totalLosses.toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold text-gray-800">
                  {profile.stats.gamesPlayed > 0 
                    ? Math.round((profile.stats.gamesWon / profile.stats.gamesPlayed) * 100)
                    : 0}%
                </p>
              </div>
            </div>

            {/* Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Game Settings</h2>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center space-x-2 text-poker-green hover:text-green-700"
                >
                  {isEditing ? <X className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
                  <span>{isEditing ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Sound Effects</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                                      <input
                      title="Enable or disable sound effects"
                      type="checkbox"   
                      checked={isEditing ? editedProfile.settings?.soundEnabled : profile.settings.soundEnabled}
                      onChange={(e) => updateSetting('soundEnabled', e.target.checked)}
                      disabled={!isEditing}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-poker-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-poker-green"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Animations</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedProfile.settings?.animationsEnabled : profile.settings.animationsEnabled}
                      onChange={(e) => updateSetting('animationsEnabled', e.target.checked)}
                      disabled={!isEditing}
                      title="Enable or disable animations"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-poker-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-poker-green"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Auto Muck</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedProfile.settings?.autoMuckEnabled : profile.settings.autoMuckEnabled}
                      onChange={(e) => updateSetting('autoMuckEnabled', e.target.checked)}
                      disabled={!isEditing}
                      title="Enable or disable auto muck"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-poker-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-poker-green"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">AI Assist</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isEditing ? editedProfile.settings?.aiAssistEnabled : profile.settings.aiAssistEnabled}
                        onChange={(e) => updateSetting('aiAssistEnabled', e.target.checked)}
                      disabled={!isEditing}
                      title="Enable or disable AI assist"
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-poker-green rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-poker-green"></div>
                  </label>
                </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-poker-green text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-400 flex items-center justify-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 