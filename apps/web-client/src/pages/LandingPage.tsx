import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Play, Users, Trophy, Zap, Shield, Brain } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-poker-dark-900 via-poker-dark-800 to-poker-green-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl font-bold text-white mb-6">
              PokerDorito
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Experience the thrill of professional poker with AI-powered analysis, 
              real-time multiplayer action, and competitive tournaments.
            </p>
            
            <div className="flex justify-center">
              <Link
                to="/lobby"
                className="poker-button poker-button-primary text-lg px-8 py-4 flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Playing Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-poker-dark-800 bg-opacity-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose PokerDorito?
            </h2>
            <p className="text-gray-300 text-lg">
              Advanced features that elevate your poker experience
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Brain className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">AI Analysis</h3>
              <p className="text-gray-300">
                Get real-time hand analysis and strategic recommendations powered by advanced AI.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Users className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Multiplayer Tables</h3>
              <p className="text-gray-300">
                Join tables with players from around the world in real-time poker action.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Trophy className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Tournaments</h3>
              <p className="text-gray-300">
                Compete in exciting tournaments and climb the global leaderboards.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Zap className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Fast Action</h3>
              <p className="text-gray-300">
                Lightning-fast gameplay with smooth animations and responsive controls.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Shield className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Secure & Fair</h3>
              <p className="text-gray-300">
                Advanced security measures and fair play algorithms ensure integrity.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-poker-dark-800 p-8 rounded-xl border border-gray-700"
            >
              <Users className="w-12 h-12 text-poker-green-400 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-3">Community</h3>
              <p className="text-gray-300">
                Join a vibrant community of poker enthusiasts and improve your skills.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Play?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join thousands of players and start your poker journey today.
            </p>
            <Link
              to="/lobby"
              className="poker-button poker-button-primary text-lg px-12 py-4 inline-flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Playing Now
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 