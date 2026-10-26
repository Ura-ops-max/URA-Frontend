import { describe, expect, it } from 'vitest';
import {
  buyerOrderMessage,
  buyerPaidMessage,
  sellerBringingMessage,
  sellerReadyMessage,
  toWhatsAppNumber,
  whatsAppLink,
} from './whatsapp';

describe('toWhatsAppNumber', () => {
  it('turns 0, +234 and 234 numbers into 13 digits', () => {
    expect(toWhatsAppNumber('08031234567')).toBe('2348031234567');
    expect(toWhatsAppNumber('+2348031234567')).toBe('2348031234567');
    expect(toWhatsAppNumber('2348031234567')).toBe('2348031234567');
    expect(toWhatsAppNumber(' 0803 123 4567 ')).toBe('2348031234567');
    expect(toWhatsAppNumber('+234-803-123-4567')).toBe('2348031234567');
  });

  it('gives null for anything else', () => {
    for (const bad of [null, undefined, '', '8031234567', '0803123456', '080312345678', '+14155550123', '23480312345', 'abc', '0803abc4567', '++2348031234567']) {
      expect(toWhatsAppNumber(bad)).toBeNull();
    }
  });
});

describe('whatsAppLink', () => {
  it('builds a wa.me link with the message encoded', () => {
    expect(whatsAppLink('08031234567', 'Hi, I just paid for order UR-1042: 2x Chicken shawarma.')).toBe(
      'https://wa.me/2348031234567?text=Hi%2C%20I%20just%20paid%20for%20order%20UR-1042%3A%202x%20Chicken%20shawarma.',
    );
  });
  it('gives null when the number is not usable', () => {
    expect(whatsAppLink('12345', 'Hi')).toBeNull();
  });
});

describe('messages', () => {
  it('match the agreed wording', () => {
    expect(buyerPaidMessage('UR-1042', '2x Chicken shawarma')).toBe('Hi, I just paid for order UR-1042: 2x Chicken shawarma.');
    expect(sellerReadyMessage('Amaka', 'UR-1042', 'Mama Put')).toBe('Hi Amaka, your order UR-1042 from Mama Put is ready for pickup.');
    expect(sellerBringingMessage('Amaka', 'UR-1042', 'Mama Put')).toBe("Hi Amaka, I'm bringing your order UR-1042 from Mama Put to you now.");
    expect(sellerReadyMessage('', 'UR-1042', 'Mama Put')).toBe('Hi, your order UR-1042 from Mama Put is ready for pickup.');
  });
});

describe('buyerOrderMessage', () => {
  const base = {
    shopName: 'Mama Put',
    orderNumber: 'UR-1042',
    items: [
      { name: 'Chicken shawarma', quantity: 2 },
      { name: 'Fanta', quantity: 1 },
    ],
    totalText: '₦12,000',
    includeItems: true,
  };
  it('paid, pickup', () => {
    expect(buyerOrderMessage({ ...base, paid: true, deliveryMethod: 'pickup' })).toBe(
      'Hi Mama Put, I just paid for order UR-1042: 2x Chicken shawarma, 1x Fanta. Total ₦12,000. I will pick it up.',
    );
  });
  it('paid, delivery with the address', () => {
    expect(buyerOrderMessage({ ...base, paid: true, deliveryMethod: 'delivery', address: '12 Admiralty Way, Lekki' })).toBe(
      'Hi Mama Put, I just paid for order UR-1042: 2x Chicken shawarma, 1x Fanta. Total ₦12,000. My address is 12 Admiralty Way, Lekki.',
    );
  });
  it('failed or cancelled', () => {
    expect(buyerOrderMessage({ ...base, paid: false })).toBe(
      'Hi Mama Put, I tried to pay for order UR-1042: 2x Chicken shawarma, 1x Fanta. Total ₦12,000. My payment did not go through. Can you help?',
    );
  });
  it('"Include what I ordered" off: only the order number and the total', () => {
    expect(buyerOrderMessage({ ...base, includeItems: false, paid: true, deliveryMethod: 'delivery', address: '12 Admiralty Way' })).toBe(
      'Hi Mama Put, I just paid for order UR-1042. Total ₦12,000.',
    );
    expect(buyerOrderMessage({ ...base, includeItems: false, paid: false })).toBe(
      'Hi Mama Put, I tried to pay for order UR-1042. Total ₦12,000. My payment did not go through. Can you help?',
    );
  });
});
