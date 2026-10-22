// Types and tab rules for My Orders (buyer) and Shop Orders (seller). The
// buttons come from the server (`actions`), so the lists and the order page
// always agree with the backend's rules.
import type { PaymentType } from '@/lib/payments-api';

export interface OrderActions {
  pay: boolean;
  cancel: boolean;
  confirmDelivery: boolean;
  reportProblem: boolean;
  getRefund: boolean;
  markReady: boolean;
  reject: boolean;
  claimPayment: boolean;
  respondToProblem: boolean;
}

export const NO_ACTIONS: OrderActions = {
  pay: false,
  cancel: false,
  confirmDelivery: false,
  reportProblem: false,
  getRefund: false,
  markReady: false,
  reject: false,
  claimPayment: false,
  respondToProblem: false,
};

/** An order as the lists receive it: no phone numbers, emails or codes. */
export interface ListOrder {
  _id: string;
  orderNumber: string;
  status: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentType: PaymentType;
  deliveryMethod?: string;
  fulfilment?: string | null;
  items: { name: string; price: number; quantity: number; image?: string | null }[];
  itemsTotal: number;
  totalAmount: number;
  deliveryFee: number;
  createdAt: string;
  paidAt: string | null;
  autoReleaseAt: string | null;
  payoutReleasedAt: string | null;
  disputeStatus: string | null;
  rejectedAt: string | null;
  trackingNumber: string | null;
  /** `phone` is sent to the buyer only (for the WhatsApp button). */
  shop: { _id: string; businessName: string; slug?: string; phone?: string | null } | null;
  buyerName: string | null;
  role: 'buyer' | 'seller';
  actions: OrderActions;
  moneyNote: string | null;
}

export type BuyerTab = 'active' | 'delivered' | 'problems';
export type SellerTab = 'new' | 'ready' | 'done' | 'problems';

export const BUYER_TABS: { value: BuyerTab; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'problems', label: 'Problems' },
];

export const SELLER_TABS: { value: SellerTab; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'ready', label: 'Ready' },
  { value: 'done', label: 'Done' },
  { value: 'problems', label: 'Problems' },
];

type TabFields = Pick<ListOrder, 'status' | 'disputeStatus' | 'rejectedAt'>;

/** A problem: a reported problem, a rejected order, or money sent back. */
const hasProblem = (o: TabFields) =>
  Boolean(o.disputeStatus) || Boolean(o.rejectedAt) || o.status === 'refunded';

export function buyerTab(o: TabFields): BuyerTab {
  if (hasProblem(o)) return 'problems';
  if (o.status === 'delivered') return 'delivered';
  return 'active';
}

export function sellerTab(o: TabFields): SellerTab {
  if (hasProblem(o)) return 'problems';
  if (o.status === 'delivered') return 'done';
  if (o.status === 'shipped') return 'ready';
  return 'new';
}

/** "2x Chicken shawarma, 1x Coke" */
export const itemsSummary = (items: ListOrder['items']) =>
  items.map((i) => `${i.quantity}x ${i.name}`).join(', ');

export const NORMAL_PAYMENT_NOTE =
  'Normal Payment goes straight to the seller. For protection, choose Buyer-Protected Payment.';
