// Alerts for new notifications: a pop-up, one short car horn (Web Audio), the
// "Turn on alerts" unlock, the horn setting, and the unread count in the tab title.
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from '@/context/auth-provider';
import { useNotificationContext } from '@/context/notification-provider';
import {
  createHornGate,
  hornAllowed,
  playHorn,
  readPrefs,
  savePrefs,
  titleWithUnread,
  unlockSound,
  type AlertPrefs,
  type HornMode,
} from '@/lib/horn';
import { enablePush } from '@/lib/web-push';
import { addPopup, popupFromNotification, removePopup, type Popup } from '@/lib/popups';
import PopupStack from '@/components/alerts/PopupStack';

interface AlertsContextValue {
  prefs: AlertPrefs;
  /** From a tap: plays a test horn (unlocks sound) and asks for push. */
  turnOn: () => Promise<boolean>;
  setMode: (mode: HornMode) => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

/** A tap or key press this recent means the person is acting on this page. */
const JUST_ACTED_MS = 15_000;

/** Is this order on screen right now (order page, checkout, payment result)? */
function orderOnScreen(orderId: string, pathname: string, search: string): boolean {
  if (!orderId) return false;
  if (pathname === `/dashboard/orders/${orderId}`) return true;
  if (pathname.startsWith('/dashboard/checkout')) return true;
  if (/payment-complete/.test(pathname)) return new URLSearchParams(search).get('orderId') === orderId;
  return false;
}

const relatedIdOf = (n: any): string =>
  String((n?.relatedId && typeof n.relatedId === 'object' ? n.relatedId._id : n?.relatedId) ?? '');

export function AlertsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuthContext();
  const { unreadCount } = useNotificationContext();
  const location = useLocation();

  const [prefs, setPrefs] = useState<AlertPrefs>(() => readPrefs());
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;
  const locationRef = useRef(location);
  locationRef.current = location;
  const gate = useRef(createHornGate());
  const lastActionAt = useRef(0);
  const [popups, setPopups] = useState<Popup[]>([]);
  const closePopup = useCallback((id: string) => setPopups((list) => removePopup(list, id)), []);

  // Remember when the person last tapped or typed.
  useEffect(() => {
    const mark = () => (lastActionAt.current = Date.now());
    window.addEventListener('pointerdown', mark, { passive: true });
    window.addEventListener('keydown', mark);
    return () => {
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
    };
  }, []);

  // One horn per new notification (rules in lib/horn.ts).
  useEffect(() => {
    if (!isAuthenticated) return;
    socketService.connect();
    const onNotification = (n: any) => {
      // The pop-up always shows, even when sound is off or blocked.
      setPopups((list) => addPopup(list, popupFromNotification(n)));
      const p = prefsRef.current;
      if (!p.unlocked || !hornAllowed(n, p.mode)) return;
      // They just caused this, on the page that shows it: no horn.
      const { pathname, search } = locationRef.current;
      if (Date.now() - lastActionAt.current < JUST_ACTED_MS && orderOnScreen(relatedIdOf(n), pathname, search)) return;
      if (gate.current.take(n?._id ? String(n._id) : undefined)) playHorn();
    };
    socketService.on('notification_received', onNotification);
    return () => socketService.off('notification_received', onNotification);
  }, [isAuthenticated]);

  // "(1) URA" in the tab title, kept when pages change their own title.
  useEffect(() => {
    const apply = () => {
      const next = titleWithUnread(document.title, unreadCount);
      if (next !== document.title) document.title = next;
    };
    apply();
    const el = document.querySelector('title');
    if (!el) return;
    const obs = new MutationObserver(apply);
    obs.observe(el, { childList: true, characterData: true, subtree: true });
    return () => obs.disconnect();
  }, [unreadCount]);

  const update = useCallback((next: AlertPrefs) => {
    savePrefs(next);
    setPrefs(next);
  }, []);

  const turnOn = useCallback(async () => {
    // Push permission can only be asked from a tap; best effort.
    void enablePush();
    const played = await unlockSound();
    update({ unlocked: true, mode: prefsRef.current.mode === 'off' ? 'all' : prefsRef.current.mode });
    return played;
  }, [update]);

  const setMode = useCallback((mode: HornMode) => update({ ...prefsRef.current, mode }), [update]);

  return (
    <AlertsContext.Provider value={{ prefs, turnOn, setMode }}>
      {children}
      <PopupStack popups={popups} onClose={closePopup} />
    </AlertsContext.Provider>
  );
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts must be used within AlertsProvider');
  return ctx;
}
