import { Link, useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search, Ghost } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        {/* Animated Icon Container */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative inline-block mb-8"
        >
          <div className="w-32 h-32 bg-orange-50 rounded-[40px] flex items-center justify-center mx-auto rotate-6">
            <Ghost size={64} className="text-orange-500 -rotate-6 animate-bounce" />
          </div>
          {/* Decorative "404" floating text */}
          <span className="absolute -top-4 -right-8 bg-gray-900 text-white text-xs font-black px-3 py-1 rounded-full shadow-xl">
            404 ERROR
          </span>
        </motion.div>

        <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">
          Lost in the Marketplace?
        </h1>
        <p className="text-gray-500 mb-10 leading-relaxed font-medium">
          We couldn't find the page you're looking for. It might have been moved, deleted, or
          perhaps it never existed in this dimension.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Link to="/dashboard">
            <Button className="w-full h-14 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black gap-2 transition-all shadow-xl shadow-gray-200">
              <Home size={18} />
              Back to Home
            </Button>
          </Link>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 h-12 rounded-xl border-gray-100 font-bold text-gray-600 gap-2"
            >
              <ArrowLeft size={16} />
              Go Back
            </Button>
            <Link to="/dashboard/search" className="flex-1">
              <Button
                variant="outline"
                className="w-full h-12 rounded-xl border-gray-100 font-bold text-gray-600 gap-2"
              >
                <Search size={16} />
                Search
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer Support Link */}
        <p className="mt-12 text-[10px] font-black uppercase tracking-widest text-gray-300">
          Think this is a mistake?{' '}
          <Link to="/support" className="text-orange-500 hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
