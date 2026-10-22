import { describe, expect, it } from 'vitest';
import { notificationLink } from './notification-link';

describe('notificationLink', () => {
  it('opens the order for order notices (id or populated order)', () => {
    expect(notificationLink({ modelType: 'Order', relatedId: 'o1' })).toBe('/dashboard/orders/o1');
    expect(notificationLink({ modelType: 'Order', relatedId: { _id: 'o2' } })).toBe('/dashboard/orders/o2');
  });
  it('keeps opening the chat for other notices', () => {
    expect(notificationLink({ relatedId: 'c1' })).toBe('/dashboard/chat/c1');
  });
  it('goes nowhere without an id', () => {
    expect(notificationLink({ modelType: 'Order' })).toBeNull();
    expect(notificationLink({ relatedId: null })).toBeNull();
  });
});
