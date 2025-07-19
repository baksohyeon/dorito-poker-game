import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import { initializeSettings, setIsMobile } from './store/slices/uiSlice';
import { socketService } from './services/socketService';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import LobbyPage from './pages/LobbyPage';
import TablePage from './pages/TablePage';
import ProfilePage from './pages/ProfilePage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import NotificationContainer from './components/ui/NotificationContainer';
import Modal from './components/ui/Modal';

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
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
    // Connect to socket when authenticated
    if (isAuthenticated && user) {
      socketService.connect();
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [isAuthenticated, user]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="min-h-screen bg-poker-dark-900 text-white">
        <Header />
        
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/lobby" element={
              <ProtectedRoute>
                <LobbyPage />
              </ProtectedRoute>
            } />
            
            <Route path="/table/:tableId" element={
              <ProtectedRoute>
                <TablePage />
              </ProtectedRoute>
            } />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            
            {/* Redirect to appropriate page based on auth status */}
            <Route path="*" element={
              <Navigate to={isAuthenticated ? "/lobby" : "/"} replace />
            } />
          </Routes>
        </main>

        <NotificationContainer />
        <Modal />
      </div>
    </div>
  );
}

export default App; 