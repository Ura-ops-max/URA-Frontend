import { useQuery } from '@tanstack/react-query';
import { tokenStorage } from '@/lib/token-storage';
import { getCurrentUserQueryFn } from '@/lib/api'; // real backend fn
import { AxiosError } from 'axios';
import { mockApi } from '@/services/mockApi';

/**
 * This flag controls whether we use backend or mock data.
 * Later, set USE_MOCK_API = false and everything works automatically.
 */
const USE_MOCK_API = false;

const useAuth = () => {
  const hasToken = tokenStorage.hasToken();

  const enabled = USE_MOCK_API || hasToken; // always enabled in mock mode

  const query = useQuery({
    queryKey: ['authUser'],
    queryFn: async () => {
      if (USE_MOCK_API) {
        return mockApi.get('currentUser'); // no need for extra await
      }
      return getCurrentUserQueryFn();
    },
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error: AxiosError) => {
      if (USE_MOCK_API) return true; // allow retry for mock API if needed
      if (error.response?.status === 401) return false; // don't retry on 401
      return failureCount < 2; // retry up to 2 times
    },
  });

  const data = query.data ?? null;

  const user = data?.user ?? null;
  const related = data?.related ?? null;
  const isAuthenticated = Boolean(hasToken && user && !query.error);

  return {
    ...query,
    user,
    related,
    isAuthenticated,
  };
};

export default useAuth;
