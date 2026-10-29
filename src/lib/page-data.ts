// Built shop and product pages (for Google) carry the same data the app would
// fetch, in <script id="ura-page-data">. Using it as the first data means the
// page shows at once, with no loading skeleton; it is then refreshed quietly.

type PageData = { kind: 'shop'; slug: string; data: unknown } | { kind: 'product'; id: string; data: unknown };

let parsed: PageData | null | undefined;

function pageData(): PageData | null {
  if (parsed !== undefined) return parsed;
  parsed = null;
  try {
    const el = typeof document !== 'undefined' ? document.getElementById('ura-page-data') : null;
    if (el?.textContent) parsed = JSON.parse(el.textContent) as PageData;
  } catch {
    parsed = null;
  }
  return parsed;
}

/** The built page's shop data, if this page was built for that shop. */
export function initialShopData<T = any>(slug: string | undefined): T | undefined {
  const d = pageData();
  return d?.kind === 'shop' && slug && d.slug.toLowerCase() === slug.toLowerCase() ? (d.data as T) : undefined;
}

/** The built page's product data, if this page was built for that product. */
export function initialProductData<T = any>(id: string | undefined): T | undefined {
  const d = pageData();
  return d?.kind === 'product' && id && d.id === id ? (d.data as T) : undefined;
}

/** "68f0c3...-chelsea-boot" gives the product id. */
export const productIdFromRef = (ref: string | undefined) => /^[0-9a-f]{24}/i.exec(ref ?? '')?.[0];

/** For tests. */
export function resetPageDataForTests(): void {
  parsed = undefined;
}
