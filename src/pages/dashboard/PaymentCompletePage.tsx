import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import API from '@/lib/axios-client';

type Status = 'loading' | 'success' | 'already_confirmed' | 'error';

interface OrderSummary {
    _id: string;
    orderNumber: string;
    totalAmount: number;
    status: string;
    paymentStatus: string;
}

const PaymentCompletePage = () => {
    const [searchParams] = useSearchParams();
    const paymentId = searchParams.get('paymentId');

    const [status, setStatus] = useState<Status>('loading');
    const [order, setOrder] = useState<OrderSummary | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    const formattedPrice = (price: number) =>
        new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(price);

    useEffect(() => {
        if (!paymentId) {
            setStatus('error');
            setErrorMessage('No payment reference found. Please check your orders page.');
            return;
        }

        const confirm = async () => {
            try {
                const response = await API.post('/order/confirm', { paymentId });
                const data = response.data;

                setOrder(data.order);
                setStatus(data.alreadyConfirmed ? 'already_confirmed' : 'success');
            } catch (error: any) {
                console.error('❌ Payment confirmation error:', error);
                setStatus('error');
                setErrorMessage(
                    error?.response?.data?.message ||
                    'We could not confirm your payment. Please check your orders or contact support.'
                );
            }
        };

        confirm();
    }, [paymentId]);

    // ── Loading ───────────────────────────────────────────────────────────────
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto">
                        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
                    </div>
                    <p className="text-sm font-black uppercase tracking-widest text-gray-400">
                        Confirming your payment…
                    </p>
                </div>
            </div>
        );
    }

    // ── Error ─────────────────────────────────────────────────────────────────
    if (status === 'error') {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4">
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-gray-900 mb-2">Payment Not Confirmed</h1>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">{errorMessage}</p>
                    </div>
                    {paymentId && (
                        <div className="bg-gray-50 rounded-2xl p-4 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                Payment Reference
                            </p>
                            <p className="text-sm font-mono font-bold text-gray-700 break-all">{paymentId}</p>
                        </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                            asChild
                            variant="outline"
                            className="flex-1 h-12 rounded-xl font-black border-gray-200"
                        >
                            <Link to="/dashboard/orders">View My Orders</Link>
                        </Button>
                        <Button
                            asChild
                            className="flex-1 h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black"
                        >
                            <Link to="/dashboard/product/cart">Back to Cart</Link>
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    // ── Success & Already Confirmed ───────────────────────────────────────────
    return (
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Icon */}
                <div className="relative mx-auto w-24 h-24">
                    <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>
                    {/* Pulse ring */}
                    <span className="absolute inset-0 rounded-full bg-green-100 animate-ping opacity-30" />
                </div>

                {/* Heading */}
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                        {status === 'already_confirmed' ? 'Already Confirmed!' : 'Payment Successful!'}
                    </h1>
                    <p className="text-sm text-gray-500 font-medium leading-relaxed">
                        {status === 'already_confirmed'
                            ? 'This payment was already recorded. Your order is being processed.'
                            : 'Your payment went through and your order is now being processed.'}
                    </p>
                </div>

                {/* Order card */}
                {order && (
                    <div className="bg-gray-50 rounded-[24px] p-6 text-left space-y-4 border border-gray-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                <Package size={16} className="text-orange-600" />
                            </div>
                            <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Order Summary
              </span>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Order Number</span>
                                <span className="text-sm font-black text-gray-900">{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Amount Paid</span>
                                <span className="text-sm font-black text-orange-600">
                  {formattedPrice(order.totalAmount)}
                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-bold text-gray-500">Status</span>
                                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                                    {order.status}
                </span>
                            </div>
                        </div>

                        {paymentId && (
                            <div className="pt-3 border-t border-gray-200">
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                                    Payment Reference
                                </p>
                                <p className="text-xs font-mono font-bold text-gray-600 break-all">{paymentId}</p>
                            </div>
                        )}
                    </div>
                )}

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        asChild
                        variant="outline"
                        className="flex-1 h-12 rounded-xl font-black border-gray-200 gap-2"
                    >
                        <Link to="/dashboard/orders">
                            <Package size={16} />
                            View Orders
                        </Link>
                    </Button>
                    <Button
                        asChild
                        className="flex-1 h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black gap-2 transition-colors"
                    >
                        <Link to="/">
                            <ShoppingBag size={16} />
                            Continue Shopping
                            <ArrowRight size={14} />
                        </Link>
                    </Button>
                </div>

            </div>
        </div>
    );
};

export default PaymentCompletePage;