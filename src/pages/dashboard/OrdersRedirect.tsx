// The old /dashboard/orders page is now two pages. Checkout and old links
// still send people here, so pass them on (keeping any ?tab=).
import { Navigate, useSearchParams } from 'react-router-dom';

export default function OrdersRedirect() {
  const [params] = useSearchParams();
  const to = params.get('view') === 'received' ? '/dashboard/shop-orders' : '/dashboard/my-orders';
  const tab = params.get('tab');
  return <Navigate to={tab ? `${to}?tab=${encodeURIComponent(tab)}` : to} replace />;
}
