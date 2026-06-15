import { useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePaymentHistory, type PaylukTransaction } from '@/hooks/api/use-payment-history';
import { format } from 'date-fns';
import { toast } from 'sonner';

function formatAmount(amount: number, currency = 'NGN') {
  const c = currency === 'NG' ? 'NGN' : currency;
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: c }).format(amount);
}

const STATUS_STYLES: Record<string, string> = {
  success: 'bg-green-50 text-green-600',
  pending: 'bg-yellow-50 text-yellow-600',
  failed: 'bg-red-50 text-red-600',
};

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status.toLowerCase()] ?? 'bg-gray-100 text-gray-500';
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${style}`}
    >
      {status}
    </span>
  );
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="ml-1 text-gray-300 hover:text-gray-500 transition-colors">
      {copied ? <Check size={11} className="text-green-500" /> : <Copy size={11} />}
    </button>
  );
}

function TransactionRow({ tx }: { tx: PaylukTransaction }) {
  const isCredit = tx.creditType === 'credit';
  return (
    <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          isCredit ? 'bg-green-50' : 'bg-red-50'
        }`}
      >
        {isCredit ? (
          <ArrowDownLeft size={16} className="text-green-500" />
        ) : (
          <ArrowUpRight size={16} className="text-red-400" />
        )}
      </div>

      {/* Main info */}
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <p className="text-sm font-bold text-gray-800 capitalize">{tx.transactionType}</p>
          <StatusBadge status={tx.status} />
          <span
            className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isCredit ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-400'}`}
          >
            {tx.creditType}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <p className="text-xs text-gray-400 font-mono truncate">{tx.reference}</p>
          <CopyButton value={tx.reference} />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          {format(new Date(tx.createdAt), 'dd MMM yyyy · h:mm a')}
        </p>
        <p className="text-[11px] text-gray-400">
          Updated {format(new Date(tx.updatedAt), 'dd MMM yyyy · h:mm a')}
        </p>
      </div>

      {/* Amount + Fee */}
      <div className="text-right shrink-0">
        <p className={`text-base font-black ${isCredit ? 'text-green-600' : 'text-red-500'}`}>
          {isCredit ? '+' : '-'}
          {formatAmount(tx.amount, tx.currency)}
        </p>
        {tx.fee > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">
            Fee: {formatAmount(tx.fee, tx.currency)}
          </p>
        )}
        <p className="text-[10px] text-gray-300 mt-1 uppercase tracking-widest font-bold">
          {tx.currency === 'NG' ? 'NGN' : tx.currency}
        </p>
      </div>
    </div>
  );
}

function Pagination({
  page,
  pages,
  isLastPage,
  onPrev,
  onNext,
}: {
  page: number;
  pages: number;
  isLastPage: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={onPrev}
        className="gap-1 rounded-xl"
      >
        <ChevronLeft size={14} /> Previous
      </Button>
      <span className="text-xs text-gray-400 font-bold">
        Page {page} of {pages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={isLastPage}
        onClick={onNext}
        className="gap-1 rounded-xl"
      >
        Next <ChevronRight size={14} />
      </Button>
    </div>
  );
}

export default function TransactionHistoryPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);

  const { data, isLoading } = usePaymentHistory(user?.paylukCustomerId, page, 15);
  const transactions = data?.data ?? [];
  const pagination = data?.pagination;

  if (!user?.paylukCustomerId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm font-bold">Payment profile not set up</p>
        <p className="text-xs mt-1">Set up your Payluk account to view transactions.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Transaction History</h2>
        {pagination && (
          <p className="text-xs text-gray-400 mt-1">
            {pagination.count} transaction{pagination.count !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {isLoading && (
        <div className="py-16 flex flex-col items-center gap-3 opacity-40">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Loading transactions...
          </p>
        </div>
      )}

      {!isLoading && transactions.length === 0 && (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ArrowDownLeft size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-500">No Transactions Yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Your recent transactions will appear here once you make them.
          </p>
        </div>
      )}

      {!isLoading && transactions.length > 0 && (
        <>
          <div className="divide-y divide-gray-50">
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </div>

          {pagination && (
            <Pagination
              page={page}
              pages={pagination.pages}
              isLastPage={pagination.isLastPage}
              onPrev={() => setPage((p) => p - 1)}
              onNext={() => setPage((p) => p + 1)}
            />
          )}
        </>
      )}
    </div>
  );
}
