import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { RootState } from '../../store';
import { closeModal } from '../../store/slices/uiSlice';

// Modal content components
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import SettingsModal from './modals/SettingsModal';
import TableCreateModal from './modals/TableCreateModal';
import HandHistoryModal from './modals/HandHistoryModal';
import AIAnalysisModal from './modals/AIAnalysisModal';

const Modal: React.FC = () => {
  const dispatch = useDispatch();
  const { modal } = useSelector((state: RootState) => state.ui);

  const handleClose = () => {
    dispatch(closeModal());
  };

  const renderModalContent = () => {
    switch (modal.type) {
      case 'login':
        return <LoginModal />;
      case 'register':
        return <RegisterModal />;
      case 'settings':
        return <SettingsModal />;
      case 'table-create':
        return <TableCreateModal />;
      case 'hand-history':
        return <HandHistoryModal />;
      case 'ai-analysis':
        return <AIAnalysisModal />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {modal.isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-poker-dark-800 border border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-auto"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 text-gray-400 hover:text-white transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Modal content */}
            <div className="p-6">
              {renderModalContent()}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal; 