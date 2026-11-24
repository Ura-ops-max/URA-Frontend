import API from '@/lib/axios-client';

export type CourierProvider = 'fez' | 'chowdeck';

export type DeliveryStatus =
  | 'booked'
  | 'awaiting_pickup'
  | 'in_transit'
  | 'arrived'
  | 'delivered'
  | 'cancelled'
  | 'failed';

export interface DeliveryCost {
  cost: number;
  vat: number;
  totalCost: number;
  state: string;
  /** Which courier the server picked for this route (missing on older servers). */
  provider?: CourierProvider;
  providerName?: string;
  /** e.g. "Same day" (Chowdeck). */
  eta?: string;
}

/**
 * Delivery quote. The server picks the courier: Chowdeck for a same-city route
 * it serves, otherwise Fez. `state` alone still works (Fez); city and address
 * let it quote Chowdeck. The pickup comes from the seller's business profile.
 */
export const getDeliveryCost = async (params: {
  /** Buyer's destination state. */
  state: string;
  city?: string;
  fullAddress?: string;
  latitude?: number;
  longitude?: number;
  /** Identifies the seller — the backend reads their business profile for the pickup. */
  productId?: string;
  businessId?: string;
  /** Explicit override; normally derived from the seller's profile. */
  pickUpState?: string;
  weight?: number;
}): Promise<DeliveryCost> => {
  const { data } = await API.post('/delivery/cost', params);
  return data.data as DeliveryCost;
};

/** Same wording as the server (courier.service STATUS_LABEL), for statuses stored on the order. */
export const DELIVERY_STATUS_LABEL: Record<DeliveryStatus, string> = {
  booked: 'Rider being assigned',
  awaiting_pickup: 'Rider on the way to the shop',
  in_transit: 'On the way',
  arrived: 'Rider has arrived',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Delivery failed',
};

export const COURIER_NAME: Record<CourierProvider, string> = { chowdeck: 'Chowdeck', fez: 'Fez' };

/** GET /delivery/track/:trackingNumber → one shape for both couriers. */
export interface DeliveryTracking {
  provider: CourierProvider;
  status: DeliveryStatus;
  statusLabel: string;
  trackingUrl: string | null;
  rider: { name: string | null; phone: string | null } | null;
  timeline: { status: DeliveryStatus | null; label: string; at: string | null }[];
  /** Buyer only. The rider asks for it at handover. */
  deliveryPin?: number;
}

/** Best-effort status text from a raw Fez response (servers before the normalised shape). */
const legacyLabel = (d: Record<string, any> | null): string => {
  const candidates = [
    d?.order?.orderStatus,
    d?.orderStatus,
    d?.status,
    Array.isArray(d?.history) ? d.history[d.history.length - 1]?.status : undefined,
  ];
  return candidates.find((c) => typeof c === 'string' && c.trim()) ?? 'No update from the courier yet.';
};

/**
 * Buyer, seller or admin only (signed in). Older servers send Fez's raw
 * response, which is reduced to a status label.
 */
export const trackDelivery = async (trackingNumber: string): Promise<DeliveryTracking> => {
  const { data } = await API.get(`/delivery/track/${encodeURIComponent(trackingNumber)}`);
  const d = (data.data ?? data) as Record<string, any> | null;
  if (d && typeof d.statusLabel === 'string') {
    return {
      provider: d.provider === 'chowdeck' ? 'chowdeck' : 'fez',
      status: d.status,
      statusLabel: d.statusLabel,
      trackingUrl: d.trackingUrl ?? null,
      rider: d.rider ?? null,
      timeline: Array.isArray(d.timeline) ? d.timeline : [],
      ...(typeof d.deliveryPin === 'number' ? { deliveryPin: d.deliveryPin } : {}),
    };
  }
  const raw = (d?.data ?? d) as Record<string, any> | null;
  return {
    provider: 'fez',
    status: 'in_transit',
    statusLabel: legacyLabel(raw),
    trackingUrl: null,
    rider: null,
    timeline: [],
  };
};
