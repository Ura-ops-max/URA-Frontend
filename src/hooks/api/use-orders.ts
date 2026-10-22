import { useQuery } from '@tanstack/react-query';
import { orderAPI } from '@/lib/api';
import type { ListOrder } from '@/lib/order-lists';

/** My Orders: what I bought (cancelled orders are left out by the server). */
export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async (): Promise<ListOrder[]> => {
      const { data } = await orderAPI.getMyOrders();
      return data?.orders ?? data ?? [];
    },
    staleTime: 30_000,
  });
}

/** Shop Orders: paid orders customers placed with my shop. */
export function useShopOrders(enabled = true) {
  return useQuery({
    queryKey: ['orders', 'shop'],
    queryFn: async (): Promise<ListOrder[]> => (await orderAPI.getReceivedOrders()).data?.orders ?? [],
    enabled,
    staleTime: 30_000,
  });
}
