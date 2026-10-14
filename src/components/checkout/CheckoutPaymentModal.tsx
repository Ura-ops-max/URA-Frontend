import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Check, Loader2, Wallet, ShieldCheck, CreditCard } from 'lucide-react';
import { toast } from 'sonner';
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
import { Button } from '@/components/ui/button';
import paylukAPI from '@/lib/payluk-axios';
import { BASE_ROUTE } from '@/routes/common/routePaths.ts';
import CheckoutAd from '@/components/ads/CheckoutAd';

interface CheckoutPaymentModalProps {
  /** The BUYER's Payluk customer id. */
  customerId: string;
  /** Payluk escrow id for this order — the seller's receiving escrow. */
  escrowId: string;
  /** Payluk payment token — powers the inline (popup) card/bank checkout. */
  paymentToken?: string;
  /**
   * Which payment type the buyer chose. Both use this same screen (wallet or
   * card); they differ only in who pays Payluk's fee.
   */
  mode: 'normal' | 'escrow';
  /** Finalised total the buyer must pay (product + delivery + Payluk fee). */
  amount: number;
  /** Our order id — used to build a unique payment reference. */
  orderId: string;
  orderNumber?: string;
  /** Shop this order is with — used to fetch its checkout ad. */
  businessId?: string;
  onClose: () => void;
  /** Called once the escrow has been settled (order is paid). */
  onPaid: () => void;
}

