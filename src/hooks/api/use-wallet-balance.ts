import { useQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export interface PaylukWalletBalance {
  mainBalance: number;
  escrowBalance: number;
  currency: string;
}

// URA's backend reads the signed-in user's own Payluk wallet.
async function fetchWalletBalance(): Promise<PaylukWalletBalance> {
  const { data } = await API.get('/wallet');
  return {
    mainBalance: Number(data?.mainBalance) || 0,
    escrowBalance: Number(data?.escrowBalance) || 0,
    currency: data?.currency || 'NGN',
  };
}

/** `customerId` only switches the query on once the user has a payment profile. */
export function useWalletBalance(customerId: string | undefined | null) {
  return useQuery({
    queryKey: ['wallet', 'balance', customerId],
    queryFn: fetchWalletBalance,
    enabled: Boolean(customerId),
    staleTime: 1000 * 60, // the backend also caches; Payluk allows 10 calls a minute
    retry: 1,
  });
}
