// The one place the Payluk Checkout SDK is set up. Only the PUBLISHABLE key
// (pk_...) is used in the browser; secret keys stay on URA's backend.
import { useEffect } from 'react';
import { initEscrowCheckout } from 'payluk-escrow-inline-checkout';

const PaylukInit = () => {
  useEffect(() => {
    const publicKey = import.meta.env.VITE_PAYLUK_PUBLIC_KEY;
    if (!publicKey) {
      console.warn('[payluk] VITE_PAYLUK_PUBLIC_KEY is not set; the payment widget is disabled.');
      return;
    }
    initEscrowCheckout({ publicKey });
  }, []);
  return null;
};

export default PaylukInit;
