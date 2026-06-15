// src/components/PaylukInit.tsx
import { useEffect } from 'react';
import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

const PaylukInit = () => {
  useEffect(() => {
    initEscrowCheckout({
      publicKey: import.meta.env.VITE_PAYLUK_PUBLIC_KEY,
    });
  }, []);
  return null;
};

export default PaylukInit;
