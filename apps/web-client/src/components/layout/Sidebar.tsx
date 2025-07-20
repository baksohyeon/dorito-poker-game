
// apps/web-client/src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home,
  Trophy,
  User,
  Settings,
  BarChart3
} from 'lucide-react';

const navigation = [
  { name: 'Lobby', href: '/lobby', icon: Home },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  { name: 'Profile', href: '/profile', icon: User },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-700 hidden lg:block">
      <div className="p-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-poker-green text-white'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-8 p-4 bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold text-white mb-2">Quick Stats</h3>
          <div className="space-y-2 text-sm text-gray-400">
            <div className="flex justify-between">
              <span>Games Played:</span>
              <span className="text-white">24</span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span className="text-green-400">67%</span>
            </div>
            <div className="flex justify-between">
              <span>Rank:</span>
              <span className="text-poker-gold">Gold III</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
