import { useQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';

export type EscrowStatus =
  | 'PENDING'
  | 'ONGOING'
  | 'COMPLETED'
  | 'REFUNDED'
  | 'CLAIMED'
  | 'DISPUTED'
  | 'INVESTIGATING'
  | 'SPLIT';

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

/** An escrow as URA's backend returns it (no payment token: act via its order). */
export interface EscrowTransaction {
  id: string;
  amount: number;
  purpose: string;
  description: string;
  whoPays: string;
  fee: number;
  status: EscrowStatus;
  state: string;
  channel: string;
  paidAt: string | null;
  completedAt: string | null;
  maxDelivery: number;
  deliveryTimeline: string;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
  paymentDetails: Pick<EscrowPaymentDetails, 'amount' | 'status'> | null;
  /** The URA order this escrow belongs to, when there is one. */
  orderId: string | null;
  orderNumber: string | null;
  paymentType: 'normal' | 'protected' | null;
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

// URA's backend lists the signed-in user's own escrows, linked to their orders.
async function fetchEscrowTransactions(
  type: 'sales' | 'buy',
  status: EscrowStatus | undefined,
  page: number,
): Promise<EscrowHistoryResponse> {
  const { data } = await API.get('/wallet/escrows', {
    params: { type, page, ...(status ? { status } : {}) },
  });
  return { data: data?.data ?? [], pagination: data?.pagination, report: data?.report };
}

/** `customerId` only switches the query on once the user has a payment profile. */
export function useEscrowTransactions(
  customerId: string | undefined | null,
  type: 'sales' | 'buy' = 'sales',
  status?: EscrowStatus,
  page = 1,
  limit = 10,
) {
  return useQuery({
    queryKey: ['wallet', 'escrows', customerId, type, status ?? 'ALL', page, limit],
    queryFn: () => fetchEscrowTransactions(type, status, page),
    enabled: Boolean(customerId),
    staleTime: 1000 * 30,
    gcTime: 1000 * 60 * 5,
    retry: 1,
  });
}
