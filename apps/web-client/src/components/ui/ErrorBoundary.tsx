import React, { Component, ErrorInfo, ReactNode } from 'react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    this.setState({ error, errorInfo })
    
    // Here you could send error to logging service
    // logErrorToService(error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-poker-dark-800 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-poker-dark-700 rounded-lg border border-poker-accent-600 p-6 text-center">
            {/* Error icon */}
            <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            {/* Error title */}
            <h1 className="text-white text-xl font-bold mb-2">
              Oops! Something went wrong
            </h1>

            {/* Error description */}
            <p className="text-poker-accent-300 mb-6">
              We encountered an unexpected error. This has been logged and our team will investigate.
            </p>

            {/* Error details (in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 text-left">
                <summary className="text-poker-accent-300 cursor-pointer mb-2">
                  Error Details (Development)
                </summary>
                <div className="bg-poker-dark-800 p-3 rounded border text-xs overflow-auto">
                  <pre className="text-red-400 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="text-poker-accent-400 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-poker-accent-600 hover:bg-poker-accent-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-poker-dark-600 hover:bg-poker-dark-500 text-poker-accent-300 font-medium py-2 px-4 rounded transition-colors border border-poker-accent-600"
              >
                Reload Page
              </button>
            </div>

            {/* Support link */}
            <p className="text-poker-accent-400 text-sm mt-4">
              If this problem persists, please{' '}
              <a 
                href="/support" 
                className="text-poker-accent-300 hover:text-white underline"
              >
                contact support
              </a>
            </p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary