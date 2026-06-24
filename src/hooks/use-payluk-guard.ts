import { useState, useCallback } from 'react';
import { useAuthContext } from '@/context/auth-provider';
import API from '@/lib/axios-client';
import { toast } from 'sonner';

/**
 * Guards any action that requires the user to have a Payluk payment profile.
 *
 * If the user has no profile yet but already has a valid phone on file, the
 * profile is created SILENTLY in the background (no modal) and then the action
 * runs — so e.g. "Fund Wallet" goes straight to generating the account. The
 * manual phone modal only appears as a fallback when there's no usable phone.
 *
 * Usage:
 *   const { guard, showModal, onModalSuccess, onModalDismiss } = usePaylukGuard();
 *   guard(() => submitCheckout());
 *   {showModal && <PaylukOnboardingModal onSuccess={onModalSuccess} onDismiss={onModalDismiss} />}
 */
export function usePaylukGuard() {
  const { user, refetchAuth } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const phoneOnFile = ((user as any)?.phone || '').trim();
  const phoneValid = /^0[789][01]\d{8}$/.test(phoneOnFile);

  const guard = useCallback(
    async (action: () => void) => {
      if (user?.paylukCustomerId) {
        action();
        return;
      }

      // No profile yet. If we have a valid phone + name, set it up silently.
      if (phoneValid && user?.firstName?.trim()) {
        setIsSettingUp(true);
        const toastId = toast.loading('Setting up your wallet…');
        try {
          await API.post('/onboarding/setup-payment-profile', { phone: phoneOnFile });
        } catch (error) {
          const msg = (error as any)?.response?.data?.message?.toLowerCase() || '';
          // "already exists" means the profile is fine — anything else is a real failure.
          if (!msg.includes('already')) {
            toast.error('Could not set up your payment profile. Please try again.', { id: toastId });
            setIsSettingUp(false);
            return;
          }
        }
        await refetchAuth();
        toast.dismiss(toastId);
        setIsSettingUp(false);
        // Let the refetched profile settle, then run the action.
        setTimeout(action, 600);
        return;
      }

      // Fallback: no usable phone on file → ask for it via the modal.
      setPendingAction(() => action);
      setShowModal(true);
    },
    [user?.paylukCustomerId, user?.firstName, phoneValid, phoneOnFile, refetchAuth],
  );

  const onModalSuccess = useCallback(() => {
    setShowModal(false);
    refetchAuth();
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(action, 600);
    }
  }, [pendingAction, refetchAuth]);

  const onModalDismiss = useCallback(() => {
    setShowModal(false);
    setPendingAction(null);
  }, []);

  return { guard, showModal, isSettingUp, onModalSuccess, onModalDismiss };
}
