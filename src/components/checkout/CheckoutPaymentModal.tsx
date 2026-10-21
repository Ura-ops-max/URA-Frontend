import { useCallback, useEffect, useRef, useState } from 'react';
import { X, Check, Loader2, Wallet, ShieldCheck, CreditCard, Info } from 'lucide-react';
import { toast } from 'sonner';
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
import { Button } from '@/components/ui/button';
import CheckoutAd from '@/components/ads/CheckoutAd';
import { useWalletBalance } from '@/hooks/api/use-wallet-balance';
import {
  paymentsApi,
  paymentErrorMessage,
  type PaymentType,
  type StartPaymentResponse,
} from '@/lib/payments-api';

/**
 * One payment screen for both payment types. URA's backend creates the
 * escrow and returns the payment token; Payluk's Checkout SDK widget collects
 * the money over this page. Only the backend decides an order is paid (from
 * Payluk's webhook, or by checking with Payluk): after the widget reports
 * back, this screen asks the backend and waits.
 */
interface CheckoutPaymentModalProps {
  orderId: string;
  orderNumber?: string;
  paymentType: PaymentType;
  /** From POST /orders/:id/pay. */
  payment: StartPaymentResponse;
  /** Shop this order is with — used to fetch its checkout ad. */
  businessId?: string;
  onClose: () => void;
  /** Called once the backend reports the order paid. */
  onPaid: () => void;
}

type Phase = 'ready' | 'starting' | 'confirming' | 'paid' | 'slow';

const POLL_MS = 4_000;
const POLL_FOR_MS = 3 * 60_000;

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 2,
  }).format(n);

