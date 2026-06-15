import { useState } from 'react';
import AuthPopup from '@/components/homepage/AuthPopup';

export default function useAuthGuard(isLoggedIn: boolean) {
  const [open, setOpen] = useState(false);

  const requireAuth = (callback?: () => void) => {
    if (!isLoggedIn) {
      setOpen(true);
      return false;
    }

    callback?.();
    return true;
  };

  const popup = <AuthPopup open={open} onClose={() => setOpen(false)} />;

  return { requireAuth, popup };
}
