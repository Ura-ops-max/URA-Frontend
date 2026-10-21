import { describe, expect, it } from 'vitest';
import { formatMoney, toCurrencyCode, toDate } from '../money';

describe('formatMoney never throws', () => {
  it('handles the "NG" currency Payluk sometimes sends', () => {
    expect(toCurrencyCode('NG')).toBe('NGN');
    expect(() => formatMoney(1000, 'NG')).not.toThrow();
    expect(formatMoney(1000, 'NG')).toContain('1,000');
  });
  it('handles junk input', () => {
    expect(() => formatMoney(undefined, undefined)).not.toThrow();
    expect(() => formatMoney('abc', 'N1')).not.toThrow();
  });
});

describe('toDate', () => {
  it('returns null for missing or bad dates, reads Unix seconds', () => {
    expect(toDate(undefined)).toBeNull();
    expect(toDate('not a date')).toBeNull();
    expect(toDate('1782373118')?.getUTCFullYear()).toBe(2026);
    expect(toDate('2026-10-21T10:00:00Z')).toBeInstanceOf(Date);
  });
});
