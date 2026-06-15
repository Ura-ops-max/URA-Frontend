import { useState } from 'react';
import { Loader2, ChevronLeft, ChevronRight, Package, Copy, Check, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import {
  useEscrowTransactions,
  type EscrowStatus,
  type EscrowTransaction,
} from '@/hooks/api/use-escrow-transactions';
import { format, isValid } from 'date-fns';

function safeFormat(dateStr: string | null | undefined, fmt: string): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isValid(d) ? format(d, fmt) : '—';
}
import { toast } from 'sonner';
import paylukAPI from '@/lib/payluk-axios';

function formatNGN(amount: number) {
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export const STATUS_OPTIONS: EscrowStatus[] = [
  'PENDING',
  'ONGOING',
  'COMPLETED',
  'REFUNDED',
  'CLAIMED',
  'DISPUTED',
  'INVESTIGATING',
];

export const STATUS_STYLES: Record<EscrowStatus, string> = {
  PENDING: 'bg-yellow-50 text-yellow-600',
  ONGOING: 'bg-blue-50 text-blue-600',
  COMPLETED: 'bg-green-50 text-green-600',
  REFUNDED: 'bg-purple-50 text-purple-600',
  CLAIMED: 'bg-teal-50 text-teal-600',
  DISPUTED: 'bg-red-50 text-red-600',
  INVESTIGATING: 'bg-orange-50 text-orange-600',
};

export function StatusBadge({ status }: { status: EscrowStatus }) {
  return (
    <span
      className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}
    >
      {status}
    </span>
  );
}

export function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? 'bg-gray-900 text-white border-gray-900'
          : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'
      }`}
    >
      {label}
    </button>
  );
}

export function Pagination({
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
        Page {page} of {Math.max(pages, 1)}
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

function CopyTokenButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    toast.success('Payment token copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="inline-flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-orange-500 transition-colors"
    >
      {copied ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
      {copied ? 'Copied' : 'Copy token'}
    </button>
  );
}

function ClaimButton({
  paymentToken,
  customerId,
  status,
}: {
  paymentToken: string;
  customerId: string;
  status: EscrowStatus;
}) {
  const [loading, setLoading] = useState(false);
  const claimable = status === 'COMPLETED';

  const handleClaim = async () => {
    setLoading(true);
    try {
      const { data } = await paylukAPI.get(`/escrow/claim-funds/${paymentToken}`, {
        headers: { 'customer-id': customerId, accept: 'application/json' },
      });
      toast.success(data?.message ?? 'Funds claimed successfully!');
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Failed to claim funds.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="sm"
      onClick={handleClaim}
      disabled={loading || !claimable}
      title={!claimable ? `Status must be COMPLETED to claim (currently ${status})` : undefined}
      className={`h-8 rounded-xl text-xs font-bold gap-1.5 ${
        claimable
          ? 'bg-orange-500 hover:bg-orange-600 text-white'
          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
      }`}
    >
      {loading ? <Loader2 size={12} className="animate-spin" /> : <BadgeCheck size={12} />}
      Claim Funds
    </Button>
  );
}

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

function TransactionCard({ tx, customerId }: { tx: EscrowTransaction; customerId: string }) {
  return (
    <div className="p-5 rounded-2xl border border-gray-100 hover:border-orange-100 hover:shadow-sm transition-all space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
            <Package size={16} className="text-orange-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-black text-gray-900 truncate">{tx.purpose}</p>
            <p className="text-xs text-gray-400 truncate">{tx.description}</p>
          </div>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
        <Detail label="Amount" value={formatNGN(tx.amount)} />
        <Detail label="Fee" value={formatNGN(tx.fee)} />
        <Detail label="Quantity" value={String(tx.totalQuantity)} />
        <Detail label="Delivery" value={`${tx.maxDelivery} ${tx.deliveryTimeline}`} />
        <Detail label="Who Pays Fee" value={tx.whoPays} capitalize />
        <Detail label="Channel" value={tx.channel} />
        {tx.paymentDetails && (
          <>
            <Detail label="Payment Status" value={tx.paymentDetails.status} capitalize />
            <Detail label="Paid Amount" value={formatNGN(tx.paymentDetails.amount)} />
          </>
        )}
        {tx.completedAt && (
          <Detail label="Completed" value={safeFormat(tx.completedAt, 'dd MMM yyyy')} />
        )}
      </div>

      <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-0.5">
            Payment Token
          </p>
          <p className="text-xs font-mono font-bold text-gray-700">{tx.paymentToken}</p>
        </div>
        <CopyTokenButton value={tx.paymentToken} />
      </div>

      <p className="text-[11px] text-gray-400">
        Created {safeFormat(tx.createdAt, 'dd MMM yyyy · h:mm a')}
        {tx.updatedAt && tx.updatedAt !== tx.createdAt && (
          <>
            {' · '}Updated {safeFormat(tx.updatedAt, 'dd MMM yyyy · h:mm a')}
          </>
        )}
      </p>

      <div className="pt-2 border-t border-gray-50">
        <ClaimButton paymentToken={tx.paymentToken} customerId={customerId} status={tx.status} />
      </div>
    </div>
  );
}

export default function SellerTransactionsPage() {
  const { user } = useCurrentUser();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<EscrowStatus | undefined>(undefined);

  const { data, isLoading, isFetching } = useEscrowTransactions(
    user?.paylukCustomerId,
    'sales',
    status,
    page,
  );

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
        <h2 className="text-xl font-black text-gray-900">Sales Transactions</h2>
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

      {/* Status filter */}
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

      {/* Content */}
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
            <Package size={24} className="text-gray-300" />
          </div>
          <p className="text-sm font-bold text-gray-500">No Transactions</p>
          <p className="text-xs text-gray-400 mt-1">
            {status ? `No ${status} transactions found.` : 'No sales transactions yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {transactions.map((tx) => (
              <TransactionCard key={tx.id} tx={tx} customerId={user.paylukCustomerId!} />
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
