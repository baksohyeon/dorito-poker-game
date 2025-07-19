import React from 'react'

const TestApp: React.FC = () => {
  return (
    <div className="min-h-screen bg-poker-dark-800 text-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-poker-accent-600 rounded-lg flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-bold text-2xl">♠</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">PokerDoritos</h1>
        <p className="text-poker-accent-300">Test Component Working!</p>
        <div className="mt-4 space-y-2">
          <button className="bg-poker-accent-600 hover:bg-poker-accent-700 text-white px-6 py-2 rounded-lg">
            Test Button
          </button>
          <p className="text-sm text-poker-accent-400">
            If you can see this, React is working correctly
          </p>
        </div>
      </div>
    </div>
  )
}

export default TestApp