import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { store } from './store'
import App from './App.tsx'
import './App.css'

// Error tracking in development
if (import.meta.env.DEV) {
  // Add global error handlers for development
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
  })
  
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
  })
}

// Performance monitoring
if (import.meta.env.PROD) {
  // Add performance monitoring in production
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration)
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError)
        })
    })
  }
}

// App initialization
const initializeApp = () => {
  const rootElement = document.getElementById('root')
  
  if (!rootElement) {
    throw new Error('Root element not found')
  }
  
  const root = ReactDOM.createRoot(rootElement)
  
  root.render(
    <React.StrictMode>
      <Provider store={store}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Provider>
    </React.StrictMode>,
  )
}

// Initialize the app
try {
  initializeApp()
} catch (error) {
  console.error('Failed to initialize app:', error)
  
  // Fallback error display
  const rootElement = document.getElementById('root')
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="
        display: flex; 
        flex-direction: column; 
        align-items: center; 
        justify-content: center; 
        height: 100vh; 
        background: #0f0f0f; 
        color: white; 
        font-family: Inter, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div style="
          width: 64px; 
          height: 64px; 
          background: #dc2626; 
          border-radius: 12px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          margin-bottom: 24px;
          font-size: 24px;
        ">⚠</div>
        <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600;">Application Error</h1>
        <p style="margin: 0 0 24px 0; color: #adb5bd; max-width: 400px;">
          Failed to load PokerDoritos. Please refresh the page or check your internet connection.
        </p>
        <button 
          onclick="window.location.reload()" 
          style="
            background: #d97706; 
            color: white; 
            border: none; 
            padding: 12px 24px; 
            border-radius: 8px; 
            font-size: 16px; 
            font-weight: 500; 
            cursor: pointer;
            transition: background 0.2s;
          "
          onmouseover="this.style.background='#b45309'"
          onmouseout="this.style.background='#d97706'"
        >
          Reload Page
        </button>
      </div>
    `
  }
}
