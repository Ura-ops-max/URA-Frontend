import { describe, expect, it } from 'vitest';
import {
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
