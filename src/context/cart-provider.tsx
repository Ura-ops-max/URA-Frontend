import React, { createContext, useContext, useMemo } from 'react';
import { useCart as useCartHook } from '@/hooks/api/use-cart'; // The hook we created earlier
import { useAuthContext } from './auth-provider';

type CartContextType = ReturnType<typeof useCartHook>;

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const cartMethods = useCartHook();

  // If user isn't logged in, we override the count to 0
  const value = useMemo(
    () => ({
      ...cartMethods,
      totalItems: isAuthenticated ? cartMethods.totalItems : 0,
    }),
    [cartMethods, isAuthenticated],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCartContext = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCartContext must be used within a CartProvider');
  return context;
};
