import { useCartContext } from '@/context/cart-provider';
import { ShieldCheck, Truck, CreditCard, ChevronLeft, Lock, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useAuthContext } from '@/context/auth-provider';
import { toast } from 'sonner';
import API from '@/lib/axios-client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEscrowCheckout } from 'payluk-escrow-inline-checkout/react';
import { EscrowCheckoutError } from 'payluk-escrow-inline-checkout';
import {BASE_ROUTE} from "@/routes/common/routePaths.ts";

// ── Validation schema ───────────────────────────────────────────────────────
const shippingSchema = z.object({
  phone: z
      .string()
      .min(1, 'Phone number is required')
      .regex(/^\+?[0-9]{10,15}$/, 'Enter a valid phone number (e.g. +2348012345678)'),
  city: z
      .string()
      .min(2, 'City is required')
      .max(100, 'City name is too long'),
  fullAddress: z
      .string()
      .min(5, 'Street address is required')
      .max(200, 'Address is too long'),
});

type ShippingFormValues = z.infer<typeof shippingSchema>;

// ───────────────────────────────────────────────────────────────────────────
const CheckoutPage = () => {
  const { cart, totalPrice } = useCartContext();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { pay } = useEscrowCheckout();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { phone: '', city: '', fullAddress: '' },
  });

  const formattedPrice = (price: number) =>
      new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        maximumFractionDigits: 0,
      }).format(price);

  // handleSubmit from react-hook-form validates before this runs
  const onSubmit = async (formData: ShippingFormValues) => {
    setIsLoading(true);
    try {
      // Step 1: Create order on backend
      // Returns the product's pre-generated paymentToken and the SELLER's customerId
      const response = await API.post('/order/checkout', {
        shippingAddress: {
          fullAddress: formData.fullAddress,
          city: formData.city,
          phone: formData.phone,
        },
        paymentMethod: 'card',
      });

      const { paymentToken, customerId } = response.data?.payluk || {};
      const order = response.data?.order;

      if (!paymentToken) {
        toast.error('Could not get payment token. Please try again.');
        return;
      }

      await pay({
        paymentToken,
        reference: `${order._id}-${Date.now()}`,
        redirectUrl: `${window.location.origin}${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}`,
        brand: import.meta.env.VITE_APP_NAME ?? 'Marketplace',
        customerId: customerId ?? undefined,
        callback: (result: any) => {
          console.log('✅ Payluk payment result:', result);
          toast.success('Payment successful! Your order is being processed.');
          navigate(
              `${BASE_ROUTE.PAYLUK_PAYMENT_COMPLETE}?paymentId=${encodeURIComponent(result.paymentId)}`
          );
        },
        onClose: () => {

          toast.info('Payment cancelled. Your order has been saved — you can retry from your orders.');
          navigate('/dashboard/orders');
        },
      });

    } catch (error: any) {
      console.error('Checkout error:', error);

      if (error?.response?.data?.code === 'PAYLUK_SETUP_REQUIRED') {
        toast.info('This product is not yet available for purchase.');
        return;
      }

      if (error instanceof EscrowCheckoutError) {
        console.error('EscrowCheckoutError:', error.code, error.status, error.message);
        toast.error(error.message || 'Payment gateway error. Please try again.');
        return;
      }

      toast.error(error?.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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

                  {/* City */}
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

                  {/* Street address */}
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
                  <p className="text-sm font-bold text-gray-500">Secure Payment Gateway will open here</p>
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
                          <p className="text-sm font-bold text-gray-900 truncate">{item.product.name}</p>
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
                    <span>Delivery</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4">
                    <span className="text-base font-black text-gray-900 uppercase">Total Amount</span>
                    <span className="text-3xl font-black text-orange-600">
                    {formattedPrice(totalPrice)}
                  </span>
                  </div>
                </div>

                {/* type="submit" triggers handleSubmit → zod validation → onSubmit */}
                <Button
                    type="submit"
                    disabled={isLoading || !cart?.items?.length}
                    className="w-full h-16 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black text-lg gap-3 transition-all active:scale-95 shadow-2xl shadow-gray-200 group"
                >
                  {isLoading ? (
                      <Loader2 className="animate-spin" />
                  ) : (
                      <>
                        <Lock size={20} className="text-orange-400 group-hover:text-white transition-colors" />
                        Pay {formattedPrice(totalPrice)}
                      </>
                  )}
                </Button>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                    <ShieldCheck size={18} className="text-blue-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase">Buyer Protection</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-gray-100">
                    <Truck size={18} className="text-orange-500" />
                    <span className="text-[9px] font-black text-gray-500 uppercase">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>
      </div>
  );
};

export default CheckoutPage;