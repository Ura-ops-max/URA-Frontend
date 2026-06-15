import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthPopup({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.7, opacity: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="bg-white shadow-xl rounded-2xl p-6 max-w-sm w-[90%] text-center"
      >
        <h2 className="text-xl font-semibold text-gray-800">Sign In Required</h2>
        <p className="text-gray-500 mt-2">You need an account to perform this action.</p>

        <div className="mt-5 space-y-3">
          <Link
            to="/auth/login"
            className="block w-full py-3 rounded-xl bg-orange-500 text-white font-semibold hover:bg-orange-600"
          >
            Sign In
          </Link>

          <Link
            to="/auth/register"
            className="block w-full py-3 rounded-xl border border-orange-400 text-orange-500 font-semibold hover:bg-orange-50"
          >
            Create Account
          </Link>
        </div>

        <button onClick={onClose} className="mt-4 text-gray-400 hover:text-gray-600 text-sm">
          Maybe later
        </button>
      </motion.div>
    </div>
  );
}
