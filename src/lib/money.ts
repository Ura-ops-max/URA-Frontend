// Formatting helpers that never throw. A bad currency code (Payluk sometimes
// sends "NG") or a missing date used to crash the whole wallet page.

export const toCurrencyCode = (c: unknown): string => {
  const v = String(c ?? '').trim().toUpperCase();
  if (v === 'NG' || v === 'NAIRA' || v === '₦') return 'NGN';
  return /^[A-Z]{3}$/.test(v) ? v : 'NGN';
};

export function formatMoney(amount: unknown, currency: unknown = 'NGN'): string {
  const n = Number(amount) || 0;
  try {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: toCurrencyCode(currency) }).format(n);
  } catch {
    return `₦${n.toLocaleString('en-NG')}`;
  }
}

/** A Date, or null when the value isn't a usable date. */
export function toDate(value: unknown): Date | null {
  if (value === null || value === undefined || value === '') return null;
  // Payluk sends some times as Unix seconds in a string ("1782373118").
  const d = typeof value === 'string' && /^\d{9,11}$/.test(value) ? new Date(Number(value) * 1000) : new Date(value as any);
  return Number.isNaN(d.getTime()) ? null : d;
}
