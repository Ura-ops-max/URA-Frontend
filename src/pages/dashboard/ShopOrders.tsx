// Shop Orders: paid orders customers placed with my shop.
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import { useShopOrders } from '@/hooks/api/use-orders';
import { SELLER_TABS, sellerTab } from '@/lib/order-lists';
import OrderListLayout from '@/components/orders/OrderListLayout';
import OrderAlertsPanel from '@/components/orders/OrderAlertsPanel';

export default function ShopOrdersPage() {
  const { user } = useAuthContext();
  const isSeller = Boolean(user?.isBusinessOwner);
  const { data, isLoading, isError, refetch } = useShopOrders(isSeller);

  if (user && !isSeller) return <Navigate to="/dashboard/my-orders" replace />;

  return (
    <OrderListLayout
      title="Shop Orders"
      subtitle="Paid orders from your customers."
      header={<OrderAlertsPanel />}
      tabs={SELLER_TABS}
      tabOf={sellerTab}
      orders={data}
      loading={isLoading}
      error={isError}
      empty={{
        new: 'No new orders. When a customer pays, the order shows up here.',
        ready: 'Orders you marked ready or on the way show up here.',
        done: 'Delivered orders show up here.',
        problems: 'No problems. Orders with a reported problem, a rejection or a refund show up here.',
      }}
      onChanged={() => refetch()}
    />
  );
}
