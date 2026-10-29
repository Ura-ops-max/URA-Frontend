import { afterEach, describe, expect, it, vi } from 'vitest';
import { initialProductData, initialShopData, productIdFromRef, resetPageDataForTests } from './page-data';

const withPage = (json: string | null) => {
  resetPageDataForTests();
  vi.stubGlobal('document', { getElementById: () => (json === null ? null : { textContent: json }) });
};
afterEach(() => vi.unstubAllGlobals());

describe('page data from a built page', () => {
  it('gives the shop data only for that shop', () => {
    withPage(JSON.stringify({ kind: 'shop', slug: 'tunde-boots', data: { business: { businessName: 'Tunde Boots' } } }));
    expect(initialShopData('tunde-boots')).toEqual({ business: { businessName: 'Tunde Boots' } });
    expect(initialShopData('Tunde-Boots')).toBeDefined();
    expect(initialShopData('other-shop')).toBeUndefined();
    expect(initialProductData('68f0c3a1b2c3d4e5f6a7b8c9')).toBeUndefined();
  });
  it('gives the product data only for that product', () => {
    withPage(JSON.stringify({ kind: 'product', id: '68f0c3a1b2c3d4e5f6a7b8c9', data: { product: { name: 'Boot' } } }));
    expect(initialProductData('68f0c3a1b2c3d4e5f6a7b8c9')).toEqual({ product: { name: 'Boot' } });
    expect(initialShopData('tunde-boots')).toBeUndefined();
  });
  it('nothing on a normal app page, and never throws on bad data', () => {
    withPage(null);
    expect(initialShopData('x')).toBeUndefined();
    withPage('{not json');
    expect(initialProductData('x')).toBeUndefined();
  });
  it('reads the product id from the URL part', () => {
    expect(productIdFromRef('68f0c3a1b2c3d4e5f6a7b8c9-chelsea-boot')).toBe('68f0c3a1b2c3d4e5f6a7b8c9');
    expect(productIdFromRef('chelsea-boot')).toBeUndefined();
  });
});
