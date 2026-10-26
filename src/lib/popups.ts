// Notification pop-ups: newest on top, at most 3 visible, one per notification.
import { notificationLink, type LinkableNotification } from '@/lib/notification-link';

export const MAX_POPUPS = 3;
export const POPUP_MS = 8_000;

export interface Popup {
  id: string;
  /** The words shown (at most 2 lines on a phone). */
  text: string;
  /** Where tapping goes (the order for order notices). */
  link: string | null;
  isOrder: boolean;
}

export interface PopupNotification extends LinkableNotification {
  _id?: string;
  title?: string;
  message?: string;
  /** Server-built line, e.g. "Amaka O. just paid for 2x Chicken shawarma. ₦12,000". */
  summary?: string;
}

export function popupFromNotification(n: PopupNotification): Popup {
  return {
    id: String(n._id ?? `${Date.now()}-${Math.random()}`),
    text: (n.summary || n.message || n.title || 'You have a new notification').trim(),
    link: notificationLink(n),
    isOrder: n.modelType === 'Order',
  };
}

/** Add a pop-up on top; keep at most 3; never show the same one twice. */
export function addPopup(list: Popup[], p: Popup, max = MAX_POPUPS): Popup[] {
  if (list.some((x) => x.id === p.id)) return list;
  return [p, ...list].slice(0, max);
}

export const removePopup = (list: Popup[], id: string): Popup[] => list.filter((x) => x.id !== id);
