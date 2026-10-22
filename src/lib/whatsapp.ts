// WhatsApp click-to-chat links (https://wa.me). These only open WhatsApp with
// the message typed in; the person taps Send. No WhatsApp API is used.

/**
 * A Nigerian phone number as WhatsApp wants it: 13 digits starting with 234.
 * Accepts 0803..., +234803... and 234803... (spaces and dashes are fine).
 * Anything else gives null, so no button is shown.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  const raw = String(phone ?? '').trim();
  if (!raw) return null;
  const digits = raw.replace(/[\s\-().]/g, '').replace(/^\+/, '');
  if (!/^\d+$/.test(digits)) return null;
  if (/^0\d{10}$/.test(digits)) return `234${digits.slice(1)}`;
  if (/^234\d{10}$/.test(digits)) return digits;
  return null;
}

/** https://wa.me/<digits>?text=..., or null when the number is not usable. */
export function whatsAppLink(phone: string | null | undefined, text: string): string | null {
  const n = toWhatsAppNumber(phone);
  return n ? `https://wa.me/${n}?text=${encodeURIComponent(text)}` : null;
}

/** Buyer to shop: "Hi, I just paid for order ORD-1042: 2x Chicken shawarma." */
export const buyerPaidMessage = (orderNumber: string, itemsText: string) =>
  `Hi, I just paid for order ${orderNumber}: ${itemsText}.`;

/** Seller to buyer, pickup: "Hi Amaka, your order ORD-1042 from <shop> is ready for pickup." */
export const sellerReadyMessage = (buyerFirstName: string, orderNumber: string, shopName: string) =>
  `Hi${buyerFirstName ? ` ${buyerFirstName}` : ''}, your order ${orderNumber} from ${shopName} is ready for pickup.`;

/** Seller to buyer, the shop delivers it. */
export const sellerBringingMessage = (buyerFirstName: string, orderNumber: string, shopName: string) =>
  `Hi${buyerFirstName ? ` ${buyerFirstName}` : ''}, I'm bringing your order ${orderNumber} from ${shopName} to you now.`;
