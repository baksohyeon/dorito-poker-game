import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { initializeSettings, setIsMobile } from './store/slices/uiSlice';
import { socketService } from './services/socketService';

// Pages
import LandingPage from './pages/LandingPage';
import SimpleLobbyPage from './pages/SimpleLobbyPage';
import TablePage from './pages/TablePage';
import TablesPage from './pages/TablesPage';
import StatsPage from './pages/StatsPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Components
import Header from './components/layout/Header';
import NotificationContainer from './components/ui/NotificationContainer';
import Modal from './components/ui/Modal';

function App() {
  const dispatch = useDispatch();
  const { theme } = useSelector((state: RootState) => state.ui);

  useEffect(() => {
    // Initialize settings
    dispatch(initializeSettings());

    // Handle window resize
    const handleResize = () => {
      dispatch(setIsMobile(window.innerWidth < 768));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [dispatch]);

  useEffect(() => {
    // Connect to socket for guest access
    socketService.setDispatch(dispatch);
    socketService.connect();

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-poker-dark-900 text-white">
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/lobby" element={<SimpleLobbyPage />} />
            <Route path="/tables" element={<TablesPage />} />
            <Route path="/table/:tableId" element={<TablePage />} />
            <Route path="/statistics" element={<StatsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            
            {/* Redirect to lobby by default */}
            <Route path="*" element={<Navigate to="/lobby" replace />} />
          </Routes>
        </main>

        <NotificationContainer />
        <Modal />
      </div>
    </div>
  );
}

export default App; 