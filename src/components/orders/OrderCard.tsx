// One order in My Orders or Shop Orders: who, what, how much, where it is,
// what happens to the money, and the buttons that apply right now.
import { Link } from 'react-router-dom';
import { ChevronRight, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatNaira, getStatusConfig } from '@/lib/order-status';
import { itemsSummary, NORMAL_PAYMENT_NOTE, type ListOrder } from '@/lib/order-lists';
import ProductImage from '@/components/product/ProductImage';
import OrderActionButtons from './OrderActionButtons';
import WhatsAppButton from './WhatsAppButton';
import { buyerPaidMessage } from '@/lib/whatsapp';

const STEPS = ['Paid', 'Ready', 'Delivered'];

function progressStep(o: ListOrder): number {
  if (o.paymentStatus !== 'paid') return 0;
  if (o.status === 'delivered') return 3;
  if (o.status === 'shipped') return 2;
  return 1;
}

export default function OrderCard({
  order,
  onChanged,
}: {
  order: ListOrder;
  onChanged: () => void;
}) {
  const status = getStatusConfig(order.status, order.deliveryMethod, order.fulfilment ?? undefined);
  const isSeller = order.role === 'seller';
  const step = progressStep(order);
  const shopName = order.shop?.businessName ?? 'the shop';
  const showProgress =
    order.paymentStatus === 'paid' && !['refunded', 'cancelled'].includes(order.status);
  const canMessageShop =
    !isSeller && order.paymentStatus === 'paid' && ['processing', 'shipped'].includes(order.status);

  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-5 hover:shadow-md transition-shadow">
      {/* Who and where it is */}
      <div className="flex flex-col gap-2 min-[420px]:flex-row min-[420px]:items-start min-[420px]:justify-between min-[420px]:gap-3">
        <div className="min-w-0">
          <p className="line-clamp-2 text-sm font-black text-gray-900">
            {isSeller ? (order.buyerName ?? 'A customer') : shopName}
          </p>
          <p className="text-xs text-gray-500">
            #{order.orderNumber} · {new Date(order.paidAt ?? order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={cn(
            'flex shrink-0 items-center gap-1.5 self-start rounded-full px-2.5 py-1 text-[11px] font-black',
            status.color,
          )}
        >
          <status.icon size={13} />
          {status.label}
        </span>
      </div>

      {/* What and how much */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-3 shrink-0">
          {order.items.slice(0, 3).map((item, idx) => (
            <div
              key={idx}
              className="h-12 w-12 overflow-hidden rounded-xl border-2 border-white bg-gray-100 shadow-sm"
            >
              <ProductImage
                src={item.image ?? undefined}
                name={item.name}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <p className="line-clamp-2 text-sm font-semibold text-gray-800">
            {itemsSummary(order.items)}
          </p>
          <p className="text-xs text-gray-500">
            <span className="font-bold text-gray-700">
              {formatNaira(isSeller ? order.itemsTotal : order.totalAmount)}
            </span>{' '}
            · {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
          </p>
          <p className="text-xs text-gray-500">
            {order.paymentType === 'normal' ? 'Normal Payment' : 'Buyer-Protected Payment'}
          </p>
        </div>
      </div>

      {/* Progress */}
      {showProgress && (
        <div className="mt-4 flex gap-1.5" aria-label={`Step ${step} of 3`}>
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div
                className={cn('h-1.5 rounded-full', i < step ? 'bg-green-500' : 'bg-gray-200')}
              />
              <p
                className={cn(
                  'mt-1 text-[10px] font-bold',
                  i < step ? 'text-gray-700' : 'text-gray-400',
                )}
              >
                {label}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* The money */}
      {order.moneyNote && (
        <p className="mt-3 flex items-start gap-1.5 text-xs text-gray-600">
          <ShieldCheck size={14} className="mt-px shrink-0 text-green-600" />
          {order.moneyNote}
        </p>
      )}
      {!isSeller && order.paymentType === 'normal' && order.paymentStatus === 'paid' && (
        <p className="mt-2 text-xs text-gray-500">{NORMAL_PAYMENT_NOTE}</p>
      )}

      {/* Buttons */}
      {canMessageShop && (
        <div className="mt-4">
          <WhatsAppButton
            phone={order.shop?.phone}
            text={buyerPaidMessage(order.orderNumber, itemsSummary(order.items))}
            label={
              <>
                Message {shopName} about order{' '}
                <span className="whitespace-nowrap">{order.orderNumber}</span>
              </>
            }
          />
        </div>
      )}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <OrderActionButtons
          order={{
            _id: order._id,
            orderNumber: order.orderNumber,
            deliveryMethod: order.deliveryMethod,
            itemsTotal: order.itemsTotal,
            shopName,
            role: order.role,
            actions: order.actions,
          }}
          onChanged={onChanged}
        />
        <Link
          to={`/dashboard/orders/${order._id}`}
          className="group inline-flex items-center justify-center gap-1 self-end rounded-xl px-3 py-2 text-xs font-bold text-gray-600 hover:text-orange-600 sm:ml-auto"
        >
          View order
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
