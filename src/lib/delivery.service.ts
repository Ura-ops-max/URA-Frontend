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
  state: string;
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
