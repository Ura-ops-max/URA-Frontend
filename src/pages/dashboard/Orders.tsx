import { useEffect, useState } from 'react';
import { useOrders } from '@/hooks/api/use-orders';
import {
  Package,
  ChevronRight,
  Truck,
  ShoppingBag,
  Store,
  MapPin,
  Phone,
  Loader2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductThumb } from '@/components/product/shared/ProductThumb';
import { useAuthContext } from '@/context/auth-provider';
import { orderAPI } from '@/lib/api';
import { formatNaira, getStatusConfig } from '@/lib/order-status';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Paid', value: 'processing' },
  { label: 'On the way / Ready', value: 'shipped' },
  { label: 'Completed', value: 'delivered' },
];

const OrdersPage = () => {
  const { user } = useAuthContext();
  const isSeller = !!user?.isBusinessOwner;
  const [view, setView] = useState<'purchases' | 'received'>('purchases');
  const [activeTab, setActiveTab] = useState('all');

  const { orders, isLoading } = useOrders();
  const [received, setReceived] = useState<any[]>([]);
  const [receivedLoading, setReceivedLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadReceived = async () => {
    setReceivedLoading(true);
    try {
      const { data } = await orderAPI.getReceivedOrders();
      setReceived(data?.orders ?? []);
    } catch (err) {
      console.error('Received orders fetch error:', err);
    } finally {
      setReceivedLoading(false);
    }
  };

  useEffect(() => {
    if (isSeller && view === 'received') loadReceived();
  }, [isSeller, view]);

  const markReady = async (order: any, mode?: 'pickup' | 'self_delivery') => {
    setBusyId(order._id);
    try {
      await orderAPI.markOrderReady(order._id, order.deliveryMethod === 'delivery' ? undefined : mode);
      toast.success(
        order.deliveryMethod === 'delivery'
          ? 'Delivery booked. The buyer has been told it is on the way.'
          : mode === 'self_delivery'
            ? "The buyer has been told you're bringing it."
            : 'The buyer has been told the order is ready for pickup.',
      );
      await loadReceived();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not update the order. Please try again.');
    } finally {
      setBusyId(null);
    }
  };

  const list = view === 'received' ? received : orders;
  const loading = view === 'received' ? receivedLoading : isLoading;
  const filteredOrders =
    list?.filter((order: any) => (activeTab === 'all' ? true : order.status === activeTab)) || [];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Orders</h1>

        {/* Buyer / seller switch (sellers only) */}
        {isSeller && (
          <div className="mb-5 inline-flex rounded-full bg-gray-100 p-1">
            {[
              { v: 'purchases', l: 'My purchases' },
              { v: 'received', l: 'Orders received' },
            ].map((t) => (
              <button
                key={t.v}
                onClick={() => {
                  setView(t.v as 'purchases' | 'received');
                  setActiveTab('all');
                }}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-bold transition',
                  view === t.v ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500',
                )}
              >
                {t.l}
              </button>
            ))}
          </div>
        )}

        {/* STATUS FILTERS */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={cn(
                'px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border',
                activeTab === tab.value
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200'
                  : 'bg-white text-gray-400 border-gray-100 hover:border-orange-200 hover:text-orange-600',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex items-center justify-center italic text-gray-400">Fetching orders...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            {view === 'received' ? 'No orders received yet' : 'No orders found'}
          </h2>
          <p className="text-gray-500 mb-8 max-w-xs text-sm">
            {view === 'received'
              ? 'When a customer pays for one of your products, it will show up here.'
              : "You haven't made any purchases yet. Your full order history will appear here."}
          </p>
          {view === 'purchases' && (
            <Link to="/dashboard">
              <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-xl font-bold flex items-center gap-2">
                <ShoppingBag size={18} />
                Explore Marketplace
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: any) => {
            const status = getStatusConfig(order.status, order.deliveryMethod, order.fulfilment);
            const buyerName = `${order.user?.firstName ?? ''} ${order.user?.lastName ?? ''}`.trim();
            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Order Number</p>
                      <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        {view === 'received' ? 'Customer' : 'Placed On'}
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {view === 'received' ? buyerName || 'Customer' : new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter',
                      status.color,
                    )}
                  >
                    <status.icon size={14} />
                    {status.label}
                  </div>
                </div>

                {/* Order Content */}
                <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4 overflow-hidden">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="inline-block h-14 w-14 rounded-xl border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                        >
                          {item.image ? <ProductThumb url={item.image} alt="" /> : null}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="inline-block h-14 w-14 rounded-xl border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[220px]">
                        {order.items[0]?.name}{' '}
                        {order.items.length > 1 ? `& ${order.items.length - 1} more items` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} Items • {formatNaira(order.totalAmount)} •{' '}
                        {order.deliveryMethod === 'delivery' ? 'Delivery' : 'Pickup'}
                      </p>
                      {view === 'received' && (
                        <div className="mt-1.5 space-y-0.5 text-xs text-gray-500">
                          {order.shippingAddress?.fullAddress && (
                            <p className="flex items-center gap-1">
                              <MapPin size={12} />
                              {[order.shippingAddress.fullAddress, order.shippingAddress.city, order.shippingAddress.state]
                                .filter(Boolean)
                                .join(', ')}
                            </p>
                          )}
                          {order.shippingAddress?.phone && (
                            <p className="flex items-center gap-1">
                              <Phone size={12} /> {order.shippingAddress.phone}
                            </p>
                          )}
                        </div>
                      )}
                      {order.trackingNumber && (
                        <p className="mt-1 text-xs font-semibold text-blue-600">Tracking: {order.trackingNumber}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {view === 'received' && order.status === 'processing' && (
                      <Button
                        onClick={() => markReady(order, 'pickup')}
                        disabled={busyId === order._id}
                        className="rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-xs h-10"
                      >
                        {busyId === order._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : order.deliveryMethod === 'delivery' ? (
                          <>
                            <Truck size={14} className="mr-1" /> Book delivery
                          </>
                        ) : (
                          <>
                            <Store size={14} className="mr-1" /> Ready for pickup
                          </>
                        )}
                      </Button>
                    )}
                    {view === 'received' && order.status === 'processing' && order.deliveryMethod !== 'delivery' && (
                      <Button
                        variant="outline"
                        onClick={() => markReady(order, 'self_delivery')}
                        disabled={busyId === order._id}
                        className="rounded-xl border-orange-200 text-orange-700 font-bold text-xs h-10"
                      >
                        <Truck size={14} className="mr-1" /> I&apos;ll deliver it myself
                      </Button>
                    )}
                    <Link to={`/dashboard/orders/${order._id}`}>
                      <Button variant="outline" className="rounded-xl border-gray-200 font-bold text-xs h-10 group">
                        View Details
                        <ChevronRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
