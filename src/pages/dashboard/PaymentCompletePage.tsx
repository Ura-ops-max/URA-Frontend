import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { XCircle, Loader2, Package, ArrowRight, ShoppingBag } from 'lucide-react';
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

const formatNGN = (n: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);

// ─── Delivery animation ───────────────────────────────────────────────────────
function DeliveryScene() {
  return (
    <div className="relative w-full h-32 overflow-hidden select-none" aria-hidden>
      {/* Road */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gray-200 rounded-full mx-4" />
      <div className="absolute bottom-[10px] left-0 right-0 flex justify-center gap-6">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-1.5 w-8 bg-gray-300 rounded-full"
            style={{ animation: 'road-dash 0.8s linear infinite', animationDelay: `${i * 0.25}s` }}
          />
        ))}
      </div>

      {/* Truck */}
      <div
        className="absolute bottom-5"
        style={{ animation: 'truck 3.5s cubic-bezier(0.4,0,0.6,1) infinite' }}
      >
        <svg width="80" height="48" viewBox="0 0 80 48" fill="none">
          {/* Trailer */}
          <rect x="2" y="8" width="46" height="28" rx="4" fill="#1f2937" />
          <rect x="6" y="12" width="38" height="20" rx="2" fill="#374151" />
          {/* Orange stripe */}
          <rect x="2" y="28" width="46" height="4" fill="#f97316" />
          {/* Cab */}
          <rect x="48" y="14" width="28" height="22" rx="4" fill="#111827" />
          <rect x="52" y="18" width="16" height="10" rx="2" fill="#93c5fd" opacity="0.8" />
          {/* Headlight */}
          <circle cx="76" cy="30" r="2.5" fill="#fde68a" />
          {/* Exhaust puff */}
          <circle
            cx="50"
            cy="10"
            r="3"
            fill="#d1d5db"
            opacity="0.5"
            style={{ animation: 'puff 1s ease-out infinite' }}
          />
          <circle
            cx="46"
            cy="6"
            r="2"
            fill="#d1d5db"
            opacity="0.3"
            style={{ animation: 'puff 1s ease-out infinite', animationDelay: '0.15s' }}
          />
          {/* Wheels */}
          <circle cx="16" cy="37" r="7" fill="#374151" />
          <circle cx="16" cy="37" r="3.5" fill="#6b7280" />
          <circle cx="36" cy="37" r="7" fill="#374151" />
          <circle cx="36" cy="37" r="3.5" fill="#6b7280" />
          <circle cx="62" cy="37" r="7" fill="#374151" />
          <circle cx="62" cy="37" r="3.5" fill="#6b7280" />
        </svg>
      </div>

      {/* Destination pin */}
      <div
        className="absolute right-8 bottom-5 flex flex-col items-center"
        style={{ animation: 'bounce-slow 1.4s ease-in-out infinite' }}
      >
        <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-lg shadow-orange-200">
          <Package size={12} className="text-white" />
        </div>
        <div className="w-0.5 h-4 bg-orange-400" />
        <div className="w-1.5 h-1.5 bg-orange-400 rounded-full" />
      </div>

      <style>{`
        @keyframes truck {
          0%   { left: -90px; }
          100% { left: calc(100% - 20px); }
        }
        @keyframes road-dash {
          0%   { transform: translateX(0);    opacity: 1; }
          100% { transform: translateX(60px); opacity: 0; }
        }
        @keyframes puff {
          0%   { transform: translate(0,0) scale(1);     opacity: 0.5; }
          100% { transform: translate(-20px,-20px) scale(2); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50%       { transform: translateY(-6px); }
        }
        @keyframes confetti-fall {
          0%   { transform: translateY(-10px) rotate(0deg);   opacity: 1; }
          100% { transform: translateY(80px)  rotate(360deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── Confetti dots ────────────────────────────────────────────────────────────
const CONFETTI = [
  { color: '#f97316', left: '10%', delay: '0s', size: 8 },
  { color: '#1f2937', left: '22%', delay: '0.2s', size: 6 },
  { color: '#fb923c', left: '38%', delay: '0.05s', size: 10 },
  { color: '#9ca3af', left: '54%', delay: '0.3s', size: 6 },
  { color: '#f97316', left: '67%', delay: '0.1s', size: 8 },
  { color: '#374151', left: '80%', delay: '0.25s', size: 6 },
  { color: '#fdba74', left: '91%', delay: '0.4s', size: 8 },
];

function Confetti() {
  return (
    <div className="absolute inset-x-0 top-0 h-16 pointer-events-none overflow-hidden" aria-hidden>
      {CONFETTI.map((d, i) => (
        <div
          key={i}
          className="absolute top-0 rounded-full"
          style={{
            width: d.size,
            height: d.size,
            background: d.color,
            left: d.left,
            animation: `confetti-fall 1.2s ease-out ${d.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
const CART_PATH = '/dashboard/product/cart';

const PaymentCompletePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get('paymentId');
  const [status, setStatus] = useState<Status>('loading');
  const [order, setOrder] = useState<OrderSummary | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!paymentId) {
      setStatus('error');
      setErrorMessage('No payment reference found. Please check your orders page.');
      return;
    }
    API.post('/orders/confirm', { paymentId })
      .then(({ data }) => {
        setOrder(data.order);
        setStatus(data.alreadyConfirmed ? 'already_confirmed' : 'success');
        // Auto-redirect to cart after 3 seconds
        setTimeout(() => navigate(CART_PATH), 3000);
      })
      .catch((error: any) => {
        setStatus('error');
        setErrorMessage(
          error?.response?.data?.message ||
            'We could not confirm your payment. Please check your orders or contact support.',
        );
      });
  }, [paymentId]);

  // Loading
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
          <p className="text-[11px] font-black uppercase tracking-widest text-gray-400">
            Confirming your payment…
          </p>
        </div>
      </div>
    );
  }

  // Error
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <XCircle className="w-10 h-10 text-red-400" />
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
              <p className="text-xs font-mono font-bold text-gray-600 break-all">{paymentId}</p>
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
              className="flex-1 h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-xl font-black transition-colors"
            >
              <Link to="/dashboard/product/cart">Back to Cart</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  const isAlready = status === 'already_confirmed';

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-8 relative">
        <Confetti />

        {/* Delivery animation card */}
        <div className="bg-gray-50 rounded-[28px] border border-gray-100 overflow-hidden px-4 pt-8 pb-2">
          <DeliveryScene />
        </div>

        {/* Heading */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-[11px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block animate-pulse" />
            {isAlready ? 'Already Confirmed' : 'Payment Successful'}
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            {isAlready ? 'Order already confirmed!' : 'Your order is on its way!'}
          </h1>
          <p className="text-sm text-gray-500 font-medium leading-relaxed max-w-xs mx-auto">
            {isAlready
              ? 'This payment was already recorded. Your order is being processed.'
              : "We've received your payment and the seller has been notified. Get ready for delivery!"}
          </p>
        </div>

        {/* Order card */}
        {order && (
          <div className="bg-gray-50 rounded-[24px] border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                <Package size={15} className="text-orange-600" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-gray-400">
                Order Summary
              </span>
            </div>
            <div className="px-6 py-5 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Order Number</span>
                <span className="text-sm font-black text-gray-900 font-mono">
                  {order.orderNumber}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Amount Paid</span>
                <span className="text-sm font-black text-orange-600">
                  {formatNGN(order.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-500">Status</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wide text-green-700 bg-green-100 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                  {order.status}
                </span>
              </div>
              {paymentId && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Payment Reference
                  </p>
                  <p className="text-xs font-mono text-gray-500 break-all">{paymentId}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            variant="outline"
            className="flex-1 h-12 rounded-2xl font-black border-gray-200 gap-2"
          >
            <Link to="/dashboard/orders">
              <Package size={16} />
              Track Order
            </Link>
          </Button>
          <Button
            asChild
            className="flex-1 h-12 bg-gray-900 hover:bg-orange-600 text-white rounded-2xl font-black gap-2 transition-colors"
          >
            <Link to={CART_PATH}>
              <ShoppingBag size={16} />
              Go to Cart
              <ArrowRight size={14} />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCompletePage;
