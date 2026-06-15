import { ArrowDownLeft, ArrowUpRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { usePaymentHistory, type PaylukTransaction } from '@/hooks/api/use-payment-history';
import { formatDistanceToNow } from 'date-fns';

function formatAmount(amount: number, currency = 'NGN') {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

function StatusBadge({ status }: { status: PaylukTransaction['status'] }) {
  const styles = {
    success: 'bg-green-50 text-green-600',
    pending: 'bg-yellow-50 text-yellow-600',
    failed: 'bg-red-50 text-red-600',
  };
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

interface RecentTransactionsProps {
  customerId: string;
}

export default function RecentTransactions({ customerId }: RecentTransactionsProps) {
  const { data, isLoading } = usePaymentHistory(customerId, 1, 5);
  const transactions = data?.data ?? [];

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-gray-700 uppercase tracking-widest">
          Recent Transactions
        </h3>
        <Link
          to="/dashboard/wallet/transactions"
          className="text-xs font-bold text-orange-500 hover:text-orange-600 transition-colors"
        >
          View all
        </Link>
      </div>

      {isLoading && (
        <div className="py-8 flex items-center justify-center gap-2 opacity-40">
          <Loader2 className="h-4 w-4 animate-spin text-orange-400" />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Loading...</p>
        </div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="py-10 text-center text-gray-400">
          <p className="text-sm font-bold">No transactions yet</p>
          <p className="text-xs mt-1">Your transactions will appear here.</p>
        </div>
      )}

      {!isLoading && transactions.length > 0 && (
        <div className="rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Type
                </th>
                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Reference
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Amount
                </th>
                <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hidden md:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          tx.creditType === 'credit' ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        {tx.creditType === 'credit' ? (
                          <ArrowDownLeft size={13} className="text-green-500" />
                        ) : (
                          <ArrowUpRight size={13} className="text-red-400" />
                        )}
                      </div>
                      <span className="capitalize text-xs font-semibold text-gray-600">
                        {tx.transactionType}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-gray-400 font-mono truncate block max-w-[120px]">
                      {tx.reference}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={`text-sm font-black ${
                        tx.creditType === 'credit' ? 'text-green-600' : 'text-red-500'
                      }`}
                    >
                      {tx.creditType === 'credit' ? '+' : '-'}
                      {formatAmount(tx.amount, tx.currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge status={tx.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-400 hidden md:table-cell">
                    {formatDistanceToNow(new Date(tx.createdAt), { addSuffix: true })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
