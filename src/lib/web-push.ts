// Web push for sellers' "New paid order" alerts, so they hear about an order
// with URA closed. Uses the public VAPID key only (VITE_VAPID_PUBLIC_KEY);
// the private key stays on the server.
import API from '@/lib/axios-client';

export type PushResult = 'on' | 'not-supported' | 'not-configured' | 'denied' | 'failed';

/** The VAPID public key (base64url) as the bytes the browser wants. */
export function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export const pushSupported = (): boolean =>
  typeof window !== 'undefined' &&
  'serviceWorker' in navigator &&
  'PushManager' in window &&
  'Notification' in window;

/** Ask for permission and subscribe this browser. Call from a tap. */
export async function enablePush(): Promise<PushResult> {
  const key = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined;
  if (!key) return 'not-configured';
  if (!pushSupported()) return 'not-supported';
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';
    const reg = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));
    await API.post('/push/subscriptions', sub.toJSON());
    return 'on';
  } catch {
    return 'failed';
  }
}
