import { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { initializeSettings, setIsMobile } from './store/slices/uiSlice';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components to prevent initial load issues
const LandingPage = lazy(() => import('./pages/SimpleLandingPage').catch(() => import('./pages/LandingPage')));
const SimpleLobbyPage = lazy(() => import('./pages/SimpleLobbyPage'));
const TablePage = lazy(() => import('./pages/TablePage'));
const TablesPage = lazy(() => import('./pages/TablesPage'));
const StatsPage = lazy(() => import('./pages/StatsPage'));
const LeaderboardPage = lazy(() => import('./pages/LeaderboardPage'));

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto mb-4"></div>
      <p className="text-xl">Loading...</p>
    </div>
  </div>
);

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Initialize settings safely
    try {
      dispatch(initializeSettings());
    } catch (error) {
      console.error('Failed to initialize settings:', error);
    }

    // Handle window resize safely
    const handleResize = () => {
      try {
        dispatch(setIsMobile(window.innerWidth < 768));
      } catch (error) {
        console.error('Failed to handle resize:', error);
      }
    };

    // Initial mobile check
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="min-h-screen bg-gray-900 text-white">
          {/* Simple header */}
          <header className="bg-gray-800 border-b border-gray-700 p-4">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-2xl font-bold text-green-400">PokerLulu</h1>
            </div>
          </header>
          
          <main className="flex-1">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/lobby" element={<SimpleLobbyPage />} />
                <Route path="/tables" element={<TablesPage />} />
                <Route path="/table/:tableId" element={<TablePage />} />
                <Route path="/statistics" element={<StatsPage />} />
                <Route path="/leaderboard" element={<LeaderboardPage />} />
                
                {/* Redirect to home by default */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </main>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App; 