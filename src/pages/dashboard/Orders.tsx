import { useState } from 'react';
import { useOrders } from '@/hooks/api/use-orders';
import {
  Package,
  ChevronRight,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ShoppingBag,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ProductThumb } from '@/components/product/shared/ProductThumb';

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Pending', value: 'pending' },
  { label: 'Shipped', value: 'shipped' },
  { label: 'Delivered', value: 'delivered' },
];

const OrdersPage = () => {
  const { orders, isLoading } = useOrders();
  const [activeTab, setActiveTab] = useState('all');

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(price);

  // Filter Logic
  const filteredOrders =
    orders?.filter((order: any) => (activeTab === 'all' ? true : order.status === activeTab)) || [];

  // Helper for Status UI
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'delivered':
        return { color: 'text-green-600 bg-green-50', icon: CheckCircle2, label: 'Delivered' };
      case 'shipped':
        return { color: 'text-blue-600 bg-blue-50', icon: Truck, label: 'In Transit' };
      case 'pending':
        return { color: 'text-orange-600 bg-orange-50', icon: Clock, label: 'Processing' };
      case 'cancelled':
        return { color: 'text-red-600 bg-red-50', icon: XCircle, label: 'Cancelled' };
      default:
        return { color: 'text-gray-600 bg-gray-50', icon: Package, label: status };
    }
  };

  if (isLoading)
    return (
      <div className="h-96 flex items-center justify-center italic text-gray-400">
        Fetching your orders...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 lg:py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-6">Order History</h1>

        {/* TAB FILTERS */}
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

      {/* ORDERS LIST */}
      {filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
            <Package className="w-10 h-10 text-gray-200" />
          </div>
          <h2 className="text-xl font-black text-gray-900 mb-2">
            {activeTab === 'all' ? 'No orders found' : `No ${activeTab} orders`}
          </h2>
          <p className="text-gray-500 mb-8 max-w-xs text-sm">
            {activeTab === 'all'
              ? "You haven't made any purchases yet. Your full order history will appear here."
              : `You don't have any orders currently marked as ${activeTab}.`}
          </p>
          <Link to="/dashboard/deal-offer">
            <Button className="bg-orange-600 hover:bg-orange-700 h-12 px-8 rounded-xl font-bold flex items-center gap-2">
              <ShoppingBag size={18} />
              Explore Marketplace
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order: any) => {
            const status = getStatusConfig(order.status);
            return (
              <div
                key={order._id}
                className="bg-white border border-gray-100 rounded-[24px] overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Order Top Bar */}
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Order Number
                      </p>
                      <p className="text-sm font-bold text-gray-900">#{order.orderNumber}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200 hidden sm:block" />
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                        Placed On
                      </p>
                      <p className="text-sm font-bold text-gray-900">
                        {new Date(order.createdAt).toLocaleDateString()}
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
                    {/* Display up to 3 thumbnails */}
                    <div className="flex -space-x-4 overflow-hidden">
                      {order.items.slice(0, 3).map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="inline-block h-14 w-14 rounded-xl border-2 border-white bg-gray-100 overflow-hidden shadow-sm"
                        >
                          {item.image ? (
                            <ProductThumb url={item.image} alt="" />
                          ) : null}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="inline-block h-14 w-14 rounded-xl border-2 border-white bg-gray-900 text-white flex items-center justify-center text-[10px] font-black">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">
                        {order.items[0].name}{' '}
                        {order.items.length > 1 ? `& ${order.items.length - 1} more items` : ''}
                      </p>
                      <p className="text-xs text-gray-500">
                        {order.items.length} Items • {formattedPrice(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <Link to={`/dashboard/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      className="rounded-xl border-gray-200 font-bold text-xs h-10 group"
                    >
                      View Details
                      <ChevronRight
                        size={14}
                        className="ml-1 group-hover:translate-x-1 transition-transform"
                      />
                    </Button>
                  </Link>
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
