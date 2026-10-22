// Seller alert for a new paid order: a short car horn, played ONCE per order.
//
// Sound: /sounds/order-horn.wav, made for URA from scratch (synthesised, about
// 1 second). Licence CC0 1.0, see public/sounds/LICENSE.txt.
//
// Browsers block sound until the person taps something on the page, so the
// seller taps "Turn on order alerts" once. Settings live in localStorage
// (wrapped in try/catch: private windows can throw). The sound never loops.

export const HORN_URL = '/sounds/order-horn.wav';
const KEY = 'ura.orderAlerts.v1';

export interface AlertSettings {
  /** The seller tapped "Turn on order alerts" (sound allowed). */
  enabled: boolean;
  /** The mute switch: true = the horn plays. */
  sound: boolean;
}

/** Sound on by default for sellers, off for buyers. */
export const defaultSettings = (isSeller: boolean): AlertSettings => ({ enabled: false, sound: isSeller });

export function readSettings(isSeller: boolean): AlertSettings {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return defaultSettings(isSeller);
    const v = JSON.parse(raw);
    return {
      enabled: v?.enabled === true,
      sound: typeof v?.sound === 'boolean' ? v.sound : isSeller,
    };
  } catch {
    return defaultSettings(isSeller);
  }
}

export function saveSettings(s: AlertSettings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage blocked: settings last until the page is closed.
  }
}

/** Orders already alerted in this tab, so a repeat event never honks twice. */
const played = new Set<string>();

/** True the first time an order id is seen, false after that. */
export function firstTimeFor(orderId: string): boolean {
  if (!orderId || played.has(orderId)) return false;
  played.add(orderId);
  return true;
}

/** For tests. */
export function resetPlayed(): void {
  played.clear();
}

/** Play the horn once. Never loops; errors (blocked sound) are ignored. */
export async function playHorn(): Promise<boolean> {
  try {
    const audio = new Audio(HORN_URL);
    audio.loop = false;
    await audio.play();
    return true;
  } catch {
    return false;
  }
}

/** "New paid order ORD-1042 from Amaka" */
export const bannerText = (orderNumber: string, buyerFirstName?: string) =>
  `New paid order ${orderNumber}${buyerFirstName ? ` from ${buyerFirstName}` : ''}`;
