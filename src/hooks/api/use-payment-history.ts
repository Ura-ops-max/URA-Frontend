import { useQuery } from '@tanstack/react-query';
import paylukAPI from '@/lib/payluk-axios';

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

async function fetchPaymentHistory(
  customerId: string,
  page = 1,
  limit = 10,
): Promise<PaylukPaymentHistory> {
  const { data } = await paylukAPI.get('/payment/history', {
    headers: { 'customer-id': customerId },
    params: { page, limit },
  });
  return data?.data ?? data;
}

export function usePaymentHistory(customerId: string | undefined | null, page = 1, limit = 10) {
  return useQuery({
    queryKey: ['payluk', 'payment-history', customerId, page, limit],
    queryFn: () => fetchPaymentHistory(customerId!, page, limit),
    enabled: Boolean(customerId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
