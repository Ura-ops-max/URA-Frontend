import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenStorage } from '@/lib/token-storage';
import { Loader2 } from 'lucide-react';

const OAuthSuccessPage = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = params.get('accessToken');
    const refreshToken = params.get('refreshToken');

    if (accessToken && refreshToken) {
      tokenStorage.setToken(accessToken);
      tokenStorage.setRefreshToken(refreshToken);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth/login?error=oauth_failed', { replace: true });
    }
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
    </div>
  );
};

export default OAuthSuccessPage;
