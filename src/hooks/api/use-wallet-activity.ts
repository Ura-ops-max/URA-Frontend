import { useQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export type ActivityType = 'Payment received' | 'Payment sent' | 'Withdrawal' | 'Refund';
export type ActivityStatus = 'Success' | 'Pending' | 'Failed' | 'Held' | 'Released';

/** One money row, with names from URA's orders (no codes or contact details). */
export interface WalletActivityRow {
  id: string;
  type: ActivityType;
  direction: 'credit' | 'debit';
  details: string;
  amount: number;
  fee: number;
  currency: string;
  status: ActivityStatus;
  date: string | null;
  orderId: string | null;
}

export interface WalletActivity {
  pagination: { count: number; pages: number; isLastPage: boolean } | null;
  data: WalletActivityRow[];
}

/** `customerId` only switches the query on once the user has a payment profile. */
export function useWalletActivity(customerId: string | undefined | null, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['wallet', 'activity', customerId, page, limit],
    queryFn: async (): Promise<WalletActivity> => {
      const { data } = await API.get('/wallet/activity', { params: { page, limit } });
      return { pagination: data?.pagination ?? null, data: data?.data ?? [] };
    },
    enabled: Boolean(customerId),
    staleTime: 60_000,
    retry: 1,
  });
}

export interface HeldOrder {
  orderId: string;
  orderNumber: string;
  role: 'buyer' | 'seller';
  name: string;
  amount: number;
  paidAt: string | null;
  autoReleaseAt: string | null;
  problem: boolean;
}

export function useHeldOrders(enabled = true) {
  return useQuery({
    queryKey: ['wallet', 'held'],
    queryFn: async (): Promise<HeldOrder[]> => (await API.get('/wallet/held')).data?.orders ?? [],
    enabled,
    staleTime: 60_000,
  });
}
