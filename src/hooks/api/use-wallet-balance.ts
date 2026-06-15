import { useQuery } from '@tanstack/react-query';
import paylukAPI from '@/lib/payluk-axios';

export interface PaylukWalletBalance {
  mainBalance: number;
  escrowBalance: number;
  currency: string;
}

async function fetchWalletBalance(customerId: string): Promise<PaylukWalletBalance> {
  const { data } = await paylukAPI.get('/wallet', {
    headers: { 'customer-id': customerId },
  });
  console.log('Fetching wallet balance for customer:', customerId); // Debugging log
  // Normalise whatever shape the API returns
  const payload = data?.data ?? data;
  return {
    mainBalance: payload?.mainBalance ?? payload?.balance ?? 0,
    escrowBalance: payload?.escrowBalance ?? 0,
    currency: payload?.currency === 'NG' ? 'NGN' : (payload?.currency ?? 'NGN'),
  };
}

export function useWalletBalance(customerId: string | undefined | null) {
  return useQuery({
    queryKey: ['payluk', 'wallet', customerId],
    queryFn: () => fetchWalletBalance(customerId!),
    enabled: Boolean(customerId),
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 1,
  });
}
