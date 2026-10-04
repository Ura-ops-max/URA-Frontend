// One order, for the buyer or the seller: where it is, what was bought,
// delivery/pickup details, and the next action for whoever is looking.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, MapPin, Phone, Store, Truck, PackageCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { orderAPI } from '@/lib/api';
import API from '@/lib/axios-client';
import paylukAPI from '@/lib/payluk-axios';
import { useAuthContext } from '@/context/auth-provider';
import { ProductThumb } from '@/components/product/shared/ProductThumb';
import { formatNaira, getStatusConfig } from '@/lib/order-status';

/** Best-effort one-line summary of a Fez tracking response. */
const summariseTracking = (data: any): string => {
  const d = data?.data ?? data;
  const candidates = [
    d?.order?.orderStatus,
    d?.orderStatus,
    d?.status,
    Array.isArray(d?.history) ? d.history[d.history.length - 1]?.status : undefined,
  ];
  const hit = candidates.find((c) => typeof c === 'string' && c.trim());
  return hit ?? 'No update from the courier yet.';
};

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { user } = useAuthContext();
  const [order, setOrder] = useState<any>(null);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      const { data } = await orderAPI.getOrderById(orderId);
      setOrder(data.order);
      setRole(data.role === 'seller' ? 'seller' : 'buyer');
      setError('');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Could not load this order.');
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading)
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );

  if (error || !order)
    return (
      <div className="max-w-xl mx-auto py-20 text-center">
        <p className="font-bold text-gray-900">{error || 'Order not found.'}</p>
        <Link to="/dashboard/orders" className="mt-4 inline-block text-orange-600 underline">
          Back to orders
        </Link>
      </div>
    );

  const isDelivery = order.deliveryMethod === 'delivery';
  const status = getStatusConfig(order.status, order.deliveryMethod, order.fulfilment);
  const shopDelivers = order.fulfilment === 'seller_delivery';
  const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const shop = order.business;
  const buyerName = `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim();

  const steps = [
    { key: 'paid', label: 'Paid', done: order.paymentStatus === 'paid' },
    {
      key: 'ready',
      label: isDelivery || shopDelivers ? 'On the way' : 'Ready for pickup',
      done: ['shipped', 'delivered'].includes(order.status),
    },
    { key: 'done', label: 'Completed', done: order.status === 'delivered' },
  ];

  const markReady = async (mode?: 'pickup' | 'self_delivery') => {
    setBusy(true);
    try {
      await orderAPI.markOrderReady(order._id, isDelivery ? undefined : mode);
      toast.success(
        isDelivery
          ? 'Delivery booked. The buyer has been told.'
          : mode === 'self_delivery'
            ? "The buyer has been told you're bringing it."
            : 'The buyer has been told it is ready.',
      );
      await load();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update the order.');
    } finally {
      setBusy(false);
    }
  };

  const checkTracking = async () => {
    setBusy(true);
    try {
      const { data } = await API.get(`/delivery/track/${encodeURIComponent(order.trackingNumber)}`);
      setTracking(summariseTracking(data));
    } catch {
      setTracking('Could not reach the courier right now. Try again shortly.');
    } finally {
      setBusy(false);
    }
  };

  // Buyer confirms they got the goods → Payluk releases the escrow to the seller.
  const confirmReceived = async () => {
    setConfirmOpen(false);
    if (!order.paylukEscrowId || !user?.paylukCustomerId) {
      toast.error('This order cannot be confirmed here. Please contact support.');
      return;
    }
    setBusy(true);
    try {
      await paylukAPI.post(`/escrow/confirm-payment/${order.paylukEscrowId}`, null, {
        headers: { 'customer-id': user.paylukCustomerId, accept: 'application/json' },
      });
      toast.success('Thanks! The seller is being paid. This order will show as completed shortly.');
      setTimeout(load, 4000);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not confirm right now. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12 space-y-6">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> All orders
      </Link>

      {/* Header */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order</p>
            <h1 className="text-xl font-black text-gray-900">#{order.orderNumber}</h1>
            <p className="text-xs text-gray-500 mt-1">
              {role === 'seller' ? `Customer: ${buyerName || 'Customer'}` : `From ${shop?.businessName ?? 'seller'}`}
              {' · '}
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>
          <span className={cn('flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-black uppercase', status.color)}>
            <status.icon size={14} /> {status.label}
          </span>
        </div>

        {/* Progress */}
        {order.paymentStatus === 'paid' && order.status !== 'refunded' && (
          <div className="mt-6 flex items-center">
            {steps.map((s, i) => (
              <div key={s.key} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center text-white',
                      s.done ? 'bg-green-500' : 'bg-gray-200',
                    )}
                  >
                    <Check size={16} />
                  </div>
                  <span className={cn('mt-1 text-[11px] font-bold', s.done ? 'text-gray-900' : 'text-gray-400')}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('mx-2 mb-5 h-1 flex-1 rounded', steps[i + 1].done ? 'bg-green-500' : 'bg-gray-200')} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Next action */}
        <div className="mt-6 flex flex-wrap gap-2">
          {role === 'seller' && order.status === 'processing' && (
            <Button onClick={() => markReady('pickup')} disabled={busy} className="rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
              {busy ? <Loader2 size={16} className="animate-spin" /> : isDelivery ? (<><Truck size={16} className="mr-1" /> Book delivery</>) : (<><Store size={16} className="mr-1" /> Ready for pickup</>)}
            </Button>
          )}
          {role === 'seller' && order.status === 'processing' && !isDelivery && (
            <Button variant="outline" onClick={() => markReady('self_delivery')} disabled={busy} className="rounded-xl border-orange-200 text-orange-700 font-bold">
              <Truck size={16} className="mr-1" /> I&apos;ll deliver it myself
            </Button>
          )}
          {role === 'buyer' && order.paymentStatus === 'paid' && ['processing', 'shipped'].includes(order.status) && (
            <Button onClick={() => setConfirmOpen(true)} disabled={busy} className="rounded-xl bg-green-600 hover:bg-green-700 font-bold">
              <PackageCheck size={16} className="mr-1" /> I&apos;ve received my order
            </Button>
          )}
          {order.trackingNumber && (
            <Button variant="outline" onClick={checkTracking} disabled={busy} className="rounded-xl font-bold">
              <Truck size={16} className="mr-1" /> Track delivery
            </Button>
          )}
        </div>
        {order.trackingNumber && (
          <p className="mt-3 text-sm text-gray-600">
            Tracking number: <span className="font-bold">{order.trackingNumber}</span>
            {tracking && <span className="block mt-1">Latest update: {tracking}</span>}
          </p>
        )}
        {role === 'buyer' && order.status === 'processing' && (
          <p className="mt-3 text-xs text-gray-500">
            Your money is held safely in escrow. Only tap &quot;I&apos;ve received my order&quot; once you have the items.
          </p>
        )}
      </div>

      {/* Items */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6">
        <h2 className="font-black text-gray-900 mb-4">Items</h2>
        <div className="space-y-3">
          {order.items.map((item: any, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                {item.image ? <ProductThumb url={item.image} alt="" /> : null}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">
                  {item.quantity} × {formatNaira(item.price)}
                </p>
              </div>
              <p className="text-sm font-bold">{formatNaira(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 border-t border-gray-100 pt-4 space-y-1 text-sm">
          <div className="flex justify-between text-gray-500"><span>Items</span><span>{formatNaira(subtotal)}</span></div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between text-gray-500"><span>Delivery</span><span>{formatNaira(order.deliveryFee)}</span></div>
          )}
          <div className="flex justify-between font-black text-gray-900"><span>Total</span><span>{formatNaira(order.totalAmount)}</span></div>
        </div>
      </div>

      {/* Delivery / pickup */}
      <div className="bg-white border border-gray-100 rounded-[24px] p-6 space-y-2 text-sm text-gray-700">
        <h2 className="font-black text-gray-900 mb-2">{isDelivery ? 'Delivery' : shopDelivers ? 'Delivered by the shop' : 'Pickup'}</h2>
        {isDelivery || shopDelivers ? (
          <p className="flex items-start gap-2">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            {[order.shippingAddress?.fullAddress, order.shippingAddress?.city, order.shippingAddress?.state].filter(Boolean).join(', ') || 'Address not provided'}
          </p>
        ) : (
          <p className="flex items-start gap-2">
            <Store size={16} className="mt-0.5 shrink-0" />
            {shop?.businessName}
            {shop?.address?.fullAddress ? `, ${shop.address.fullAddress}` : ''}
          </p>
        )}
        {order.shippingAddress?.phone && role === 'seller' && (
          <p className="flex items-center gap-2"><Phone size={16} /> {order.shippingAddress.phone}</p>
        )}
        {role === 'buyer' && shop?.contact?.phone && (
          <p className="flex items-center gap-2"><Phone size={16} /> Shop: {shop.contact.phone}</p>
        )}
        {role === 'buyer' && shop?.slug && (
          <Link to={`/${shop.slug}`} className="inline-block text-orange-600 font-bold">Visit {shop.businessName}</Link>
        )}
      </div>

      {/* Confirm receipt dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <PackageCheck className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="mt-3 text-lg font-black">Did you receive everything?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Confirming releases {formatNaira(subtotal)} to {shop?.businessName ?? 'the seller'}. This can&apos;t be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setConfirmOpen(false)}>Not yet</Button>
              <Button className="flex-1 rounded-xl bg-green-600 hover:bg-green-700" onClick={confirmReceived}>Yes, release payment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
