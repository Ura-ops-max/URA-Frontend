import { describe, expect, it } from 'vitest';
import { shopOpenState, toMinutes } from '../opening-hours';

// Lagos is UTC+1 all year. 2026-10-21 is a Wednesday.
const at = (iso: string) => new Date(iso);
const week = (open = '09:00', close = '18:00') =>
  ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({ day, open, close }));

describe('shopOpenState', () => {
  it('open inside the hours, closed outside, in Lagos time', () => {
    expect(shopOpenState(week(), at('2026-10-21T09:30:00Z')).open).toBe(true); // 10:30 Lagos
    expect(shopOpenState(week(), at('2026-10-21T07:30:00Z'))).toEqual({ open: false, opensLabel: 'Opens today at 9:00' });
    expect(shopOpenState(week(), at('2026-10-21T20:00:00Z'))).toEqual({ open: false, opensLabel: 'Opens tomorrow at 9:00' });
  });

  it('skips closed days when saying when it opens', () => {
    const hours = week().map((h) => (h.day === 'Thursday' ? { ...h, isClosed: true } : h));
    expect(shopOpenState(hours, at('2026-10-21T20:00:00Z')).opensLabel).toBe('Opens Friday at 9:00');
  });

  it('handles hours that run past midnight', () => {
    const late = week('18:00', '02:00');
    expect(shopOpenState(late, at('2026-10-22T00:30:00Z')).open).toBe(true); // 01:30 Thursday, from Wednesday
    expect(shopOpenState(late, at('2026-10-21T22:00:00Z')).open).toBe(true); // 23:00
    expect(shopOpenState(late, at('2026-10-21T12:00:00Z')).open).toBe(false); // 13:00
  });

  it('never blocks or crashes on missing or odd hours', () => {
    expect(shopOpenState(undefined).open).toBe(true);
    expect(shopOpenState([]).open).toBe(true);
    const noWednesday = week().filter((h) => h.day !== 'Wednesday');
    expect(shopOpenState(noWednesday, at('2026-10-21T20:00:00Z')).open).toBe(true);
    expect(shopOpenState([{ day: 'Wednesday', open: 'whenever', close: '?' }], at('2026-10-21T20:00:00Z')).open).toBe(true);
  });

  it('reads 12-hour times', () => {
    expect(toMinutes('9:00 AM')).toBe(540);
    expect(toMinutes('6:30 pm')).toBe(1110);
    expect(toMinutes('12:00 AM')).toBe(0);
  });
});
