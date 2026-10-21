import { useQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export interface PaylukTransaction {
  id: string;
  amount: number;
  reference: string;
  fee: number;
  transactionType: string;
  currency: string;
  status: 'success' | 'pending' | 'failed';
  creditType: 'credit' | 'debit';
  createdAt: string;
  updatedAt: string;
  transferDetails: unknown | null;
  cardId: string | null;
  walletDetails: unknown | null;
  blockchainDetails: unknown | null;
  withdrawalDetails: unknown | null;
  escrowDetails: unknown | null;
  metadata: unknown | null;
}

export interface PaylukHistoryPagination {
  count: number;
  pages: number;
  isLastPage: boolean;
  nextPage: number | null;
  previousPage: number | null;
}

export interface PaylukPaymentHistory {
  pagination: PaylukHistoryPagination;
  data: PaylukTransaction[];
}

// URA's backend reads the signed-in user's own history (same field names).
async function fetchPaymentHistory(page = 1, limit = 10): Promise<PaylukPaymentHistory> {
  const { data } = await API.get('/wallet/transactions', { params: { page, limit } });
  return { pagination: data?.pagination, data: data?.data ?? [] };
}

/** `customerId` only switches the query on once the user has a payment profile. */
export function usePaymentHistory(customerId: string | undefined | null, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['wallet', 'payment-history', customerId, page, limit],
    queryFn: () => fetchPaymentHistory(page, limit),
    enabled: Boolean(customerId),
    staleTime: 1000 * 60,
    retry: 1,
  });
}
