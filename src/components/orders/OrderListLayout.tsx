// Shared layout for My Orders and Shop Orders: title, tabs with counts, cards.
import { useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ListOrder } from '@/lib/order-lists';
import OrderCard from './OrderCard';

export default function OrderListLayout<T extends string>({
  title,
  subtitle,
  tabs,
  tabOf,
  orders,
  loading,
  error,
  empty,
  onChanged,
  header,
}: {
  title: string;
  subtitle: string;
  /** Shown under the title (Shop Orders: order alert settings). */
  header?: ReactNode;
  tabs: { value: T; label: string }[];
  tabOf: (o: ListOrder) => T;
  orders: ListOrder[] | undefined;
  loading: boolean;
  error: boolean;
  empty: Record<T, string>;
  onChanged: () => void;
}) {
  // The open tab lives in the URL (?tab=), so links and the back button keep it.
  const [params, setParams] = useSearchParams();
  const tab = (tabs.find((t) => t.value === params.get('tab'))?.value ?? tabs[0].value) as T;

  const counts = useMemo(() => {
    const c = Object.fromEntries(tabs.map((t) => [t.value, 0])) as Record<T, number>;
    for (const o of orders ?? []) c[tabOf(o)]++;
    return c;
  }, [orders, tabs, tabOf]);

  const shown = (orders ?? []).filter((o) => tabOf(o) === tab);

  let body: ReactNode;
  if (loading) {
    body = (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );
  } else if (error) {
    body = <p className="py-16 text-center text-sm text-gray-500">Could not load your orders. Please try again.</p>;
  } else if (shown.length === 0) {
    body = (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-gray-200 bg-gray-50/50 px-4 py-16 text-center">
        <Package className="h-10 w-10 text-gray-300" />
        <p className="mt-3 max-w-xs text-sm text-gray-500">{empty[tab]}</p>
      </div>
    );
  } else {
    body = (
      <div className="space-y-4">
        {shown.map((o) => (
          <OrderCard key={o._id} order={o} onChanged={onChanged} />
        ))}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:py-10">
      <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{title}</h1>
      <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
      {header}

      <div role="tablist" className="no-scrollbar -mx-1 mt-5 mb-5 flex gap-1.5 overflow-x-auto px-1 sm:gap-2">
        {tabs.map((t) => (
          <button
            key={t.value}
            role="tab"
            aria-selected={tab === t.value}
            onClick={() => setParams({ tab: t.value }, { replace: true })}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-bold transition sm:gap-2 sm:px-4 sm:py-2 sm:text-sm',
              tab === t.value
                ? 'border-gray-900 bg-gray-900 text-white'
                : 'border-gray-200 bg-white text-gray-500 hover:border-orange-200 hover:text-orange-600',
            )}
          >
            {t.label}
            {counts[t.value] > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 text-[11px]',
                  tab === t.value ? 'bg-white/20' : t.value === 'problems' ? 'bg-red-100 text-red-600' : 'bg-gray-100',
                )}
              >
                {counts[t.value]}
              </span>
            )}
          </button>
        ))}
      </div>

      {body}
    </div>
  );
}
