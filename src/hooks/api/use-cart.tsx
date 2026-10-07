import { useState, useEffect, useCallback } from 'react';
import { cartAPI } from '@/lib/api';
import { toast } from 'sonner';

export const useCart = () => {
  const [cart, setCart] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch Cart
  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await cartAPI.getCart();
      setCart(response.data);
    } catch (err) {
      console.error('Fetch cart error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Add to Cart
  const addItem = async (productId: string, quantity: number = 1) => {
    setIsUpdating(true);
    try {
      const response = await cartAPI.addToCart({ productId, quantity });
      setCart(response.data);
      toast.success('Added to cart', {
        action: {
          label: 'View cart',
          onClick: () => window.location.assign('/dashboard/product/cart'),
        },
      });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add item');
    } finally {
      setIsUpdating(false);
    }
  };

  // Update Quantity
  const updateQty = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    try {
      const response = await cartAPI.updateQuantity({ productId, quantity: newQuantity });
      setCart(response.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  // Remove Item
  const removeItem = async (productId: string) => {
    setIsUpdating(true);
    try {
      const response = await cartAPI.removeFromCart(productId);
      setCart(response.data);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    cart,
    totalItems: cart?.totalItems || 0, // This fuels your counter badge
    totalPrice: cart?.totalPrice || 0,
    isLoading,
    isUpdating,
    addItem,
    updateQty,
    removeItem,
    refreshCart: fetchCart,
  };
};
