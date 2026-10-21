// Payment calls go to URA's backend only. The backend talks to Payluk; the
// browser never calls Payluk's API (only the Checkout SDK widget does).
import API from '@/lib/axios-client';

export type PaymentType = 'normal' | 'protected';

export interface PaymentBreakdown {
  items: number;
  delivery: number;
  serviceFee: number;
  total: number;
}

export interface StartPaymentResponse {
  paymentToken: string;
  reference: string;
  amountToPay: number;
  breakdown: PaymentBreakdown;
  /** The buyer's own Payluk customer id (for the SDK's customerId). */
  customerId: string;
  paymentType: PaymentType;
}

export interface PaymentStatus {
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: string;
  paymentType: PaymentType;
  payoutReleased: boolean;
  disputeStatus: 'open' | 'investigating' | 'refunded' | 'split' | 'resolved' | null;
}

export interface DisputeEntry {
  from: 'buyer' | 'seller';
  name: string | null;
  message: string | null;
  proofUrl: string | null;
  at: string | null;
}

export const paymentsApi = {
  start: async (orderId: string): Promise<StartPaymentResponse> =>
    (await API.post(`/orders/${orderId}/pay`)).data,
  status: async (orderId: string): Promise<PaymentStatus> =>
    (await API.get(`/orders/${orderId}/payment-status`)).data,
  payFromWallet: async (orderId: string): Promise<PaymentStatus> =>
    (await API.post(`/orders/${orderId}/pay-from-wallet`)).data,
  confirmReceived: async (orderId: string) =>
    (await API.post(`/orders/${orderId}/confirm-received`)).data,
  claim: async (orderId: string) => (await API.post(`/orders/${orderId}/claim`)).data,
  submitDispute: async (orderId: string, message: string, file?: File | null) => {
    const form = new FormData();
    form.append('message', message);
    if (file) form.append('file', file);
    return (await API.post(`/orders/${orderId}/dispute`, form)).data;
  },
  getDispute: async (
    orderId: string,
  ): Promise<{ dispute: { status: string; openedAt: string | null; entries: DisputeEntry[] } | null }> =>
    (await API.get(`/orders/${orderId}/dispute`)).data,
};

/** A readable message from an API error. */
export const paymentErrorMessage = (err: any, fallback: string): string =>
  err?.response?.data?.message || fallback;
