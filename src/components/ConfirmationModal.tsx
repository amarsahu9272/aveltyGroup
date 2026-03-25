import React from 'react';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Delete',
  cancelText = 'Cancel',
  isLoading = false,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="p-8">
              <div className="flex items-center justify-center h-16 w-16 bg-red-100 rounded-2xl mb-6 mx-auto">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 leading-relaxed">{message}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className="flex-1 px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all shadow-lg shadow-red-200 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmationModal;
