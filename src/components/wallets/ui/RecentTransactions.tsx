import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useWalletActivity } from '@/hooks/api/use-wallet-activity';
import { ActivityRow } from './ActivityRow';

/** The latest 5 money rows on the wallet overview. */
export default function RecentTransactions({ customerId }: { customerId: string }) {
  const { data, isLoading } = useWalletActivity(customerId, 1, 5);
  const rows = data?.data ?? [];

  return (
    <div className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-700">Recent transactions</h3>
        <Link to="/dashboard/wallet/transactions" className="text-xs font-bold text-orange-600 hover:text-orange-700">
          View all
        </Link>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center gap-2 py-8 opacity-50">
          <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading...</p>
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="py-10 text-center text-gray-400">
          <p className="text-sm font-bold">No transactions yet</p>
          <p className="mt-1 text-xs">Your payments and withdrawals will show here.</p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <div className="divide-y divide-gray-50 rounded-2xl border border-gray-100">
          {rows.map((r) => (
            <ActivityRow key={r.id} row={r} />
          ))}
        </div>
      )}
    </div>
  );
}
