import React from 'react';
import { Link } from 'react-router-dom';

const SimpleLandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-green-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-white mb-6">
              PokerLulu
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of professional poker with real-time multiplayer action.
            </p>
            
            <div className="flex justify-center">
              <Link
                to="/lobby"
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-200"
              >
                Start Playing Now
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-800 bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose PokerLulu?
            </h2>
            <p className="text-gray-300 text-lg">
              Advanced features that elevate your poker experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-green-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-900 font-bold">AI</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-gray-300">
                Get real-time hand analysis and strategic recommendations powered by advanced AI.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-green-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-900 font-bold">MP</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Multiplayer Tables</h3>
              <p className="text-gray-300">
                Join tables with players from around the world in real-time poker action.
              </p>
            </div>

            <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
              <div className="w-12 h-12 bg-green-400 rounded-lg mb-4 flex items-center justify-center">
                <span className="text-gray-900 font-bold">🏆</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Tournaments</h3>
              <p className="text-gray-300">
                Compete in exciting tournaments and climb the global leaderboards.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div>
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Play?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of players and start your poker journey today.
            </p>
            <Link
              to="/lobby"
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-12 rounded-lg text-lg transition-colors duration-200 inline-block"
            >
              Start Playing Now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLandingPage;