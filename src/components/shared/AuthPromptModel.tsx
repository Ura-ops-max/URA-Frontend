import { motion, AnimatePresence } from 'framer-motion';
import { X, Lock, UserPlus, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { rememberReturnTo } from '@/lib/return-to';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actionName?: string;
}

export const AuthPromptModal = ({
  isOpen,
  onClose,
  title = 'Authentication Required',
  subtitle = 'Please log in to your account to continue with this action.',
  actionName = 'continue',
}: AuthPromptModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-sm bg-white rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>

          <div className="flex flex-col items-center text-center">
            {/* Icon Circle */}
            <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <Lock className="text-orange-600" size={28} />
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-2">{title}</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8 px-4">{subtitle}</p>

            {/* Buttons Stack */}
            <div className="w-full flex flex-col gap-3">
              <button
                onClick={() => {
                  rememberReturnTo(window.location.pathname + window.location.search);
                  navigate('/auth/login');
                }}
                className="w-full bg-black text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-800 transition-all active:scale-[0.98]"
              >
                <LogIn size={18} />
                Login to {actionName}
              </button>

              <button
                onClick={() => {
                  rememberReturnTo(window.location.pathname + window.location.search);
                  navigate('/auth/register');
                }}
                className="w-full bg-white text-gray-900 border-2 border-gray-100 py-4 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-gray-50 transition-all active:scale-[0.98]"
              >
                <UserPlus size={18} />
                Create Account
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-6 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
