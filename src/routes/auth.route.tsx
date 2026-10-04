import useAuth from '@/hooks/api/use-auth';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import { isAuthRoute } from './common/routes';
import { peekReturnTo } from '@/lib/return-to';

const AuthRoute = () => {
  const location = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();

  const _isAuthRoute = isAuthRoute(location.pathname);

  if (isLoading && !_isAuthRoute) return <DashboardSkeleton />;

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated && user) {
    return <Navigate to={peekReturnTo('/dashboard')} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
