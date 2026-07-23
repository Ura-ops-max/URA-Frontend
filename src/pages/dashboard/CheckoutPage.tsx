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
import paylukAPI from '@/lib/payluk-axios';
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
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
import { EscrowCheckoutError } from 'payluk-escrow-inline-checkout';
import { BASE_ROUTE } from '@/routes/common/routePaths.ts';
import { usePaylukGuard } from '@/hooks/use-payluk-guard';
import PaylukOnboardingModal from '@/components/shared/PaylukOnboardingModal';

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
  const [isEscrowLoading, setIsEscrowLoading] = useState(false);
  const { pay } = useEscrowCheckout();
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

  // handleSubmit from react-hook-form validates before this runs
  const onSubmit = (formData: ShippingFormValues) => {
    // Guard: user must have a Payluk payment profile before checking out
    guard(() => processCheckout(formData, true));
  };

  const processCheckout = async (formData: ShippingFormValues, withDelivery: boolean) => {
    setIsLoading(true);
    try {
      // Step 1: Create order on backend
      // Returns the product's pre-generated paymentToken and the SELLER's customerId
      const response = await API.post('/orders', {
        shippingAddress: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
        },
        // Direct payment excludes shipping; only the delivery option charges it.
        deliveryFee: withDelivery ? (deliveryFee ?? 0) : 0,
        deliveryMethod: withDelivery ? 'delivery' : 'pickup',
        paymentMethod: 'card',
      });

      const { paymentToken, customerId } = response.data?.payluk || {};
      const order = response.data?.order;

      if (!paymentToken) {
        toast.error('Could not get payment token. Please try again.');
        return;
      }

      // Persist shipping address back to user profile (fire-and-forget)
      API.patch('/users/me/shipping', {
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        fullAddress: formData.fullAddress,
      }).catch((e) => console.warn('[checkout] shipping save failed:', e));

      // Generate a unique reference for this payment attempt
      const reference = `${order._id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

      await pay({
        paymentToken,
        reference,
        redirectUrl: `${window.location.origin}${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}`,
        brand: import.meta.env.VITE_APP_NAME ?? 'Marketplace',
        customerId: user?.paylukCustomerId ?? customerId ?? undefined,
        callback: (result: any) => {
          console.log('✅ Payluk payment result:', result);
          toast.success('Payment successful! Your order is being processed.');
          navigate(
            `${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}?paymentId=${encodeURIComponent(result.paymentId)}`,
          );
        },
        onClose: () => {
          toast.info(
            'Payment cancelled. Your order has been saved — you can retry from your orders.',
          );
          navigate('/dashboard/orders');
        },
      });
    } catch (error: any) {
      console.error('Checkout error:', error);
      const code = error?.response?.data?.code;

      if (code === 'PAYLUK_PROFILE_REQUIRED') {
        // Backend guard triggered — open the onboarding modal
        onModalDismiss(); // reset any existing modal state
        guard(() => {}); // triggers the modal via the hook
        return;
      }

      if (code === 'PRODUCT_NOT_AVAILABLE' || code === 'PAYLUK_SETUP_REQUIRED') {
        toast.info('This product is not yet available for purchase.');
        return;
      }

      if (error instanceof EscrowCheckoutError) {
        toast.error(error.message || 'Payment gateway error. Please try again.');
        return;
      }

      toast.error(error?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const onEscrowSubmit = (formData: ShippingFormValues) => {
    guard(() => processEscrowCheckout(formData, true));
  };

  // Direct payment: no shipping charged, funds settle straight from the wallet.
  const onDirectPaySubmit = (formData: ShippingFormValues) => {
    guard(() => processEscrowCheckout(formData, false));
  };

  const processEscrowCheckout = async (formData: ShippingFormValues, withDelivery: boolean) => {
    setIsEscrowLoading(true);
    try {
      const response = await API.post('/orders', {
        shippingAddress: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          state: formData.state,
          phone: formData.phone,
        },
        // Direct payment excludes shipping; only the delivery option charges it.
        deliveryFee: withDelivery ? (deliveryFee ?? 0) : 0,
        deliveryMethod: withDelivery ? 'delivery' : 'pickup',
        paymentMethod: 'escrow',
      });

      const { escrowId, payableAmount } = response.data?.payluk || {};
      const order = response.data?.order;

      if (!escrowId) {
        toast.error('This product is not set up for escrow payment.');
        return;
      }

      API.patch('/users/me/shipping', {
        phone: formData.phone,
        state: formData.state,
        city: formData.city,
        fullAddress: formData.fullAddress,
      }).catch((e) => console.warn('[checkout] shipping save failed:', e));

      const reference = `esc-${order._id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

      const { data } = await paylukAPI.post(
        '/payment/escrow',
        {
          amount: payableAmount ?? order.totalAmount,
          reference,
          gateway: 'wallet',
          transactionType: 'escrow',
          escrowDetails: { escrowId: [escrowId] },
        },
        {
          headers: { 'customer-id': user?.paylukCustomerId },
        },
      );

      toast.success(data?.message ?? 'Escrow payment initiated successfully!');
      navigate('/dashboard/orders');
    } catch (error: any) {
      console.error('Escrow checkout error:', error?.response?.data ?? error);
      toast.error(error?.response?.data?.message || 'Escrow checkout failed. Please try again.');
    } finally {
      setIsEscrowLoading(false);
    }
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
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Finalize Order</h1>
        </div>

        {/* handleSubmit wraps the entire layout so the Pay button submits the form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            {/* LEFT COLUMN */}
            <div className="lg:col-span-7 space-y-12">
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
                      No saved shipping address found. Please fill in your delivery details below —
                      they'll be saved for next time.
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
              <div className="sticky top-24 bg-gray-50 rounded-[32px] p-8 border border-gray-100">
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
                    <span className="text-3xl font-black text-orange-600">
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

                {/* Option 1 — Delivery: shipping is included in the amount */}
                <Button
                  type="button"
                  onClick={handleSubmit(onEscrowSubmit)}
                  disabled={isLoading || isEscrowLoading || !cart?.items?.length}
                  className="w-full h-16 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-base gap-3 transition-all active:scale-95 shadow-xl shadow-orange-200"
                >
                  {isEscrowLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Truck size={18} />
                      Pay with Delivery · {formattedPrice(orderTotal)}
                    </>
                  )}
                </Button>

                {/* Option 2 — Direct payment: excludes shipping, settles from wallet */}
                <Button
                  type="button"
                  onClick={handleSubmit(onDirectPaySubmit)}
                  disabled={isLoading || isEscrowLoading || !cart?.items?.length}
                  className="mt-3 w-full h-14 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-black text-base gap-3 transition-all active:scale-95"
                >
                  {isEscrowLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Wallet size={18} className="text-orange-400" />
                      Pay Now (no delivery) · {formattedPrice(totalPrice)}
                    </>
                  )}
                </Button>
                <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400">
                  Direct payment excludes shipping and is settled from your wallet.
                </p>

                {/* Card / SDK checkout kept as a secondary option */}
                <Button
                  type="submit"
                  variant="outline"
                  disabled={isLoading || isEscrowLoading || !cart?.items?.length}
                  className="mt-3 w-full h-12 rounded-2xl border-gray-200 font-bold text-sm gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      <Lock size={16} className="text-orange-500" />
                      Pay by card instead
                    </>
                  )}
                </Button>

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
    </>
  );
};

export default CheckoutPage;
