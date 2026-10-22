// The buttons for one order, for whoever is looking. Which buttons show is
// decided by the server (`actions`), so lists and the order page agree.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  BadgeCheck,
  Ban,
  CreditCard,
  Loader2,
  PackageCheck,
  RotateCcw,
  Store,
  Truck,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { orderAPI } from '@/lib/api';
import { paymentsApi, paymentErrorMessage } from '@/lib/payments-api';
import { formatNaira } from '@/lib/order-status';
import type { OrderActions } from '@/lib/order-lists';
import ConfirmSheet from './ConfirmSheet';
import ProblemDialog from './ProblemDialog';

export interface ActionOrder {
  _id: string;
  orderNumber: string;
  deliveryMethod?: string;
  /** What the shop is paid for the items (no delivery or fees). */
  itemsTotal: number;
  shopName: string;
  role: 'buyer' | 'seller';
  actions: OrderActions;
}

type Sheet = 'confirm' | 'cancel' | 'reject' | 'refund' | 'problem' | null;

export default function OrderActionButtons({
  order,
  onChanged,
  onPay,
}: {
  order: ActionOrder;
  onChanged: () => void;
  /** The order page opens the payment window; lists go to the order page. */
  onPay?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [sheet, setSheet] = useState<Sheet>(null);
  const [reason, setReason] = useState('');
  const a = order.actions;
  const isDelivery = order.deliveryMethod === 'delivery';

  const run = async (work: () => Promise<string>, fallback: string) => {
    setBusy(true);
    try {
      toast.success(await work());
      setSheet(null);
      onChanged();
    } catch (err: any) {
      toast.error(paymentErrorMessage(err, fallback));
    } finally {
      setBusy(false);
    }
  };

  const markReady = (mode?: 'pickup' | 'self_delivery') =>
    run(async () => {
      await orderAPI.markOrderReady(order._id, isDelivery ? undefined : mode);
      if (isDelivery) return 'Rider booked. The buyer has been told.';
      return mode === 'self_delivery'
        ? "The buyer has been told you're bringing it."
        : 'The buyer has been told it is ready for pickup.';
    }, 'Could not update the order. Please try again.');

  const confirmDelivery = () =>
    run(async () => {
      await paymentsApi.confirmReceived(order._id);
      return `Thanks. ${order.shopName} has been paid.`;
    }, 'Could not confirm right now. Please try again.');

  const cancel = () =>
    run(async () => {
      await paymentsApi.cancel(order._id);
      return 'Order cancelled.';
    }, 'Could not cancel the order. Please try again.');

  const reject = () =>
    run(async () => {
      await paymentsApi.reject(order._id, reason.trim() || undefined);
      return 'Order rejected. The buyer has been told, and the items are back on sale.';
    }, 'Could not reject the order. Please try again.');

  const refund = () =>
    run(async () => {
      const r = await paymentsApi.refund(order._id);
      return r.refunded
        ? 'Your money is on its way back to you.'
        : 'We have asked for your refund. URA will finish it soon.';
    }, 'Could not get your money back right now. Please try again.');

  const claim = () =>
    run(async () => {
      await paymentsApi.claim(order._id);
      return 'Payment claimed. It has been paid to your wallet.';
    }, 'Could not claim right now. Please try again.');

  const any = Object.values(a).some(Boolean);
  if (!any) return null;

  const spin = <Loader2 size={16} className="animate-spin" />;

  return (
    <>
      {/* Phones: one full-width button per row. Larger screens: in a row. */}
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap *:w-full sm:*:w-auto">
        {a.pay &&
          (onPay ? (
            <Button onClick={onPay} disabled={busy} className="h-11 sm:h-9 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
              <CreditCard size={16} className="mr-1" /> Pay now
            </Button>
          ) : (
            <Button asChild className="h-11 sm:h-9 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
              <Link to={`/dashboard/orders/${order._id}`}>
                <CreditCard size={16} className="mr-1" /> Pay now
              </Link>
            </Button>
          ))}
        {a.confirmDelivery && (
          <Button onClick={() => setSheet('confirm')} disabled={busy} className="h-11 sm:h-9 rounded-xl bg-green-600 hover:bg-green-700 font-bold">
            <PackageCheck size={16} className="mr-1" /> Confirm delivery
          </Button>
        )}
        {a.getRefund && (
          <Button onClick={() => setSheet('refund')} disabled={busy} className="h-11 sm:h-9 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
            <RotateCcw size={16} className="mr-1" /> Get my money back
          </Button>
        )}
        {a.reportProblem && (
          <Button variant="outline" onClick={() => setSheet('problem')} disabled={busy} className="h-11 sm:h-9 rounded-xl border-red-200 text-red-600 font-bold">
            <AlertTriangle size={16} className="mr-1" /> Report a problem
          </Button>
        )}
        {a.cancel && (
          <Button variant="outline" onClick={() => setSheet('cancel')} disabled={busy} className="h-11 sm:h-9 rounded-xl font-bold">
            <XCircle size={16} className="mr-1" /> Cancel
          </Button>
        )}

        {a.markReady && (
          <Button onClick={() => markReady('pickup')} disabled={busy} className="h-11 sm:h-9 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold">
            {busy ? spin : isDelivery ? (
              <><Truck size={16} className="mr-1" /> Book a rider</>
            ) : (
              <><Store size={16} className="mr-1" /> Ready for pickup</>
            )}
          </Button>
        )}
        {a.markReady && !isDelivery && (
          <Button variant="outline" onClick={() => markReady('self_delivery')} disabled={busy} className="h-11 sm:h-9 rounded-xl border-orange-200 text-orange-700 font-bold">
            <Truck size={16} className="mr-1" /> I&apos;ll deliver it myself
          </Button>
        )}
        {a.claimPayment && (
          <Button variant="outline" onClick={claim} disabled={busy} className="h-11 sm:h-9 rounded-xl font-bold">
            {busy ? spin : <><BadgeCheck size={16} className="mr-1" /> Claim payment</>}
          </Button>
        )}
        {a.respondToProblem && (
          <Button variant="outline" onClick={() => setSheet('problem')} disabled={busy} className="h-11 sm:h-9 rounded-xl border-red-200 text-red-600 font-bold">
            <AlertTriangle size={16} className="mr-1" /> Respond to problem
          </Button>
        )}
        {a.reject && (
          <Button variant="outline" onClick={() => setSheet('reject')} disabled={busy} className="h-11 sm:h-9 rounded-xl border-red-200 text-red-600 font-bold">
            <Ban size={16} className="mr-1" /> Reject order
          </Button>
        )}
      </div>

      {sheet === 'confirm' && (
        <ConfirmSheet
          icon={<PackageCheck className="h-10 w-10 text-green-600" />}
          title="Confirm delivery"
          text={`Confirming releases ${formatNaira(order.itemsTotal)} to ${order.shopName}. This can't be undone.`}
          confirmLabel="Confirm delivery"
          cancelLabel="Not yet"
          tone="green"
          busy={busy}
          onConfirm={confirmDelivery}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'cancel' && (
        <ConfirmSheet
          title="Cancel this order?"
          text="You have not paid for it yet. The shop will not get it."
          confirmLabel="Cancel order"
          cancelLabel="Keep it"
          tone="red"
          busy={busy}
          onConfirm={cancel}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'reject' && (
        <ConfirmSheet
          icon={<Ban className="h-10 w-10 text-red-600" />}
          title="Reject this order?"
          text="Only do this if you can't fill it. The buyer gets their money back and the items go back on sale."
          confirmLabel="Reject order"
          cancelLabel="Keep it"
          tone="red"
          busy={busy}
          onConfirm={reject}
          onClose={() => setSheet(null)}
        >
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            maxLength={300}
            rows={3}
            placeholder="Reason for the buyer (optional)"
            className="mt-4 w-full rounded-xl border border-gray-200 p-3 text-left text-base sm:text-sm outline-none focus:ring-2 focus:ring-orange-300"
          />
        </ConfirmSheet>
      )}
      {sheet === 'refund' && (
        <ConfirmSheet
          icon={<RotateCcw className="h-10 w-10 text-orange-600" />}
          title="Get my money back"
          text={`${order.shopName} could not fill this order. Your money will go back to you.`}
          confirmLabel="Get my money back"
          busy={busy}
          onConfirm={refund}
          onClose={() => setSheet(null)}
        />
      )}
      {sheet === 'problem' && (
        <ProblemDialog
          orderId={order._id}
          asSeller={order.role === 'seller'}
          onClose={() => setSheet(null)}
          onDone={() => {
            setSheet(null);
            onChanged();
          }}
        />
      )}
    </>
  );
}
