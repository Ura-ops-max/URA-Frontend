// Helpers for the shop owner's Inventory page: reading CSV / .xlsx files,
// guessing which column is which, the download template, and shrinking photos.
import API from '@/lib/axios-client';
import { uploadMediaToS3 } from '@/services/s3.service';

export const MAX_ROWS = 2000;

export type InventoryField =
  | 'name'
  | 'price'
  | 'stock'
  | 'sku'
  | 'barcode'
  | 'unit'
  | 'category'
  | 'description'
  | 'image';

export const FIELDS: { key: InventoryField; label: string; required?: boolean }[] = [
  { key: 'name', label: 'Name', required: true },
  { key: 'price', label: 'Price', required: true },
  { key: 'stock', label: 'Stock' },
  { key: 'sku', label: 'Item code (SKU)' },
  { key: 'category', label: 'Category' },
  { key: 'unit', label: 'Unit' },
  { key: 'barcode', label: 'Barcode' },
  { key: 'description', label: 'Description' },
  { key: 'image', label: 'Image link' },
];

/** Common ways shops name their columns ("Item Name", "Selling Price", "Qty"…). */
const SYNONYMS: Record<InventoryField, string[]> = {
  name: ['name', 'item', 'item name', 'product', 'product name', 'title', 'item description'],
  price: ['price', 'selling price', 'sale price', 'unit price', 'retail price', 'amount', 'sp'],
  stock: ['stock', 'qty', 'quantity', 'in stock', 'stock qty', 'qty in stock', 'on hand', 'qoh', 'available', 'stock level'],
  sku: ['sku', 'item code', 'code', 'product code', 'item no', 'item number', 'plu', 'article', 'ref'],
  barcode: ['barcode', 'bar code', 'ean', 'upc', 'gtin'],
  unit: ['unit', 'uom', 'unit of measure', 'pack', 'pack size', 'size'],
  category: ['category', 'department', 'dept', 'aisle', 'section', 'group', 'class'],
  description: ['description', 'details', 'notes', 'long description'],
  image: ['image', 'image url', 'image link', 'photo', 'photo url', 'picture', 'picture url'],
};

export const normalizeHeader = (h: string): string =>
  String(h ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

const MAPPING_KEY = 'ura.inventory.columnMapping';

/** The owner's past column choices, remembered in this browser. */
const loadRemembered = (): Record<string, InventoryField | ''> => {
  try {
    return JSON.parse(localStorage.getItem(MAPPING_KEY) || '{}') ?? {};
  } catch {
    return {};
  }
};

export const rememberMapping = (headers: string[], mapping: (InventoryField | '')[]): void => {
  try {
    const saved = loadRemembered();
    headers.forEach((h, i) => {
      const key = normalizeHeader(h);
      if (key) saved[key] = mapping[i] ?? '';
    });
    localStorage.setItem(MAPPING_KEY, JSON.stringify(saved));
  } catch {
    /* storage blocked — guessing still works */
  }
};

/** For each column, which field it is (or '' to ignore). Each field used once. */
export const guessMapping = (headers: string[]): (InventoryField | '')[] => {
  const remembered = loadRemembered();
  const used = new Set<InventoryField>();
  const result: (InventoryField | '')[] = headers.map(() => '');

  // 1. Past choices for these exact column names.
  headers.forEach((h, i) => {
    const r = remembered[normalizeHeader(h)];
    if (r && !used.has(r)) {
      result[i] = r;
      used.add(r);
    } else if (r === '') {
      result[i] = '';
    }
  });
  // 2. Exact synonym matches, then 3. "contains" matches.
  for (const pass of ['exact', 'contains'] as const) {
    headers.forEach((h, i) => {
      if (result[i]) return;
      const n = normalizeHeader(h);
      if (!n) return;
      for (const f of FIELDS.map((x) => x.key)) {
        if (used.has(f)) continue;
        const hit =
          pass === 'exact'
            ? SYNONYMS[f].includes(n)
            : SYNONYMS[f].some((s) => s.length > 3 && n.includes(s));
        if (hit) {
          result[i] = f;
          used.add(f);
          break;
        }
      }
    });
  }
  return result;
};

/** Minimal CSV reader: quotes, "" escapes, CRLF, BOM, and ; files from Excel. */
export const parseCsv = (text: string): string[][] => {
  const src = text.replace(/^\uFEFF/, '');
  const firstLine = src.split(/\r?\n/, 1)[0] ?? '';
  const delimiter =
    (firstLine.match(/;/g)?.length ?? 0) > (firstLine.match(/,/g)?.length ?? 0) ? ';' : ',';

  const rows: string[][] = [];
  let row: string[] = [];
  let cell = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') {
          cell += '"';
          i++;
        } else inQuotes = false;
      } else cell += c;
    } else if (c === '"') inQuotes = true;
    else if (c === delimiter) {
      row.push(cell);
      cell = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
    } else cell += c;
  }
  if (cell !== '' || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
};

export interface SheetFile {
  headers: string[];
  rows: string[][];
}

