import { useState } from 'react';
import { Loader2, ShoppingCart, Copy, Check } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  useEscrowTransactions,
  type EscrowStatus,
  type EscrowTransaction,
} from '@/hooks/api/use-escrow-transactions';
import { StatusBadge, FilterChip, Pagination, STATUS_OPTIONS } from './SellerTransactionsPage';
import { format, isValid } from 'date-fns';

function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : '—';
}
import { toast } from 'sonner';
import { OrderLink } from './OrderLink';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success(`${label} copied!`);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-orange-500 transition-colors"
    >
      {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ── Confirm Payment inline button ─────────────────────────────────────────────
function Detail({
  label,
  value,
  capitalize,
}: {
  label: string;
  value: string;
  capitalize?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">{label}</p>
      <p className={`font-bold text-gray-700 text-xs mt-0.5 ${capitalize ? 'capitalize' : ''}`}>
        {value}
      </p>
    </div>
  );
}

function TransactionCard({ tx }: { tx: EscrowTransaction }) {
  return (
      <div className="p-5 rounded-2xl border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <ShoppingCart size={16} className="text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-gray-900 truncate">{tx.purpose}</p>
              <p className="text-xs text-gray-400 truncate">{tx.description}</p>
            </div>
          </div>
          <StatusBadge status={tx.status} />
        </div>

        {/* Details */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          <Detail label="Amount" value={formatNGN(tx.amount)} />
          <Detail label="Fee" value={formatNGN(tx.fee)} />
          <Detail label="Quantity" value={String(tx.totalQuantity)} />
          <Detail label="Delivery" value={`${tx.maxDelivery} ${tx.deliveryTimeline}`} />
          <Detail label="Who Pays Fee" value={tx.whoPays} capitalize />
          {tx.paymentDetails && (
            <Detail label="Payment Status" value={tx.paymentDetails.status} capitalize />
          )}
        </div>

        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
              Transaction ID
            </p>
            <p className="text-xs font-mono font-bold text-gray-700 truncate max-w-[220px]">
              {tx.id}
            </p>
          </div>
          <CopyButton value={tx.id} label="Transaction ID" />
        </div>

        <p className="text-[11px] text-gray-400">
          Created {safeFormat(tx.createdAt, 'dd MMM yyyy · h:mm a')}
        </p>

        {/* Confirming and disputes happen on the order (through URA's backend). */}
        <div className="pt-2 border-t border-gray-50">
          <OrderLink tx={tx} />
        </div>
      </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function BuyerTransactionsPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EscrowStatus | undefined>(undefined);

  const { data, isLoading, isFetching } = useEscrowTransactions(
    user?.paylukCustomerId,
    'buy',
    status,
    page,
  );
  console.log('BuyerTransactionsPage data', data, 'isLoading', isLoading, 'isFetching', isFetching);
  const allTransactions = data?.data ?? [];
  const transactions = status
    ? allTransactions.filter((tx) => tx.status === status)
    : allTransactions;
  const pagination = data?.pagination;
  const report = data?.report;

  if (!user?.paylukCustomerId) {
    return (
      <div className="py-16 text-center text-gray-400">
        <p className="text-sm font-bold">Payment profile not set up</p>
      </div>
    );
  }

  const showLoading = isLoading || isFetching;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-black text-gray-900">Purchase Transactions</h2>
        <p className="text-xs text-gray-400 mt-1">
          {pagination ? `${pagination.count} transaction${pagination.count !== 1 ? 's' : ''}` : ''}
          {status && <span className="ml-1 font-bold text-orange-500">· {status}</span>}
        </p>
      </div>

      {/* Summary */}
      {report && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total', val: report.amount.total },
            { label: 'Ongoing', val: report.amount.ongoing },
            { label: 'Completed', val: report.amount.completed },
            { label: 'Disputed', val: report.amount.dispute },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                {s.label}
              </p>
              <p className="text-sm font-black text-gray-800">{formatNGN(s.val)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        <FilterChip
          label="All"
          active={!status}
          onClick={() => {
            setStatus(undefined);
            setPage(1);
          }}
        />
        {STATUS_OPTIONS.map((s) => (
          <FilterChip
            key={s}
            label={s}
            active={status === s}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
          />
        ))}
      </div>

      {showLoading ? (
        <div className="py-16 flex flex-col items-center gap-3 opacity-40">
          <Loader2 className="h-6 w-6 animate-spin text-orange-400" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            {isFetching && !isLoading ? 'Filtering...' : 'Loading...'}
          </p>
        </div>
      ) : transactions.length === 0 ? (
        <div className="py-16 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-500">No Transactions</p>
          <p className="text-xs text-gray-400 mt-1">
            {status ? `No ${status} purchase transactions found.` : 'No purchase transactions yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} />
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
