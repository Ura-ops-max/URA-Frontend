// Seller alerts for new paid orders: a banner "New paid order ORD-1042 from
// Amaka" and a short car horn, once per order. Buyers never hear the horn.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { BellRing, X } from 'lucide-react';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from '@/context/auth-provider';
import {
  bannerText,
  firstTimeFor,
  playHorn,
  readSettings,
  saveSettings,
  type AlertSettings,
} from '@/lib/order-alerts';
import { enablePush } from '@/lib/web-push';

interface OrderAlertsContextValue {
  settings: AlertSettings;
  /** Tap "Turn on order alerts": plays the horn once, which also unlocks sound. */
  turnOn: () => Promise<boolean>;
  setSound: (on: boolean) => void;
}

const OrderAlertsContext = createContext<OrderAlertsContextValue | null>(null);

const BANNER_MS = 20_000;

export function OrderAlertsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuthContext();
  const isSeller = Boolean(user?.isBusinessOwner);
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState<AlertSettings>(() => readSettings(isSeller));
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  useEffect(() => setSettings(readSettings(isSeller)), [isSeller]);

  const [banner, setBanner] = useState<{ orderId: string; orderNumber: string; text: string } | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !isSeller) return;
    socketService.connect();
    const onPaid = (d: { orderId?: string; orderNumber?: string; buyerFirstName?: string }) => {
      const orderId = String(d?.orderId ?? '');
      if (!firstTimeFor(orderId)) return; // once per order, even if the event repeats
      const orderNumber = String(d.orderNumber ?? '');
      setBanner({ orderId, orderNumber, text: bannerText(orderNumber, d.buyerFirstName) });
      queryClient.invalidateQueries({ queryKey: ['orders', 'shop'] });
      const s = settingsRef.current;
      if (s.enabled && s.sound) void playHorn();
    };
    socketService.on('order_paid', onPaid);
    return () => socketService.off('order_paid', onPaid);
  }, [isAuthenticated, isSeller, queryClient]);

  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), BANNER_MS);
    return () => clearTimeout(t);
  }, [banner]);

  const update = useCallback((next: AlertSettings) => {
    saveSettings(next);
    setSettings(next);
  }, []);

  const turnOn = useCallback(async () => {
    // Ask for push in the same tap (browsers only allow it from a tap).
    // Best effort: the horn and banner work without it.
    const push = isSeller ? enablePush() : Promise.resolve('not-supported');
    const played = await playHorn();
    update({ enabled: true, sound: true });
    await push;
    return played;
  }, [update, isSeller]);

  const setSound = useCallback((on: boolean) => update({ ...settingsRef.current, sound: on }), [update]);

  return (
    <OrderAlertsContext.Provider value={{ settings, turnOn, setSound }}>
      {children}
      {banner && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-0 top-3 z-[60] mx-auto flex w-[calc(100%-2rem)] max-w-md items-center gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-2xl"
        >
          <BellRing size={20} className="shrink-0 text-orange-400" />
          {/* The order number never breaks across lines on a phone. */}
          <p className="min-w-0 flex-1 text-sm font-bold">
            {banner.orderNumber
              ? banner.text.split(banner.orderNumber).flatMap((part, i) =>
                  i === 0 ? [part] : [<span key={i} className="whitespace-nowrap">{banner.orderNumber}</span>, part],
                )
              : banner.text}
          </p>
          <Link
            to={`/dashboard/orders/${banner.orderId}`}
            onClick={() => setBanner(null)}
            className="shrink-0 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold hover:bg-orange-700"
          >
            View
          </Link>
          <button aria-label="Close" onClick={() => setBanner(null)} className="shrink-0 text-gray-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      )}
    </OrderAlertsContext.Provider>
  );
}

export function useOrderAlerts(): OrderAlertsContextValue {
  const ctx = useContext(OrderAlertsContext);
  if (!ctx) throw new Error('useOrderAlerts must be used within OrderAlertsProvider');
  return ctx;
}
