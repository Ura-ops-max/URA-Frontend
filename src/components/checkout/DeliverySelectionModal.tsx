import { useState } from 'react';
import { X, Truck, Store, Loader2, ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';

type PayMode = 'normal' | 'escrow';

interface DeliverySelectionModalProps {
  /** Product subtotal (no delivery). */
  productTotal: number;
  /** Fez delivery fee for the chosen state, or null if unavailable/not loaded. */
  deliveryFee: number | null;
  deliveryLoading: boolean;
  deliveryError: string | null;
  /** Called with the buyer's choices: delivery method + payment type. */
  onSelect: (withDelivery: boolean, mode: PayMode) => void;
  onClose: () => void;
}

const formatNaira = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

export default function DeliverySelectionModal({
  productTotal,
  deliveryFee,
  deliveryLoading,
  deliveryError,
  onSelect,
  onClose,
}: DeliverySelectionModalProps) {
  const [step, setStep] = useState<'delivery' | 'payment'>('delivery');
  const [withDelivery, setWithDelivery] = useState(false);

  const canDeliver = deliveryFee != null && deliveryFee > 0;
  const deliveryTotal = productTotal + (deliveryFee ?? 0);

  const chooseDelivery = (opt: boolean) => {
    setWithDelivery(opt);
    setStep('payment');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-linear-to-r from-orange-500 to-orange-400" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* ── Step 1: Delivery ─────────────────────────────────────── */}
        {step === 'delivery' && (
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-black text-gray-900">How would you like to receive it?</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Choose a fulfilment method — this sets your total.
            </p>

            <button
              onClick={() => canDeliver && chooseDelivery(true)}
              disabled={!canDeliver}
              className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-orange-500 hover:bg-orange-50/40 disabled:opacity-60 disabled:hover:border-gray-100 disabled:hover:bg-transparent disabled:cursor-not-allowed mb-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <Truck className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">With Delivery</p>
                {deliveryLoading ? (
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                    <Loader2 className="h-3 w-3 animate-spin" /> Getting delivery fee…
                  </span>
                ) : canDeliver ? (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {formatNaira(productTotal)} + {formatNaira(deliveryFee!)} delivery
                  </p>
                ) : (
                  <p className="text-xs text-amber-600 mt-0.5">
                    {deliveryError || 'Select your state on the previous screen first.'}
                  </p>
                )}
              </div>
              <div className="text-right">
                {canDeliver && (
                  <p className="text-base font-black text-orange-600">{formatNaira(deliveryTotal)}</p>
                )}
                <ChevronRight className="ml-auto h-4 w-4 text-gray-300 group-hover:text-orange-500" />
              </div>
            </button>

            <button
              onClick={() => chooseDelivery(false)}
              className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-gray-900 hover:bg-gray-50"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <Store className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">Without Delivery</p>
                <p className="text-xs text-gray-500 mt-0.5">Pickup or arrange delivery yourself, no delivery fee</p>
              </div>
              <div className="text-right">
                <p className="text-base font-black text-gray-900">{formatNaira(productTotal)}</p>
                <ChevronRight className="ml-auto h-4 w-4 text-gray-300 group-hover:text-gray-900" />
              </div>
            </button>
          </div>
        )}

        {/* ── Step 2: Payment type ─────────────────────────────────── */}
        {step === 'payment' && (
          <div className="p-6 sm:p-8">
            <button
              onClick={() => setStep('delivery')}
              className="mb-3 text-xs font-bold text-gray-400 hover:text-gray-600"
            >
              ← Delivery
            </button>
            <h2 className="text-lg font-black text-gray-900">How would you like to pay?</h2>
            <p className="text-sm text-gray-500 mt-1 mb-6">
              Total{' '}
              <span className="font-bold text-gray-700">
                {formatNaira(withDelivery ? deliveryTotal : productTotal)}
              </span>
              {' '}· {withDelivery ? 'with delivery' : 'no delivery'}
            </p>

            {/* Normal — no add-on fee for the buyer */}
            <button
              onClick={() => onSelect(withDelivery, 'normal')}
              className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-gray-900 hover:bg-gray-50 mb-3"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-white">
                <CreditCard className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">Normal Payment</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Instant checkout, no extra fee — card, transfer or USSD
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-900" />
            </button>

            {/* Escrow — protected, buyer covers the fee */}
            <button
              onClick={() => onSelect(withDelivery, 'escrow')}
              className="group w-full flex items-center gap-4 rounded-2xl border-2 border-gray-100 p-4 text-left transition hover:border-orange-500 hover:bg-orange-50/40"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-gray-900">Buyer-Protected Payment</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Your money is held safely until you confirm you got your order (small fee).
                </p>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-orange-500" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
