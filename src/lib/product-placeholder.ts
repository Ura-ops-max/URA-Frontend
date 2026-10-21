// The picture shown when a product has no photo (or the photo fails to load):
// a tile with short text from the product's name on a soft colour that is
// always the same for the same name.

/**
 * Text for the tile, in capitals:
 *  - one word of 10 letters or fewer → the whole word ("Bread" → "BREAD")
 *  - two or more words → first letters of the first two ("Peak Milk 400g" → "PM")
 *  - one long word → its first 3 letters ("Paracetamol" → "PAR")
 */
export function placeholderText(name: string | null | undefined): string {
  const words = String(name ?? '')
    .split(/\s+/)
    .map((w) => w.replace(/[^\p{L}\p{N}]/gu, ''))
    .filter(Boolean);
  if (words.length === 0) return 'PRODUCT';
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  const [word] = words;
  return (word.length <= 10 ? word : word.slice(0, 3)).toUpperCase();
}

// URA orange family plus a few calm tones; dark text on each.
export const PLACEHOLDER_COLOURS: ReadonlyArray<{ bg: string; fg: string }> = [
  { bg: '#FFEDD5', fg: '#9A3412' },
  { bg: '#FED7AA', fg: '#7C2D12' },
  { bg: '#FFE4CC', fg: '#8A3A0B' },
  { bg: '#FEF3C7', fg: '#78350F' },
  { bg: '#E0F2FE', fg: '#0C4A6E' },
  { bg: '#DCFCE7', fg: '#14532D' },
  { bg: '#EDE9FE', fg: '#4C1D95' },
  { bg: '#F1F5F9', fg: '#1E293B' },
];

/** Same name → same colour (a small, stable string hash). */
export function placeholderColour(name: string | null | undefined) {
  const key = String(name ?? '').trim().toLowerCase();
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return PLACEHOLDER_COLOURS[h % PLACEHOLDER_COLOURS.length];
}

const escapeXml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c]!);

/**
 * The same tile as an SVG data URL, for places that need an image URL
 * (an <img src>, share previews). `rounded` adds rounded corners for use on
 * its own; inside the app the container already rounds the corners.
 */
export function productPlaceholderDataUrl(
  name: string | null | undefined,
  { rounded = false }: { rounded?: boolean } = {},
): string {
  const text = placeholderText(name);
  const { bg, fg } = placeholderColour(name);
  // Fit the text: short initials big, longer words smaller.
  const size = Math.round(Math.min(150, 560 / Math.max(2, text.length * 0.62)));
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">` +
    `<rect width="400" height="400"${rounded ? ' rx="48"' : ''} fill="${bg}"/>` +
    `<text x="200" y="200" text-anchor="middle" dominant-baseline="central" ` +
    `font-family="system-ui, -apple-system, Segoe UI, Roboto, sans-serif" font-size="${size}" ` +
    `font-weight="800" letter-spacing="2" fill="${fg}">${escapeXml(text)}</text></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/**
 * The description to show, or '' to hide the description block. Bulk-uploaded
 * items often have none, or one that just repeats the name: never show the
 * name as the description.
 */
export function visibleDescription(
  description: string | null | undefined,
  name: string | null | undefined,
): string {
  const d = String(description ?? '').trim();
  const n = String(name ?? '').trim().toLowerCase();
  return d && d.toLowerCase() !== n ? d : '';
}
