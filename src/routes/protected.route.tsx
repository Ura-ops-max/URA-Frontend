import useAuth from '@/hooks/api/use-auth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isGuestAllowedPath } from '@/lib/guest-access';
import { rememberReturnTo } from '@/lib/return-to';
// import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import { FullPageSpinner } from '@/components/ui/FullpageSpinner';

const ProtectedRoute = () => {
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />; // Quick check: "Who is this user?"
  }

  if (error || !isAuthenticated || !user) {
    // Browsing pages (feed, product) stay open to visitors.
    if (isGuestAllowedPath(location.pathname)) return <Outlet />;
    // Private page: sign in, then come straight back here.
    rememberReturnTo(location.pathname + location.search);
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />; // Moves to the specific Page
};

export default ProtectedRoute;
