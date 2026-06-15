import { useState, useCallback } from 'react';
import { useAuthContext } from '@/context/auth-provider';

/**
 * Guards any action that requires the user to have a Payluk payment profile.
 *
 * Usage:
 *   const { guard, showModal, onModalSuccess, onModalDismiss } = usePaylukGuard();
 *
 *   // wrap an action:
 *   guard(() => submitCheckout());
 *
 *   // render the modal conditionally:
 *   {showModal && <PaylukOnboardingModal onSuccess={onModalSuccess} onDismiss={onModalDismiss} />}
 */
export function usePaylukGuard() {
  const { user, refetchAuth } = useAuthContext();
  const [showModal, setShowModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const guard = useCallback(
    (action: () => void) => {
      if (!user?.paylukCustomerId) {
        setPendingAction(() => action);
        setShowModal(true);
        return;
      }
      action();
    },
    [user?.paylukCustomerId],
  );

  const onModalSuccess = useCallback(() => {
    setShowModal(false);
    // Refetch so the user object in context has the new paylukCustomerId,
    // then run the pending action after a short delay for the refetch to settle.
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

  return { guard, showModal, onModalSuccess, onModalDismiss };
}
