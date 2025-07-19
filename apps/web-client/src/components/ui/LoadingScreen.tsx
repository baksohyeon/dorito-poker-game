import React from 'react'

interface LoadingScreenProps {
  message?: string
  fullScreen?: boolean
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = 'Loading...', 
  fullScreen = true 
}) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-poker-dark-800'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Loading animation */}
        <div className="relative">
          {/* Spinning poker chip */}
          <div className="w-16 h-16 mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-poker-accent-400 to-poker-accent-600 rounded-full animate-spin">
              <div className="absolute inset-2 bg-poker-dark-800 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">♠</span>
              </div>
            </div>
          </div>
          
          {/* Pulse circles */}
          <div className="absolute -inset-4 opacity-30">
            <div className="w-24 h-24 border-2 border-poker-accent-400 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Loading text */}
        <h2 className="text-white text-xl font-semibold mb-2">
          {message}
        </h2>
        
        {/* Loading dots */}
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-poker-accent-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-poker-accent-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-poker-accent-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>

        {/* Additional info for full screen */}
        {fullScreen && (
          <p className="text-poker-accent-300 text-sm mt-4 max-w-md">
            Please wait while we prepare your poker experience...
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingScreen