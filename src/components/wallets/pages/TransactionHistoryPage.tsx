import { useState } from 'react';
import { ArrowDownLeft, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { useWalletActivity } from '@/hooks/api/use-wallet-activity';
import { ActivityRow } from '../ui/ActivityRow';

export default function TransactionHistoryPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const { data, isLoading } = useWalletActivity(user?.paylukCustomerId, page, 15);
  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  if (!user?.paylukCustomerId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm font-bold">Payment profile not set up</p>
        <p className="mt-1 text-xs">Set up your payment profile to see your transactions.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-xl font-black text-gray-900">Transaction History</h2>
        {pagination?.count != null && (
          <p className="mt-1 text-xs text-gray-400">
            {pagination.count} transaction{pagination.count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-16 opacity-50">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading transactions...</p>
        </div>
      )}

      {!isLoading && rows.length === 0 && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
            <ArrowDownLeft size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-500">No transactions yet</p>
          <p className="mt-1 text-xs text-gray-400">Your payments and withdrawals will show here.</p>
        </div>
      )}

      {!isLoading && rows.length > 0 && (
        <>
          <div className="divide-y divide-gray-50">
            {rows.map((r) => (
              <ActivityRow key={r.id} row={r} />
            ))}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="gap-1 rounded-xl">
                <ChevronLeft size={14} /> Previous
              </Button>
              <span className="text-xs font-bold text-gray-400">
                Page {page} of {pagination.pages}
              </span>
              <Button variant="outline" size="sm" disabled={pagination.isLastPage} onClick={() => setPage((p) => p + 1)} className="gap-1 rounded-xl">
                Next <ChevronRight size={14} />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
