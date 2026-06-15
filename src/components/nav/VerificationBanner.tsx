import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { useAuthContext } from '@/context/auth-provider'; // Use your specific hook name

const VerificationBanner = () => {
  const { user } = useAuthContext();

  // Only show if user exists and is NOT verified
  if (!user || user.emailVerified) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 sticky top-0 z-50">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2 text-amber-800 text-sm font-medium">
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">
            Your email is not verified. Please check your inbox.
          </span>
          <span className="sm:hidden text-xs">Verify your email address</span>
        </div>
        <Link
          to="/auth/verify-email"
          className="flex items-center gap-1 text-xs font-bold text-amber-900 hover:underline uppercase tracking-wider whitespace-nowrap"
        >
          Verify Now <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};

export default VerificationBanner;
