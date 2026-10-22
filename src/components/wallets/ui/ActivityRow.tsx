import { ArrowDownLeft, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { formatMoney, toDate } from '@/lib/money';
import type { ActivityStatus, WalletActivityRow } from '@/hooks/api/use-wallet-activity';

const STATUS_STYLES: Record<ActivityStatus, string> = {
  Success: 'bg-green-50 text-green-700',
  Released: 'bg-green-50 text-green-700',
  Pending: 'bg-yellow-50 text-yellow-700',
  Held: 'bg-blue-50 text-blue-700',
  Failed: 'bg-red-50 text-red-700',
};

export function ActivityStatusBadge({ status }: { status: ActivityStatus }) {
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-widest', STATUS_STYLES[status] ?? 'bg-gray-100 text-gray-500')}>
      {status}
    </span>
  );
}

const when = (v: unknown) => {
  const d = toDate(v);
  return d ? format(d, 'dd MMM yyyy · h:mm a') : '';
};

/**
 * One money row: Type, Details, Amount, Status, Date. Rows that belong to an
 * order open that order when tapped.
 */
export function ActivityRow({ row }: { row: WalletActivityRow }) {
  const credit = row.direction === 'credit';
  const body = (
    <>
      <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full', credit ? 'bg-green-50' : 'bg-red-50')}>
        {credit ? <ArrowDownLeft size={16} className="text-green-600" /> : <ArrowUpRight size={16} className="text-red-500" />}
      </div>
      {/* Phones: amount on the top line, details get the full width below. */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-bold text-gray-900">{row.type}</p>
          <p className={cn('shrink-0 text-sm font-black sm:text-base', credit ? 'text-green-600' : 'text-gray-900')}>
            {credit ? '+' : '-'}
            {formatMoney(row.amount, row.currency)}
          </p>
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <ActivityStatusBadge status={row.status} />
          {row.fee > 0 && <span className="text-[10px] text-gray-400">Fee {formatMoney(row.fee, row.currency)}</span>}
        </div>
        <p className="mt-1 line-clamp-2 text-xs text-gray-500">{row.details}</p>
        <p className="mt-0.5 text-[11px] text-gray-400">{when(row.date)}</p>
      </div>
      {row.orderId && <ChevronRight size={16} className="mt-0.5 shrink-0 text-gray-300 sm:mt-0" />}
    </>
  );
  const cls = 'flex items-start gap-3 rounded-2xl p-3 sm:items-center sm:gap-4 sm:p-4';
  return row.orderId ? (
    <Link to={`/dashboard/orders/${row.orderId}`} className={cn(cls, 'hover:bg-gray-50 transition-colors')} aria-label={`${row.type}, ${row.details}`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
