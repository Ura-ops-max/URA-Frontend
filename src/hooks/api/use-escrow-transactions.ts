import { useQuery } from '@tanstack/react-query';
import paylukAPI from '@/lib/payluk-axios';

export type EscrowStatus =
  | 'PENDING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'CLAIMED'
  | 'DISPUTED'
  | 'INVESTIGATING';

export interface EscrowPaymentDetails {
  id: string;
  amount: number;
  status: string;
  reference: string;
  fee: number;
  transactionType: string;
  currency: string;
  createdAt: string;
}

export interface EscrowTransaction {
  id: string;
  amount: number;
  purpose: string;
  description: string;
  whoPays: string;
  imageUrl: string | null;
  fee: number;
  paymentToken: string;
  paidAt: string;
  status: EscrowStatus;
  state: string;
  logs: unknown[];
  channel: string;
  isSeller: boolean;
  dispute: unknown | null;
  paymentDetails: EscrowPaymentDetails | null;
  category: string | null;
  completedAt: string | null;
  approvedClaimBy: string | null;
  refundedBy: string | null;
  maxDelivery: number;
  deliveryTimeline: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface EscrowReport {
  total: number;
  completed: number;
  ongoing: number;
  dispute: number;
  amount: { total: number; completed: number; ongoing: number; dispute: number };
}

export interface EscrowHistoryResponse {
  data: EscrowTransaction[];
  pagination: {
    count: number;
    pages: number;
    isLastPage: boolean;
    nextPage: number | null;
    previousPage: number | null;
  };
  report: EscrowReport;
}

async function fetchEscrowTransactions(
  customerId: string,
  type: 'sales' | 'buy',
  status: EscrowStatus | undefined,
  page: number,
  limit: number,
): Promise<EscrowHistoryResponse> {
  const params: Record<string, string | number> = { page, limit, type };
  if (status) params.status = status;

  // The seller escrow endpoint identifies the merchant via the Bearer token (secret key).
  // Sending customer-id causes the API to scope results to that customer and ignore status.
  // Only buyer (type=buy) needs customer-id to identify the buyer.
  const headers: Record<string, string> =
    type === 'buy'
      ? { 'customer-id': customerId, accept: 'application/json' }
      : { accept: 'application/json' };

  const { data } = await paylukAPI.get('/escrow/transactions', { headers, params });
  return data?.data ?? data;
}

export function useEscrowTransactions(
  customerId: string | undefined | null,
  type: 'sales' | 'buy' = 'sales',
  status?: EscrowStatus,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: ['payluk', 'escrow-transactions', customerId, type, status ?? 'ALL', page, limit],
    queryFn: () => fetchEscrowTransactions(customerId!, type, status, page, limit),
    enabled: Boolean(customerId),
    // No placeholderData — we want the list to fully clear and show a spinner
    // when the status filter or page changes, so the user sees clear feedback.
    staleTime: 0,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}
