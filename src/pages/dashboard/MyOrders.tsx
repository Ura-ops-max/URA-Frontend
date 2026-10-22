// My Orders: everything I bought, in Active, Delivered and Problems.
import { useMyOrders } from '@/hooks/api/use-orders';
import { BUYER_TABS, buyerTab } from '@/lib/order-lists';
import OrderListLayout from '@/components/orders/OrderListLayout';

export default function MyOrdersPage() {
  const { data, isLoading, isError, refetch } = useMyOrders();
  return (
    <OrderListLayout
      title="My Orders"
      subtitle="Things you bought."
      tabs={BUYER_TABS}
      tabOf={buyerTab}
      orders={data}
      loading={isLoading}
      error={isError}
      empty={{
        active: 'No orders on the way. When you buy something, it shows up here.',
        delivered: 'Orders you have received show up here.',
        problems: 'No problems. Orders with a reported problem or a refund show up here.',
      }}
      onChanged={() => refetch()}
    />
  );
}
