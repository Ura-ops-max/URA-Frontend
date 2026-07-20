import API from '@/lib/axios-client';

export interface DeliveryCost {
  cost: number;
  vat: number;
  totalCost: number;
  state: string;
}

/**
 * Get a Fez delivery quote for a destination state.
 * `pickUpState` defaults to the seller/warehouse state on the backend.
 */
export const getDeliveryCost = async (params: {
  /** Buyer's destination state. */
  state: string;
  /** Identifies the seller — the backend reads their business profile for the pickup state. */
  productId?: string;
  businessId?: string;
  /** Explicit override; normally derived from the seller's profile. */
  pickUpState?: string;
  weight?: number;
}): Promise<DeliveryCost> => {
  const { data } = await API.post('/delivery/cost', params);
  return data.data as DeliveryCost;
};

export interface DeliveryTracking {
  status?: string;
  [key: string]: unknown;
}

export const trackDelivery = async (orderNumber: string): Promise<DeliveryTracking> => {
  const { data } = await API.get(`/delivery/track/${encodeURIComponent(orderNumber)}`);
  return data.data as DeliveryTracking;
};
