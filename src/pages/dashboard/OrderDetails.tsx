// One order, for the buyer or the seller: where it is, what was bought,
// delivery/pickup details, and the next action for whoever is looking.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, Loader2, MapPin, Phone, ShieldCheck, Store, Truck } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { orderAPI } from '@/lib/api';
import API from '@/lib/axios-client';
import {
  paymentsApi,
  paymentErrorMessage,
  type DisputeEntry,
  type StartPaymentResponse,
} from '@/lib/payments-api';
import CheckoutPaymentModal from '@/components/checkout/CheckoutPaymentModal';
import { formatNaira, getStatusConfig } from '@/lib/order-status';
import CheckoutAd from '@/components/ads/CheckoutAd';
import ProductImage from '@/components/product/ProductImage';
import OrderActionButtons from '@/components/orders/OrderActionButtons';
import WhatsAppButton from '@/components/orders/WhatsAppButton';
import { buyerPaidMessage, sellerBringingMessage, sellerReadyMessage } from '@/lib/whatsapp';
import { itemsSummary } from '@/lib/order-lists';
import { NO_ACTIONS, NORMAL_PAYMENT_NOTE, type OrderActions } from '@/lib/order-lists';

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
  const [order, setOrder] = useState<any>(null);
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [tracking, setTracking] = useState<string | null>(null);
  const [dispute, setDispute] = useState<DisputeEntry[] | null>(null);
  // Which buttons apply: decided by the server, same as in the order lists.
  const [actions, setActions] = useState<OrderActions>(NO_ACTIONS);
  const [moneyNote, setMoneyNote] = useState<string | null>(null);
  // "Pay now" for an order that is still unpaid (the widget was closed).
  const [payment, setPayment] = useState<StartPaymentResponse | null>(null);

  const load = useCallback(async () => {
    if (!orderId) return;
    try {
      const { data } = await orderAPI.getOrderById(orderId);
      setOrder(data.order);
      setRole(data.role === 'seller' ? 'seller' : 'buyer');
      setActions({ ...NO_ACTIONS, ...(data.actions ?? {}) });
      setMoneyNote(data.moneyNote ?? null);
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

  // Show the dispute conversation when there is one.
  const disputeStatus: string | undefined = order?.disputeStatus;
  useEffect(() => {
    if (!orderId || !disputeStatus) return;
    paymentsApi
      .getDispute(orderId)
      .then((r) => setDispute(r.dispute?.entries ?? []))
      .catch(() => setDispute([]));
  }, [orderId, disputeStatus]);

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
        <Link to="/dashboard/my-orders" className="mt-4 inline-block text-orange-600 underline">
          Back to My Orders
        </Link>
      </div>
    );

  const isDelivery = order.deliveryMethod === 'delivery';
  const status = getStatusConfig(order.status, order.deliveryMethod, order.fulfilment);
  const shopDelivers = order.fulfilment === 'seller_delivery';
  const subtotal = order.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const shop = order.business;
  const buyerName = `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim();
  // Normal Payment is released to the seller at once; Buyer-Protected is held
  // until the buyer confirms. Orders from before this had no type: protected.
  const isNormal = order.paymentType === 'normal';
  const isPaid = order.paymentStatus === 'paid';
  const disputed = ['open', 'investigating'].includes(order.disputeStatus ?? '');
  const listPath = role === 'seller' ? '/dashboard/shop-orders' : '/dashboard/my-orders';
  // WhatsApp: only while the order is paid and still going.
  const ongoing = isPaid && ['processing', 'shipped'].includes(order.status);
  const shopName: string = shop?.businessName ?? 'the shop';
  const buyerFirstName: string = order.user?.firstName ?? '';

  const steps = [
    { key: 'paid', label: 'Paid', done: order.paymentStatus === 'paid' },
    {
      key: 'ready',
      label: isDelivery || shopDelivers ? 'On the way' : 'Ready for pickup',
      done: ['shipped', 'delivered'].includes(order.status),
    },
    { key: 'done', label: 'Completed', done: order.status === 'delivered' },
  ];

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

  // Buyer: pay an order that is still unpaid.
  const payNow = async () => {
    setBusy(true);
    try {
      setPayment(await paymentsApi.start(order._id));
    } catch (err: any) {
      if (err?.response?.data?.code === 'ALREADY_PAID') await load();
      else toast.error(paymentErrorMessage(err, 'Could not start the payment. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 lg:py-12 space-y-6">
      <Link to={listPath} className="inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> {role === 'seller' ? 'Shop Orders' : 'My Orders'}
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

        {/* Next action: which buttons show is decided by the server. */}
        <div className="mt-6 space-y-2">
          {ongoing && role === 'buyer' && (
            <WhatsAppButton
              phone={shop?.contact?.phone}
              text={buyerPaidMessage(order.orderNumber, itemsSummary(order.items))}
              label={
                <>
                  Message {shopName} about order <span className="whitespace-nowrap">{order.orderNumber}</span>
                </>
              }
            />
          )}
          {ongoing && role === 'seller' && !isDelivery && !shopDelivers && (
            <WhatsAppButton
              phone={order.shippingAddress?.phone}
              text={sellerReadyMessage(buyerFirstName, order.orderNumber, shopName)}
              label="Message buyer: your order is ready"
            />
          )}
          {ongoing && role === 'seller' && shopDelivers && (
            <WhatsAppButton
              phone={order.shippingAddress?.phone}
              text={sellerBringingMessage(buyerFirstName, order.orderNumber, shopName)}
              label="Message buyer: I'm bringing your order"
            />
          )}
          <OrderActionButtons
            order={{
              _id: order._id,
              orderNumber: order.orderNumber,
              deliveryMethod: order.deliveryMethod,
              itemsTotal: order.itemsTotal ?? subtotal,
              shopName: shop?.businessName ?? 'the shop',
              role,
              actions,
            }}
            onChanged={load}
            onPay={payNow}
          />
          {order.trackingNumber && (
            <Button variant="outline" onClick={checkTracking} disabled={busy} className="h-11 w-full sm:h-9 sm:w-auto rounded-xl font-bold">
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
        {moneyNote && (
          <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-600">
            <ShieldCheck size={14} className="mt-px shrink-0 text-green-600" />
            {moneyNote}
          </p>
        )}
        {actions.confirmDelivery && (
          <p className="mt-2 text-xs text-gray-500">
            Only tap &quot;Confirm delivery&quot; once you have everything.
          </p>
        )}
        {actions.getRefund && (
          <p className="mt-2 text-xs text-gray-500">
            {shop?.businessName ?? 'The shop'} could not fill this order. Tap &quot;Get my money back&quot;.
          </p>
        )}
        {role === 'buyer' && isNormal && isPaid && <p className="mt-2 text-xs text-gray-500">{NORMAL_PAYMENT_NOTE}</p>}
        {role === 'seller' && isNormal && isPaid && order.status === 'processing' && (
          <p className="mt-2 text-xs text-gray-500">
            Can&apos;t fill this order?{' '}
            <Link to="/contact" className="font-bold text-orange-600">
              Contact URA
            </Link>
          </p>
        )}
        {actions.pay && (
          <p className="mt-2 text-xs text-gray-500">This order is not paid yet. Tap &quot;Pay now&quot; to finish.</p>
        )}
        {disputed && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            A problem was reported on this order. URA is looking into it, and the money stays on hold until it is sorted out.
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
                <ProductImage src={item.image} name={item.name} alt="" className="h-full w-full object-cover" />
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

      {/* Dispute conversation */}
      {order.disputeStatus && dispute && dispute.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-[24px] p-6 space-y-3">
          <h2 className="font-black text-gray-900">Problem reported</h2>
          {dispute.map((d, i) => (
            <div key={i} className={cn('rounded-xl p-3 text-sm', d.from === 'seller' ? 'bg-gray-50' : 'bg-red-50')}>
              <p className="text-[11px] font-bold uppercase text-gray-400">
                {d.from === 'seller' ? 'Seller' : 'Buyer'}
                {d.at ? ` · ${new Date(d.at).toLocaleString()}` : ''}
              </p>
              <p className="mt-1 text-gray-800 whitespace-pre-line">{d.message}</p>
              {d.proofUrl && (
                <a href={d.proofUrl} target="_blank" rel="noreferrer" className="mt-1 inline-block text-xs font-bold text-orange-600">
                  View attachment
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {role === 'buyer' && <CheckoutAd businessId={shop?._id || shop} />}

      {payment && (
        <CheckoutPaymentModal
          orderId={order._id}
          orderNumber={order.orderNumber}
          paymentType={payment.paymentType}
          payment={payment}
          businessId={shop?._id || shop}
          onClose={() => setPayment(null)}
          onPaid={() => {
            setPayment(null);
            load();
          }}
        />
      )}

    </div>
  );
};

export default OrderDetailsPage;
