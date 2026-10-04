// Shared order wording/formatting for the Orders and Order Details pages.
import { Package, Clock, CheckCircle2, Truck, XCircle, Store, RotateCcw } from 'lucide-react';

export const formatNaira = (price: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(
    price || 0,
  );

/** One place that turns an order's status into words people understand. */
export const getStatusConfig = (status: string, deliveryMethod?: string, fulfilment?: string) => {
  switch (status) {
    case 'pending':
      return { color: 'text-gray-600 bg-gray-100', icon: Clock, label: 'Awaiting payment' };
    case 'processing':
      return { color: 'text-orange-600 bg-orange-50', icon: Package, label: 'Paid · being prepared' };
    case 'shipped':
      if (fulfilment === 'seller_delivery')
        return { color: 'text-blue-600 bg-blue-50', icon: Truck, label: 'On the way (by the shop)' };
      return deliveryMethod === 'delivery'
        ? { color: 'text-blue-600 bg-blue-50', icon: Truck, label: 'On the way' }
        : { color: 'text-blue-600 bg-blue-50', icon: Store, label: 'Ready for pickup' };
    case 'delivered':
      return { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: 'Completed' };
    case 'cancelled':
      return { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' };
    case 'refunded':
      return { color: 'text-red-600 bg-red-50', icon: RotateCcw, label: 'Refunded' };
    default:
      return { color: 'text-gray-600 bg-gray-50', icon: Package, label: status };
  }
};

