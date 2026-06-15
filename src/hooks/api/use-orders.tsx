import { useState, useEffect } from 'react';
import { orderAPI } from '@/lib/api';

export const useOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const response = await orderAPI.getMyOrders();
      setOrders(response.data?.orders ?? response.data ?? []);
    } catch (err) {
      console.error('Order fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, isLoading, refreshOrders: fetchOrders };
};
