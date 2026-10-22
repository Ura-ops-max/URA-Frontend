import { ArrowLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useHeldOrders, type HeldOrder } from '@/hooks/api/use-wallet-activity';
import { formatMoney, toDate } from '@/lib/money';

/** Orders whose money is held in Buyer-Protected right now. */
export default function HeldOrdersPage() {
  const { data: orders = [], isLoading } = useHeldOrders();
  const sales = orders.filter((o) => o.role === 'seller');
  const purchases = orders.filter((o) => o.role === 'buyer');

  return (
    <div>
      <Link to="/dashboard/wallet/overview" className="mb-4 inline-flex items-center gap-1 text-sm font-bold text-gray-500 hover:text-orange-600">
        <ArrowLeft size={16} /> Overview
      </Link>
      <h2 className="text-xl font-black text-gray-900">Held in Buyer-Protected</h2>
      <p className="mt-1 text-sm text-gray-500">Money waiting for the buyer to confirm delivery.</p>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
        </div>
      )}
      {!isLoading && orders.length === 0 && <p className="py-12 text-center text-sm text-gray-400">No money is held right now.</p>}

      {sales.length > 0 && <Section title="Your sales" rows={sales} />}
      {purchases.length > 0 && <Section title="Your purchases" rows={purchases} />}
    </div>
  );
}

function Section({ title, rows }: { title: string; rows: HeldOrder[] }) {
  return (
    <div className="mt-6">
      <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-gray-400">{title}</h3>
      <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
        {rows.map((o) => {
          const release = toDate(o.autoReleaseAt);
          return (
            <Link key={o.orderId} to={`/dashboard/orders/${o.orderId}`} className="flex items-start gap-3 p-4 hover:bg-gray-50 sm:items-center">
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 truncate text-sm font-bold text-gray-900">
                    {o.role === 'seller' ? `From ${o.name}` : `To ${o.name}`}
                  </p>
                  <p className="shrink-0 text-sm font-black text-gray-900">{formatMoney(o.amount)}</p>
                </div>
                <p className="text-xs font-semibold text-gray-400">{o.orderNumber}</p>
                <p className="mt-0.5 text-xs text-gray-500">
                  {o.problem
                    ? 'A problem was reported. Payment is on hold.'
                    : release
                      ? `${o.role === 'seller' ? 'Money arrives' : 'Paid to the shop'} on ${format(release, 'dd MMM, h:mm a')} unless a problem is reported`
                      : 'Waiting for the buyer to confirm delivery'}
                </p>
              </div>
              <ChevronRight size={16} className="mt-0.5 shrink-0 text-gray-300 sm:mt-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