export default function CheckoutPaymentModal({
  orderId,
  orderNumber,
  paymentType,
  payment,
  businessId,
  onClose,
  onPaid,
}: CheckoutPaymentModalProps) {
  const [phase, setPhase] = useState<Phase>('ready');
  // While the Payluk widget is open we hide our overlay so it isn't covered.
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [walletBusy, setWalletBusy] = useState(false);
  const { pay } = useEscrowCheckout();
  const { data: wallet } = useWalletBalance(payment.customerId);

  const mountedRef = useRef(true);
  // The first attempt uses the reference we were given; later ones get a new
  // one from the backend (Payluk wants a unique reference per checkout).
  const usedFirstRef = useRef(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (pollTimer.current) clearTimeout(pollTimer.current);
    };
  }, []);

  const finishPaid = useCallback(() => {
    setPhase('paid');
    toast.success('Payment confirmed. Your order is being processed.');
    setTimeout(() => mountedRef.current && onPaid(), 1200);
  }, [onPaid]);

  // Ask URA's backend (which checks with Payluk) until the order is paid.
  const waitForConfirmation = useCallback(() => {
    setPhase('confirming');
    const until = Date.now() + POLL_FOR_MS;
    const check = async () => {
      if (!mountedRef.current) return;
      try {
        const s = await paymentsApi.status(orderId);
        if (s.paymentStatus === 'paid') return finishPaid();
      } catch {
        /* network blip: keep waiting */
      }
      if (Date.now() >= until) {
        if (mountedRef.current) setPhase('slow');
        return;
      }
      pollTimer.current = setTimeout(() => void check(), POLL_MS);
    };
    void check();
  }, [orderId, finishPaid]);

  // ── Main button: Payluk's Checkout SDK widget ─────────────────────────────
  const payWithWidget = async () => {
    if (typeof pay !== 'function') {
      toast.error('Payment window not ready. Refresh the page and try again.');
      return;
    }
    setPhase('starting');
    let attempt = payment;
    try {
      if (usedFirstRef.current) attempt = await paymentsApi.start(orderId);
      usedFirstRef.current = true;
    } catch (err: any) {
      setPhase('ready');
      if (err?.response?.data?.code === 'ALREADY_PAID') return finishPaid();
      toast.error(paymentErrorMessage(err, 'Could not start the payment. Please try again.'));
      return;
    }

    setWidgetOpen(true);
    try {
      await pay({
        paymentToken: attempt.paymentToken,
        reference: attempt.reference,
        redirectUrl: `${window.location.origin}/payment-complete?orderId=${encodeURIComponent(orderId)}`,
        brand: 'URA',
        logoUrl: `${window.location.origin}/icon-192.png`,
        customerId: attempt.customerId,
        // The widget says it's done: the backend still has to confirm it.
        callback: () => {
          setWidgetOpen(false);
          waitForConfirmation();
        },
        onClose: () => {
          setWidgetOpen(false);
          setPhase('ready');
          toast.info('Payment window closed. Your order is saved; you can pay again.');
        },
      });
    } catch (err: any) {
      console.error('[checkout] Payluk widget failed to open:', err?.code ?? err);
      setWidgetOpen(false);
      setPhase('ready');
      toast.error(err?.message || 'Could not open the payment window. Please try again.');
    }
  };

  // ── Pay from wallet: only when the balance covers it, only on a tap ───────
  const canPayFromWallet = (wallet?.mainBalance ?? 0) >= payment.amountToPay;
  const payWithWallet = async () => {
    if (walletBusy) return;
    setWalletBusy(true);
    try {
      const s = await paymentsApi.payFromWallet(orderId);
      if (s.paymentStatus === 'paid') finishPaid();
      else waitForConfirmation();
    } catch (err: any) {
      if (err?.response?.data?.code === 'ALREADY_PAID') return finishPaid();
      toast.error(paymentErrorMessage(err, 'Could not pay from your wallet. Please try again.'));
    } finally {
      if (mountedRef.current) setWalletBusy(false);
    }
  };

  const { breakdown } = payment;
  const busy = phase === 'starting' || phase === 'confirming' || walletBusy;
  const showChoices = phase === 'ready' || phase === 'starting';

  return (
    <div
      // Phones: a sheet from the bottom. Larger screens: centred.
      className={`fixed inset-0 z-50 items-end justify-center sm:items-center sm:p-4 bg-black/40 backdrop-blur-sm ${
        widgetOpen ? 'hidden' : 'flex'
      }`}
      onClick={busy ? undefined : onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92dvh] overflow-y-auto pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 h-1.5 bg-linear-to-r from-orange-500 to-orange-400" />

        {!busy && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 z-10 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-5 sm:p-8">
          {/* Grab handle (phones) */}
          <div className="mx-auto -mt-1 mb-4 h-1.5 w-10 rounded-full bg-gray-200 sm:hidden" aria-hidden />
          <div className="flex items-center gap-4 mb-6 pr-8">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-orange-500" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Complete Payment</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
                {paymentType === 'normal' ? 'Normal Payment' : 'Buyer-Protected Payment'}
                {orderNumber ? ` · ${orderNumber}` : ''}
              </p>
            </div>
          </div>

          {/* Breakdown */}
          <dl className="mb-6 space-y-2 rounded-2xl bg-gray-50 px-4 py-3 text-sm">
            <Row label="Items" value={formatNaira(breakdown.items)} />
            {breakdown.delivery > 0 && <Row label="Delivery" value={formatNaira(breakdown.delivery)} />}
            {breakdown.serviceFee > 0 && <Row label="Service fee" value={formatNaira(breakdown.serviceFee)} />}
            <div className="flex items-baseline justify-between border-t border-gray-200 pt-2">
              <dt className="text-[10px] font-black uppercase tracking-widest text-orange-500">Total</dt>
              <dd className="text-xl font-black text-orange-600">{formatNaira(breakdown.total)}</dd>
            </div>
          </dl>

          {phase === 'confirming' && (
            <div className="py-8 flex flex-col items-center gap-3 text-gray-500" role="status">
              <Loader2 className="h-7 w-7 animate-spin text-orange-400" />
              <p className="text-sm font-bold">Confirming your payment...</p>
              <p className="text-xs text-gray-400 text-center">This usually takes a few seconds.</p>
            </div>
          )}

          {phase === 'slow' && (
            <div className="py-6 flex flex-col items-center gap-3 text-center" role="status">
              <p className="text-sm font-bold text-gray-900">We're still confirming your payment</p>
              <p className="text-xs text-gray-500">
                You'll get a notice as soon as it's confirmed. You don't need to pay again.
              </p>
              <Button onClick={onPaid} className="mt-2 rounded-xl bg-gray-900 hover:bg-black">
                Go to my order
              </Button>
            </div>
          )}

          {phase === 'paid' && (
            <div className="py-8 flex flex-col items-center gap-3" role="status">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
                <Check className="h-7 w-7 text-green-500" />
              </div>
              <p className="text-sm font-black text-gray-900">Payment confirmed!</p>
              <p className="text-xs text-gray-400 text-center">Your order is being processed.</p>
            </div>
          )}

          {showChoices && (
            <>
              <Button
                onClick={() => void payWithWidget()}
                disabled={busy}
                className="w-full h-14 rounded-xl font-bold gap-2 bg-orange-500 hover:bg-orange-600 text-base disabled:opacity-50"
              >
                {phase === 'starting' ? <Loader2 className="animate-spin" size={18} /> : <CreditCard size={18} />}
                Pay {formatNaira(payment.amountToPay)}
              </Button>
              <p className="mt-2 text-center text-[11px] text-gray-400">
                Pay securely with Payluk without leaving URA.
              </p>

              {canPayFromWallet && (
                <div className="mt-5 rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-500">
                      <Wallet size={16} className="text-orange-500" />
                      Wallet balance
                    </span>
                    <span className="text-sm font-black text-gray-900">
                      {formatNaira(wallet?.mainBalance ?? 0)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void payWithWallet()}
                    disabled={busy}
                    className="w-full h-12 rounded-xl font-bold gap-2 border-gray-200"
                  >
                    {walletBusy ? <Loader2 className="animate-spin" size={16} /> : <Wallet size={16} />}
                    Pay from wallet
                  </Button>
                </div>
              )}

              {paymentType === 'normal' ? (
                <p className="mt-5 flex items-start gap-2 rounded-xl bg-amber-50 px-3 py-2.5 text-xs leading-relaxed text-amber-800">
                  <Info size={14} className="mt-0.5 shrink-0" />
                  Normal Payment goes straight to the seller. For protection, choose Buyer-Protected
                  Payment.
                </p>
              ) : (
                <div className="mt-5 flex items-center justify-center gap-2 text-gray-400">
                  <ShieldCheck size={14} className="text-blue-400" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Held safely until you confirm delivery
                  </span>
                </div>
              )}
            </>
          )}

          {(showChoices || phase === 'confirming') && <CheckoutAd businessId={businessId} compact />}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="font-semibold text-gray-900">{value}</dd>
    </div>
  );
}
