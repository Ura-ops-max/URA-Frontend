import { describe, expect, it } from 'vitest';
import { buyerTab, itemsSummary, sellerTab } from './order-lists';

const o = (status: string, extra: { disputeStatus?: string; rejectedAt?: string } = {}) => ({
  status,
  disputeStatus: extra.disputeStatus ?? null,
  rejectedAt: extra.rejectedAt ?? null,
});

describe('buyerTab', () => {
  it('puts unpaid, paid and on-the-way orders in Active', () => {
    expect(buyerTab(o('pending'))).toBe('active');
    expect(buyerTab(o('processing'))).toBe('active');
    expect(buyerTab(o('shipped'))).toBe('active');
  });
  it('puts delivered orders in Delivered', () => {
    expect(buyerTab(o('delivered'))).toBe('delivered');
  });
  it('puts reported, rejected and refunded orders in Problems', () => {
    expect(buyerTab(o('shipped', { disputeStatus: 'open' }))).toBe('problems');
    expect(buyerTab(o('processing', { rejectedAt: '2026-10-22' }))).toBe('problems');
    expect(buyerTab(o('refunded'))).toBe('problems');
    expect(buyerTab(o('delivered', { disputeStatus: 'resolved' }))).toBe('problems');
  });
});

describe('sellerTab', () => {
  it('sorts orders into New, Ready and Done', () => {
    expect(sellerTab(o('processing'))).toBe('new');
    expect(sellerTab(o('shipped'))).toBe('ready');
    expect(sellerTab(o('delivered'))).toBe('done');
  });
  it('puts reported, rejected and refunded orders in Problems', () => {
    expect(sellerTab(o('processing', { disputeStatus: 'investigating' }))).toBe('problems');
    expect(sellerTab(o('processing', { rejectedAt: '2026-10-22' }))).toBe('problems');
    expect(sellerTab(o('refunded'))).toBe('problems');
  });
});

describe('itemsSummary', () => {
  it('lists quantity and name', () => {
    expect(
      itemsSummary([
        { name: 'Chicken shawarma', price: 3000, quantity: 2 },
        { name: 'Coke', price: 500, quantity: 1 },
      ]),
    ).toBe('2x Chicken shawarma, 1x Coke');
  });
});
