import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { EscrowTransaction } from '@/hooks/api/use-escrow-transactions';

/**
 * Actions on a payment (confirm received, dispute, claim) live on its URA
 * order and go through URA's backend, never straight to Payluk.
 */
export function OrderLink({ tx }: { tx: Pick<EscrowTransaction, 'orderId' | 'orderNumber'> }) {
  if (!tx.orderId) {
    return (
      <p className="text-[11px] text-gray-400">
        This payment is not linked to a URA order. Contact support if you need help with it.
      </p>
    );
  }
  return (
    <Link
      to={`/dashboard/orders/${tx.orderId}`}
      className="inline-flex h-8 items-center gap-1.5 rounded-xl bg-gray-900 px-3 text-xs font-bold text-white hover:bg-black"
    >
      Open order {tx.orderNumber ?? ''} <ArrowUpRight size={12} />
    </Link>
  );
}
