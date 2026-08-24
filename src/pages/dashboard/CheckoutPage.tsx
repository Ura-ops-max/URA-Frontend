import { useCartContext } from '@/context/cart-provider';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  ChevronLeft,
  Lock,
  Loader2,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/context/auth-provider';
import { toast } from 'sonner';
import API from '@/lib/axios-client';
import { getDeliveryCost } from '@/lib/delivery.service';
import { useWalletBalance } from '@/hooks/api/use-wallet-balance';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { NIGERIAN_STATES } from '@/lib/nigerian-states';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePaylukGuard } from '@/hooks/use-payluk-guard';
import PaylukOnboardingModal from '@/components/shared/PaylukOnboardingModal';
import DeliverySelectionModal from '@/components/checkout/DeliverySelectionModal';
import CheckoutPaymentModal from '@/components/checkout/CheckoutPaymentModal';

// ── Validation schema ───────────────────────────────
const shippingSchema = z.object({
  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number (e.g. +2348012345678)'),
  // City & street address are temporarily hidden — kept optional so the form
  // still submits. Re-enable the fields + these validations to bring them back.
  state: z.string().min(1, 'Please select your state'),
  city: z.string().max(100, 'City name is too long').optional().or(z.literal('')),
  fullAddress: z.string().max(200, 'Address is too long').optional().or(z.literal('')),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// ──────────────────────────────────────────────────
const CheckoutPage = () => {
  const { cart, totalPrice } = useCartContext();
  const { user, related } = useAuthContext();
  // Shown during checkout so the buyer can see what they have to pay with.
  const { data: wallet, isLoading: walletLoading } = useWalletBalance(user?.paylukCustomerId);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  // Flow: "Proceed to Pay" → stash the validated form + open the delivery
  // chooser → create the escrow order for the chosen total → open the payment
  // modal (wallet or bank transfer).
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [pendingForm, setPendingForm] = useState<ShippingFormValues | null>(null);
  const [transfer, setTransfer] = useState<{
    customerId: string;
    escrowId: string;
    paymentToken: string;
    amount: number;
    orderId: string;
    orderNumber?: string;
    mode: 'normal' | 'escrow';
  } | null>(null);
  const { guard, showModal, onModalSuccess, onModalDismiss } = usePaylukGuard();
  const hasShippingAddress = !!(
    user?.shippingAddress?.fullAddress &&
    user?.shippingAddress?.city &&
    user?.shippingAddress?.phone
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { phone: '', state: '', city: '', fullAddress: '' },
  });

  // ── Auto-fill from saved profile data ────────────────────────────────────
  // Prefer the buyer's own saved shipping address; fall back to their business
  // account's address/contact. `user` loads async, so reset() once it arrives.
  const business = (related as any)?.businesses?.[0];

  useEffect(() => {
    if (!user) return;
    const ship = (user as any)?.shippingAddress ?? {};
    const bizAddr = business?.address ?? {};
    const bizContact = business?.contact ?? {};

    reset({
      phone: ship.phone || (user as any)?.phone || bizContact.phone || '',
      state: ship.state || bizAddr.state || '',
      city: ship.city || bizAddr.city || '',
      fullAddress: ship.fullAddress || bizAddr.street || bizAddr.fullAddress || '',
    });
  }, [user, business, reset]);

  // Live Fez delivery quote for the selected destination state.
  const selectedState = watch('state');
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  // The seller is resolved from the product — the backend reads their business
  // profile address to use as the Fez pickup state.
  const firstProductId = cart?.items?.[0]?.product?._id;

  useEffect(() => {
    if (!selectedState || !firstProductId) {
      setDeliveryFee(null);
      setDeliveryError(null);
      return;
    }
    let active = true;
    setDeliveryLoading(true);
    setDeliveryError(null);
    setDeliveryFee(null);

    // Hard safety net: never let the row hang on "Calculating…" — if the quote
    // hasn't resolved in 15s, show an error instead.
    const timeout = setTimeout(() => {
      if (!active) return;
      active = false;
      setDeliveryLoading(false);
      setDeliveryError('Delivery quote timed out. Please try again.');
    }, 15000);

    getDeliveryCost({ state: selectedState, productId: firstProductId })
      .then((quote) => {
        if (!active) return;
        const fee = quote?.totalCost ?? quote?.cost;
        if (fee != null && fee > 0) {
          setDeliveryFee(fee);
        } else {
          setDeliveryError(`Delivery to ${selectedState} isn't available right now.`);
        }
      })
      .catch((err) => {
        if (!active) return;
        setDeliveryFee(null);
        const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
        setDeliveryError(msg || 'Delivery fee unavailable right now.');
      })
      .finally(() => {
        if (active) setDeliveryLoading(false);
        clearTimeout(timeout);
      });
    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [selectedState, firstProductId]);

  const orderTotal = totalPrice + (deliveryFee ?? 0);

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);

  // Step 1 — "Proceed to Pay": validate the form, ensure the buyer has a Payluk
  // profile, then prompt for the fulfilment method (delivery vs pickup).
  const onProceed = (formData: ShippingFormValues) => {
    guard(() => {
      setPendingForm(formData);
      setShowDeliveryModal(true);
    });
  };

  // Step 2 — after the buyer picks delivery + payment type: create the order for
  // the chosen total & fee model, then open the matching payment UI.
  const createOrderAndPay = async (
    formData: ShippingFormValues,
    withDelivery: boolean,
    mode: 'normal' | 'escrow',
  ) => {
    setIsLoading(true);
    try {
      const response = await API.post('/orders', {
        shippingAddress: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
        },
        // With delivery adds the Fez fee; without delivery charges product only.
        deliveryFee: withDelivery ? (deliveryFee ?? 0) : 0,
        deliveryMethod: withDelivery ? 'delivery' : 'pickup',
        paymentMethod: mode === 'normal' ? 'card' : 'escrow',
        // 'normal' → seller absorbs Payluk's fee (buyer pays clean price).
        escrowMode: mode,
      });

      const { escrowId, customerId, payableAmount, paymentToken } = response.data?.payluk || {};
      const order = response.data?.order;
      const buyerCustomerId = user?.paylukCustomerId ?? customerId;

      if (!escrowId || !buyerCustomerId) {
        toast.error('Could not start payment. Please try again.');
        return;
      }

      // Persist shipping address for next time (fire-and-forget).
      API.patch('/users/me/shipping', {
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        fullAddress: formData.fullAddress,
      }).catch((e) => console.warn('[checkout] shipping save failed:', e));

      setTransfer({
        customerId: buyerCustomerId,
        escrowId,
        paymentToken: paymentToken ?? '',
        amount: payableAmount ?? (withDelivery ? orderTotal : totalPrice),
        orderId: order._id,
        orderNumber: order.orderNumber,
        mode,
      });
    } catch (error: any) {
      const code = error?.response?.data?.code;
      if (code === 'PAYLUK_PROFILE_REQUIRED') {
        onModalDismiss();
        guard(() => {});
        return;
      }
      if (code === 'PRODUCT_NOT_AVAILABLE' || code === 'PAYLUK_SETUP_REQUIRED') {
        toast.info('This product is not yet available for purchase.');
        return;
      }
      toast.error(error?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeliveryChoice = (withDelivery: boolean, mode: 'normal' | 'escrow') => {
    setShowDeliveryModal(false);
    if (pendingForm) createOrderAndPay(pendingForm, withDelivery, mode);
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12 bg-white">
        {/* Header */}
        <div className="mb-10">
          <Link
            to="/dashboard/product/cart"
            className="flex items-center gap-2 text-gray-400 hover:text-orange-600 transition-colors mb-4 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={16} /> Back to Cart
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Finalize Order</h1>
        </div>

        {/* handleSubmit wraps the entire layout so the Pay button submits the form */}
        <form onSubmit={handleSubmit(onProceed)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-8 lg:space-y-12">
              {/* Shipping */}
              <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-sm">
                    1
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Shipping Details</h2>
                </div>

                {!hasShippingAddress && (
                  <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200">
                    <AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs font-semibold text-amber-700">
                      Add your delivery details below and we'll save them, so next time checkout is
                      one tap.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full name — read-only, not part of form schema */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Full Name
                    </label>
                    <Input
                      value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
                      readOnly
                      className="h-12 rounded-xl border-gray-100 bg-gray-50"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Phone Number
                    </label>
                    <Input
                      {...register('phone')}
                      placeholder="+2348012345678"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white ${
                        errors.phone ? 'border-red-400 focus-visible:ring-red-400' : ''
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 font-semibold ml-1">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* State (used for delivery quote) */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      State
                    </label>
                    <select
                      {...register('state')}
                      className={`h-12 w-full rounded-xl border bg-gray-50 px-3 text-sm focus:bg-white ${
                        errors.state ? 'border-red-400' : 'border-gray-100'
                      }`}
                    >
                      <option value="">Select your state…</option>
                      {NIGERIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="text-[11px] text-red-500 font-semibold ml-1">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  {/* City & Street Address temporarily hidden.
                      To re-enable, uncomment these blocks and restore the
                      required validations in shippingSchema above. */}
                  {/* City
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      City
                    </label>
                    <Input
                      {...register('city')}
                      placeholder="Lagos"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white ${
                        errors.city ? 'border-red-400 focus-visible:ring-red-400' : ''
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-500 font-semibold ml-1">
                        {errors.city.message}
                      </p>
                    )}
                  </div>
                  */}

                  {/* Street address
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">
                      Street Address
                    </label>
                    <Input
                      {...register('fullAddress')}
                      placeholder="123 Business Way, Ikeja"
                      className={`h-12 rounded-xl border-gray-100 bg-gray-50 focus:bg-white ${
                        errors.fullAddress ? 'border-red-400 focus-visible:ring-red-400' : ''
                      }`}
                    />
                    {errors.fullAddress && (
                      <p className="text-[11px] text-red-500 font-semibold ml-1">
                        {errors.fullAddress.message}
                      </p>
                    )}
                  </div>
                  */}
                </div>
              </section>

              {/* Payment placeholder */}
              <section className="space-y-6 opacity-60">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center font-black text-sm">
                    2
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Payment Method</h2>
                </div>
                <div className="p-6 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-center">
                  <CreditCard className="w-10 h-10 text-gray-300 mb-3" />
                  <p className="text-sm font-bold text-gray-500">
                    Secure Payment Gateway will open here
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">
                    Supports Cards, Bank Transfer & USSD
                  </p>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="lg:col-span-5">
              <div className="lg:sticky lg:top-24 bg-gray-50 rounded-3xl sm:rounded-4xl p-6 sm:p-8 border border-gray-100">
                <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-tight">
                  In Your Bag
                </h3>

                <div className="max-h-60 overflow-y-auto mb-8 space-y-4 pr-2">
                  {cart?.items.map((item: any) => (
                    <div key={item.product._id} className="flex gap-4">
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-gray-100 shrink-0">
                        <img
                          src={item.product.media[0]}
                          className="w-full h-full object-cover"
                          alt={item.product.name}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">
                          {item.product.name}
                        </p>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-black text-gray-900">
                        {formattedPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator className="mb-6 bg-gray-200" />

                <div className="space-y-3 mb-8">
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Subtotal</span>
                    <span>{formattedPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-gray-500">
                    <span>Delivery{selectedState ? ` · ${selectedState}` : ''}</span>
                    {deliveryLoading ? (
                      <span className="text-gray-400">Calculating…</span>
                    ) : deliveryFee != null ? (
                      <span>{formattedPrice(deliveryFee)}</span>
                    ) : deliveryError ? (
                      <span className="text-amber-600">Unavailable</span>
                    ) : (
                      <span className="text-gray-400">Select state</span>
                    )}
                  </div>
                  {deliveryError && (
                    <p className="text-xs leading-relaxed text-amber-600">{deliveryError}</p>
                  )}
                  <div className="flex justify-between items-baseline pt-4">
                    <span className="text-base font-black text-gray-900 uppercase">
                      Total Amount
                    </span>
                    <span className="text-2xl sm:text-3xl font-black text-orange-600">
                      {formattedPrice(orderTotal)}
                    </span>
                  </div>
                </div>

                {/* Wallet balance — so the buyer sees what they can pay with */}
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-100 bg-white px-4 py-3">
                  <span className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-gray-500">
                    <Wallet size={16} className="text-orange-500" />
                    Wallet balance
                  </span>
                  {walletLoading ? (
                    <span className="text-sm text-gray-400">Loading…</span>
                  ) : (
                    <span className="text-sm font-black text-gray-900">
                      {formattedPrice(wallet?.mainBalance ?? 0)}
                    </span>
                  )}
                </div>

                {/* Proceed to Pay — prompts for delivery choice, then payment */}
                <Button
                  type="button"
                  onClick={handleSubmit(onProceed)}
                  disabled={isLoading || !cart?.items?.length}
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base gap-3 px-3 transition-all active:scale-95 shadow-xl shadow-orange-200"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Lock size={18} />
                      Proceed to Pay
                    </>
                  )}
                </Button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400">
                  Choose delivery next, then pay from your wallet or by bank transfer.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                    <ShieldCheck size={18} className="text-blue-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase">
                      Buyer Protection
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                    <Truck size={18} className="text-orange-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase">
                      Fast Delivery
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {showModal && <PaylukOnboardingModal onSuccess={onModalSuccess} onDismiss={onModalDismiss} />}

      {showDeliveryModal && (
        <DeliverySelectionModal
          productTotal={totalPrice}
          deliveryFee={deliveryFee}
          deliveryLoading={deliveryLoading}
          deliveryError={deliveryError}
          onSelect={handleDeliveryChoice}
          onClose={() => setShowDeliveryModal(false)}
        />
      )}

      {transfer && (
        <CheckoutPaymentModal
          customerId={transfer.customerId}
          escrowId={transfer.escrowId}
          paymentToken={transfer.paymentToken}
          mode={transfer.mode}
          amount={transfer.amount}
          orderId={transfer.orderId}
          orderNumber={transfer.orderNumber}
          onClose={() => setTransfer(null)}
          onPaid={() => {
            setTransfer(null);
            navigate('/dashboard/orders');
          }}
        />
      )}
    </>
  );
};

export default CheckoutPage;
