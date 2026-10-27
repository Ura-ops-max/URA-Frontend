import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import SendOrderToShop from './SendOrderToShop';

const props = {
  shopName: 'Mama Put',
  orderNumber: 'UR-1042',
  items: [{ name: 'Chicken shawarma', quantity: 2 }],
  total: 12000,
  paid: true,
  deliveryMethod: 'pickup',
};

describe('SendOrderToShop', () => {
  it('shows nothing when the shop has no valid phone number', () => {
    expect(renderToStaticMarkup(<SendOrderToShop {...props} shopPhone={null} />)).toBe('');
    expect(renderToStaticMarkup(<SendOrderToShop {...props} shopPhone="12345" />)).toBe('');
  });

  it('shows the green button, the check box (on) and the note, opening a new tab safely', () => {
    const html = renderToStaticMarkup(<SendOrderToShop {...props} shopPhone="08012345678" />);
    expect(html).toContain('Send order details to Mama Put on WhatsApp');
    expect(html).toContain('href="https://wa.me/2348012345678?text=Hi%20Mama%20Put%2C%20I%20just%20paid');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('bg-[#25D366]');
    expect(html).toMatch(/type="checkbox"[^>]*checked=""/);
    expect(html).toContain('Include what I ordered');
    expect(html).toContain('Opens WhatsApp. You tap Send.');
  });
});
