import { useEffect } from 'react';
import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

export default function PaylukInit() {
  useEffect(() => {
    initEscrowCheckout({
      publicKey: import.meta.env.VITE_PAYLUK_PUBLIC_KEY,
    });
  }, []);
  return null;
}