type Phase = 'loading' | 'ready' | 'settling' | 'paid';

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function CheckoutPaymentModal({
  customerId,
  escrowId,
  paymentToken,
  mode,
  amount,
  orderId,
  orderNumber,
  businessId,
  onClose,
  onPaid,
}: CheckoutPaymentModalProps) {
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  // While the Payluk popup is open we hide our own overlay so it isn't covered.
  const [popupActive, setPopupActive] = useState(false);
  const { pay } = useEscrowCheckout();

  const settlingRef = useRef(false);
  const mountedRef = useRef(true);
  // ── Read the buyer's wallet balance (null if it couldn't be read).
  const fetchBalance = useCallback(async (): Promise<number | null> => {
    try {
      const { data } = await paylukAPI.get('/wallet', {
        headers: { 'customer-id': customerId },
      });
      const payload = data?.data ?? data;
      const balance = Number(payload?.mainBalance ?? payload?.balance ?? 0);
      if (mountedRef.current) setWalletBalance(balance);
      return balance;
    } catch {
      if (mountedRef.current) setWalletBalance((b) => b ?? 0);
      return null;
    }
  }, [customerId]);

  // ── Pay this escrow from the buyer's wallet balance (only on a tap). Payluk's
  // webhook flips the order to paid on our backend. Guarded against double taps.
  const settleFromWallet = useCallback(async () => {
    if (settlingRef.current) return;
    settlingRef.current = true;
    setPhase('settling');
    try {
      await paylukAPI.post(
        '/payment/escrow',
        {
          amount,
          reference: `order_${orderId}_${Date.now()}`,
          gateway: 'wallet',
          transactionType: 'escrow',
          escrowDetails: { escrowId: [escrowId] },
        },
        { headers: { 'customer-id': customerId } },
      );
      if (!mountedRef.current) return;
      setPhase('paid');
      toast.success('Payment received — your order is being processed.');
      onPaid();
    } catch (err: any) {
      settlingRef.current = false;
      if (!mountedRef.current) return;
      setPhase('ready');
      const msg = err?.response?.data?.message ?? '';
      toast.error(
        /insufficient|balance/i.test(msg)
          ? 'Your wallet balance is not enough for this order. Pay by card instead.'
          : msg || 'Could not complete the payment. Please try again.',
      );
    }
  }, [amount, orderId, escrowId, customerId, onPaid]);

  // "Pay by card" — opens Payluk's secure window, because card numbers must go
  // into a certified payment page. It settles this same escrow, so the webhook
  // marks the order paid the same way. Offered for both payment types.
  const payWithPopup = useCallback(async () => {
    if (!paymentToken) {
      toast.error('Card payment is unavailable for this order. Please try checking out again.');
      return;
    }
    if (typeof pay !== 'function') {
      toast.error('Payment widget not ready. Refresh the page and try again.');
      return;
    }
    // Hide our modal so the Payluk checkout isn't covered by our z-50 overlay.
    setPopupActive(true);
    try {
      await pay({
        paymentToken,
        reference: `pop_${orderId}_${Date.now()}`,
        redirectUrl: `${window.location.origin}${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}`,
        brand: import.meta.env.VITE_APP_NAME ?? 'URA',
        customerId,
        callback: () => {
          setPopupActive(false);
          setPhase('paid');
          toast.success('Payment successful — your order is being processed.');
          onPaid();
        },
        onClose: () => {
          setPopupActive(false);
          toast.info('Payment window closed.');
        },
      });
    } catch (err: any) {
      console.error('[checkout] payWithPopup failed:', err);
      setPopupActive(false);
      toast.error(err?.message || 'Could not open the payment window. Please try again.');
    }
  }, [paymentToken, pay, orderId, customerId, onPaid]);

  // Initial load: the wallet balance. Payluk no longer issues bank-transfer
  // (virtual) accounts (CBN rule), so there is no transfer panel or polling.
  const didInit = useRef(false);
  useEffect(() => {
    mountedRef.current = true;
    if (!didInit.current) {
      didInit.current = true;
      fetchBalance().finally(() => {
        if (mountedRef.current) setPhase('ready');
      });
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchBalance]);

  const busy = phase === 'settling' || phase === 'loading';
  const canPayFromWallet = walletBalance != null && walletBalance >= amount;

  return (
    <div
      className={`fixed inset-0 z-50 items-center justify-center p-4 bg-black/40 backdrop-blur-sm ${
        popupActive ? 'hidden' : 'flex'
      }`}
      onClick={busy ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 h-1.5 bg-linear-to-r from-orange-500 to-orange-400" />

        {!busy && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Complete Payment</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {orderNumber
                  ? `Order ${orderNumber}`
                  : mode === 'normal'
                    ? 'Normal Payment'
                    : 'Buyer-Protected Payment'}
              </p>
            </div>
          </div>

          {/* Amount */}
          <div className="mb-6 flex items-baseline justify-between rounded-2xl bg-orange-50 px-4 py-3">
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">
              Total to pay
            </span>
            <span className="text-xl sm:text-2xl font-black text-orange-600">
              {formatNaira(amount)}
            </span>
          </div>

          {phase === 'loading' && (
            <div className="py-10 flex flex-col items-center gap-3 text-gray-400">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <p className="text-xs font-bold uppercase tracking-widest">Preparing payment…</p>
            </div>
          )}

          {phase === 'paid' && (
            <div className="py-10 flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-sm font-black text-gray-900">Payment confirmed!</p>
              <p className="text-xs text-gray-400 text-center">Your order is being processed.</p>
            </div>
          )}

          {/* ── Both payment types: wallet or card ── */}
          {(phase === 'ready' || phase === 'settling') && (
            <>
              <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                {mode === 'normal'
                  ? 'No extra fee for you.'
                  : 'Buyer-Protected Payment: your money is held safely until you confirm delivery.'}
              </p>
              {/* ── Option 1: Pay from wallet ───────────────────────── */}
              <div className="rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-500">
                    <Wallet size={16} className="text-orange-500" />
                    Wallet balance
                  </span>
                  <span className="text-sm font-black text-gray-900">
                    {walletBalance == null ? '—' : formatNaira(walletBalance)}
                  </span>
                </div>
                <Button
                  onClick={() => void settleFromWallet()}
                  disabled={!canPayFromWallet || busy}
                  className="w-full h-12 rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50"
                >
                  {phase === 'settling' ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <Wallet size={16} />
                  )}
                  Pay {formatNaira(amount)} from Wallet
                </Button>
                {!canPayFromWallet && walletBalance != null && (
                  <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400">
                    Not enough balance — pay by card instead.
                  </p>
                )}
              </div>

              {/* ── Option 2: Card (Payluk's secure window) ───────────── */}
              {paymentToken && (
                <div className="mt-5">
                  <Button
                    variant="outline"
                    onClick={() => void payWithPopup()}
                    disabled={busy}
                    className="w-full h-12 rounded-xl font-bold gap-2 border-gray-200"
                  >
                    <CreditCard size={16} />
                    Pay by card
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-gray-400">
                    Opens Payluk's secure card window.
                  </p>
                </div>
              )}

              <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                <ShieldCheck size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {mode === 'normal'
                    ? 'Released to the shop when you confirm delivery'
                    : 'Held safely until you confirm delivery'}
                </span>
              </div>
            </>
          )}

          {(phase === 'ready' || phase === 'settling') && (
            <CheckoutAd businessId={businessId} compact />
          )}
        </div>
      </div>
    </div>
  );
}
