// One order, for the buyer or the seller: where it is, what was bought,
// delivery/pickup details, and the next action for whoever is looking.
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Check,
  CreditCard,
  Loader2,
  MapPin,
  PackageCheck,
  Phone,
  Store,
  Truck,
} from 'lucide-react';
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
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [dispute, setDispute] = useState<DisputeEntry[] | null>(null);
  // "Pay now" for an order that is still unpaid (the widget was closed).
  const [payment, setPayment] = useState<StartPaymentResponse | null>(null);

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
  // Normal Payment is released to the seller at once; Buyer-Protected is held
  // until the buyer confirms. Orders from before this had no type: protected.
  const isNormal = order.paymentType === 'normal';
  const isPaid = order.paymentStatus === 'paid';
  const released = Boolean(order.payoutReleasedAt);
  const disputed = ['open', 'investigating'].includes(order.disputeStatus ?? '');
  const canPayNow = role === 'buyer' && !isPaid && !['cancelled', 'refunded'].includes(order.status);
  const protectedActive =
    !isNormal && isPaid && !released && !disputed && ['processing', 'shipped'].includes(order.status);

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

  // Buyer confirms they got the goods → URA's backend asks Payluk to release
  // the escrow to the seller (Buyer-Protected only).
  const confirmReceived = async () => {
    setConfirmOpen(false);
    setBusy(true);
    try {
      await paymentsApi.confirmReceived(order._id);
      toast.success('Thanks! The seller has been paid.');
      await load();
    } catch (err: any) {
      toast.error(paymentErrorMessage(err, 'Could not confirm right now. Please try again.'));
    } finally {
      setBusy(false);
    }
  };

  // Seller: claim the money one day after the delivery window (Payluk's rule).
  const claim = async () => {
    setBusy(true);
    try {
      await paymentsApi.claim(order._id);
      toast.success('Payment claimed. It has been paid to your wallet.');
      await load();
    } catch (err: any) {
      toast.error(paymentErrorMessage(err, 'Could not claim right now. Please try again.'));
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
        {/* Phones: one full-width button per row. Larger screens: in a row. */}
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto [&>button]:h-11 sm:[&>button]:h-9">
          {canPayNow && (
            <Button onClick={payNow} disabled={busy} className="rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <><CreditCard size={16} className="mr-1" /> Pay now</>}
            </Button>
          )}
          {role === 'seller' && order.status === 'processing' && !disputed && (
            <Button onClick={() => markReady('pickup')} disabled={busy} className="rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
              {busy ? <Loader2 size={16} className="animate-spin" /> : isDelivery ? (<><Truck size={16} className="mr-1" /> Book delivery</>) : (<><Store size={16} className="mr-1" /> Ready for pickup</>)}
            </Button>
          )}
          {role === 'seller' && order.status === 'processing' && !isDelivery && !disputed && (
            <Button variant="outline" onClick={() => markReady('self_delivery')} disabled={busy} className="rounded-xl border-orange-200 text-orange-700 font-bold">
              <Truck size={16} className="mr-1" /> I&apos;ll deliver it myself
            </Button>
          )}
          {role === 'buyer' && protectedActive && (
            <>
              <Button onClick={() => setConfirmOpen(true)} disabled={busy} className="rounded-xl bg-green-600 hover:bg-green-700 font-bold">
                <PackageCheck size={16} className="mr-1" /> I&apos;ve received my order
              </Button>
              <Button variant="outline" onClick={() => setDisputeOpen(true)} disabled={busy} className="rounded-xl border-red-200 text-red-600 font-bold">
                <AlertTriangle size={16} className="mr-1" /> Report a problem
              </Button>
            </>
          )}
          {role === 'seller' && protectedActive && (
            <Button variant="outline" onClick={claim} disabled={busy} className="rounded-xl font-bold">
              <BadgeCheck size={16} className="mr-1" /> Claim payment
            </Button>
          )}
          {role === 'seller' && disputed && (
            <Button variant="outline" onClick={() => setDisputeOpen(true)} disabled={busy} className="rounded-xl border-red-200 text-red-600 font-bold">
              <AlertTriangle size={16} className="mr-1" /> Reply to the dispute
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
        {role === 'buyer' && isPaid && order.status === 'processing' && (
          <p className="mt-3 text-xs text-gray-500">
            {isNormal
              ? 'Normal Payment: your payment went straight to the seller.'
              : 'Your money is held safely with buyer protection. Only tap "I\'ve received my order" once you have the items.'}
          </p>
        )}
        {role === 'seller' && isPaid && (
          <p className="mt-3 text-xs text-gray-500">
            {released
              ? `Paid to your wallet: ${formatNaira(subtotal)} for the items.`
              : isNormal
                ? 'Normal Payment: being paid to your wallet now.'
                : 'Buyer-Protected: you are paid when the buyer confirms, or when you claim after the delivery window.'}
          </p>
        )}
        {canPayNow && (
          <p className="mt-3 text-xs text-gray-500">This order is not paid yet. Tap &quot;Pay now&quot; to finish.</p>
        )}
        {disputed && (
          <p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
            A dispute is open on this order. Payluk is reviewing it, and the money stays on hold until it is resolved.
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
          <h2 className="font-black text-gray-900">Dispute</h2>
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

      {disputeOpen && (
        <DisputeDialog
          orderId={order._id}
          asSeller={role === 'seller'}
          onClose={() => setDisputeOpen(false)}
          onDone={() => {
            setDisputeOpen(false);
            load();
          }}
        />
      )}

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

      {/* Confirm receipt dialog */}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setConfirmOpen(false)}>
          <div className="w-full max-w-sm rounded-t-3xl bg-white p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-center sm:rounded-3xl sm:pb-6" onClick={(e) => e.stopPropagation()}>
            <PackageCheck className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="mt-3 text-lg font-black">Did you receive everything?</h3>
            <p className="mt-1 text-sm text-gray-500">
              Confirming releases {formatNaira(subtotal)} to {shop?.businessName ?? 'the seller'}. This can&apos;t be undone.
            </p>
            <div className="mt-6 flex flex-col-reverse gap-3 min-[380px]:flex-row">
              <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={() => setConfirmOpen(false)}>Not yet</Button>
              <Button className="flex-1 h-11 rounded-xl bg-green-600 hover:bg-green-700" onClick={confirmReceived}>Yes, release payment</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/** Buyer opens a dispute (Buyer-Protected); the seller replies once one is open. */
function DisputeDialog({
  orderId,
  asSeller,
  onClose,
  onDone,
}: {
  orderId: string;
  asSeller: boolean;
  onClose: () => void;
  onDone: () => void;
}) {
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await paymentsApi.submitDispute(orderId, message.trim(), file);
      toast.success(asSeller ? 'Your reply was sent.' : 'Dispute opened. Payluk will review it.');
      onDone();
    } catch (err: any) {
      toast.error(paymentErrorMessage(err, 'Could not send. Please try again.'));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="w-full max-w-md max-h-[92dvh] overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-black">{asSeller ? 'Reply to the dispute' : 'Report a problem'}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {asSeller
            ? 'Explain your side. You can reply once.'
            : 'The money stays on hold while Payluk reviews it. You can submit once.'}
        </p>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          rows={5}
          placeholder={asSeller ? 'Your reply' : 'What went wrong?'}
          className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-base sm:text-sm outline-none focus:ring-2 focus:ring-orange-300"
        />
        <label className="mt-3 block text-xs font-semibold text-gray-600">
          Photo or PDF (optional, up to 5 MB)
          <input
            type="file"
            accept="image/*,application/pdf"
            className="mt-1 block w-full text-xs"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              if (f && f.size > 5 * 1024 * 1024) {
                toast.error('That file is over 5 MB.');
                e.target.value = '';
                return;
              }
              setFile(f);
            }}
          />
        </label>
        <div className="mt-6 flex flex-col-reverse gap-3 min-[380px]:flex-row">
          <Button variant="outline" className="flex-1 h-11 rounded-xl" onClick={onClose} disabled={sending}>
            Cancel
          </Button>
          <Button className="flex-1 h-11 rounded-xl bg-red-600 hover:bg-red-700" onClick={submit} disabled={sending || !message.trim()}>
            {sending ? <Loader2 size={16} className="animate-spin" /> : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default OrderDetailsPage;