/** Read a .csv or .xlsx file into a header row + data rows (empty rows dropped). */
export const readSheetFile = async (file: File): Promise<SheetFile> => {
  const name = file.name.toLowerCase();
  let table: string[][];
  if (name.endsWith('.xlsx')) {
    // Loaded only when needed, so the library doesn't slow the rest of the app.
    const { readSheet } = await import('read-excel-file/browser');
    const data = (await readSheet(file)) as unknown[][];
    table = data.map((r) => r.map((v) => (v === null || v === undefined ? '' : String(v))));
  } else if (name.endsWith('.xls')) {
    throw new Error('Old .xls files can’t be read. In Excel: File › Save As › “CSV UTF-8” or .xlsx.');
  } else {
    table = parseCsv(await file.text());
  }
  const nonEmpty = table.filter((r) => r.some((c) => String(c).trim() !== ''));
  if (nonEmpty.length < 2) throw new Error('The file has no rows under the header.');
  const [headers, ...rows] = nonEmpty;
  return { headers: headers.map((h) => String(h).trim()), rows };
};

/** Turn sheet rows into API rows using the chosen column mapping. */
export const buildRows = (
  rows: string[][],
  mapping: (InventoryField | '')[],
): Record<InventoryField, string>[] =>
  rows.map((r) => {
    const out = {} as Record<InventoryField, string>;
    mapping.forEach((field, i) => {
      if (field) out[field] = String(r[i] ?? '').trim();
    });
    return out;
  });

const TEMPLATE_HEADERS = ['SKU', 'Name', 'Price', 'Stock', 'Unit', 'Category', 'Barcode', 'Description', 'Image'];
const TEMPLATE_ROWS = [
  ['PK-400', 'Peak Milk Powder 400g', '3500', '24', 'tin', 'Groceries', '', '', ''],
  ['IND-70', 'Indomie Chicken 70g', '250', '120', 'pack', 'Food & Drinks', '', '', ''],
];

const csvCell = (v: string) => (/[",\n;]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);

/** Download the CSV template (opens in Excel). */
export const downloadTemplate = (): void => {
  const csv = [TEMPLATE_HEADERS, ...TEMPLATE_ROWS].map((r) => r.map(csvCell).join(',')).join('\r\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ura-inventory-template.csv';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

// ── Photos ────────────────────────────────────────────────────────────────

const MAX_SIDE = 1200;
const JPEG_QUALITY = 0.82;

/** Shrink a phone photo in the browser: longest side 1200px, JPEG (~150–300KB). */
export const shrinkPhoto = async (file: File): Promise<File> => {
  const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' }).catch(
    () => createImageBitmap(file),
  );
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not process the photo.');
  ctx.fillStyle = '#ffffff'; // transparent PNGs get a white background, not black
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/jpeg', JPEG_QUALITY));
  if (!blob) throw new Error('Could not process the photo.');
  const base = file.name.replace(/\.[^.]+$/, '') || 'photo';
  return new File([blob], `${base}.jpg`, { type: 'image/jpeg' });
};

/** Shrink, upload to S3, and return the https link. */
export const uploadProductPhoto = async (file: File): Promise<string> =>
  uploadMediaToS3(await shrinkPhoto(file));

/** Run tasks with at most `limit` at a time. */
export async function runLimited<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const item = items[next++];
      await task(item);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
}

/** A photo's file name without extension, for matching ("PK-400.jpg" → "pk-400"). */
export const photoKey = (fileName: string): string =>
  fileName.replace(/\.[^.]+$/, '').trim().toLowerCase();

// ── API ──────────────────────────────────────────────────────────────────

export interface InventoryProduct {
  _id: string;
  name: string;
  sku?: string;
  barcode?: string;
  unit?: string;
  price: number;
  stock: number;
  category?: string;
  media?: string[];
  isHidden?: boolean;
}

export type RowStatus = 'new' | 'update' | 'same' | 'error';
export interface CheckedRow {
  row: number;
  status: RowStatus;
  reason?: string;
  name: string;
  changes?: string[];
}
export interface CheckResult {
  summary: Record<RowStatus, number>;
  rows: CheckedRow[];
}
export interface CommitResult {
  summary: Record<RowStatus, number>;
  saved: { created: number; updated: number };
  problems: string[];
}

export interface StockEdit {
  id: string;
  stock?: number;
  price?: number;
  isHidden?: boolean;
  photoUrl?: string;
}

export const inventoryApi = {
  list: async (): Promise<InventoryProduct[]> =>
    (await API.get('/products/inventory')).data.products ?? [],
  preview: async (rows: unknown[]): Promise<CheckResult> =>
    (await API.post('/products/bulk/preview', { rows })).data,
  commit: async (rows: unknown[]): Promise<CommitResult> =>
    (await API.post('/products/bulk/commit', { rows })).data,
  /** Saves edits in groups of 200 (the server's limit per request). */
  updateStock: async (items: StockEdit[]): Promise<number> => {
    let updated = 0;
    for (let i = 0; i < items.length; i += 200) {
      const { data } = await API.patch('/products/stock', { items: items.slice(i, i + 200) });
      updated += Number(data?.updated) || 0;
    }
    return updated;
  },
};
