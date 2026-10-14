import { useMemo, useRef, useState } from 'react';
import { Camera, ImagePlus, Loader2, Minus, Plus, RefreshCcw, Save, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import ProductImage from '@/components/product/ProductImage';
import { cn } from '@/lib/utils';
import {
  inventoryApi,
  photoKey,
  runLimited,
  uploadProductPhoto,
  type InventoryProduct,
  type StockEdit,
} from '@/lib/inventory';

type Filter = 'all' | 'low' | 'out' | 'off';
const LOW_STOCK = 5;
const PAGE = 100;
const PHOTO_UPLOADS_AT_ONCE = 3;

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'low', label: `Low (${LOW_STOCK} or fewer)` },
  { key: 'out', label: 'Sold out' },
  { key: 'off', label: 'Off' },
];

type Draft = Pick<StockEdit, 'stock' | 'price' | 'isHidden'>;

interface Props {
  products: InventoryProduct[];
  loading: boolean;
  onReload: () => void;
  /** Replace one product locally after a save (e.g. its new photo). */
  onPatched: (id: string, patch: Partial<InventoryProduct>) => void;
}

export default function StockTab({ products, loading, onReload, onPatched }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [shown, setShown] = useState(PAGE);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [saving, setSaving] = useState(false);
  const [photoBusy, setPhotoBusy] = useState<Record<string, boolean>>({});
  const [bulkPhotoStatus, setBulkPhotoStatus] = useState<string | null>(null);
  const [unmatchedPhotos, setUnmatchedPhotos] = useState<string[]>([]);
  const singlePhotoInput = useRef<HTMLInputElement>(null);
  const photoTarget = useRef<string | null>(null);

  // Current value = draft (unsaved) if any, else the saved value.
  const value = (p: InventoryProduct) => ({
    stock: drafts[p._id]?.stock ?? p.stock,
    price: drafts[p._id]?.price ?? p.price,
    isHidden: drafts[p._id]?.isHidden ?? Boolean(p.isHidden),
  });

  const setDraft = (p: InventoryProduct, patch: Draft) =>
    setDrafts((d) => {
      const next = { ...(d[p._id] ?? {}), ...patch };
      // Drop fields that are back to the saved value.
      if (next.stock === p.stock) delete next.stock;
      if (next.price === p.price) delete next.price;
      if (next.isHidden === Boolean(p.isHidden)) delete next.isHidden;
      const copy = { ...d };
      if (Object.keys(next).length) copy[p._id] = next;
      else delete copy[p._id];
      return copy;
    });

  const changedCount = Object.keys(drafts).length;

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      const v = {
        stock: drafts[p._id]?.stock ?? p.stock,
        isHidden: drafts[p._id]?.isHidden ?? Boolean(p.isHidden),
      };
      if (filter === 'low' && !(v.stock > 0 && v.stock <= LOW_STOCK)) return false;
      if (filter === 'out' && v.stock > 0) return false;
      if (filter === 'off' && !v.isHidden) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
    });
  }, [products, drafts, query, filter]);

  const saveAll = async () => {
    const items: StockEdit[] = Object.entries(drafts).map(([id, d]) => ({ id, ...d }));
    if (!items.length) return;
    setSaving(true);
    try {
      await inventoryApi.updateStock(items);
      for (const it of items) {
        const { id, ...patch } = it;
        onPatched(id, patch);
      }
      setDrafts({});
      toast.success(`Saved ${items.length} change${items.length === 1 ? '' : 's'}.`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ── One photo: tap the picture on a product ─────────────────────────────
  const pickPhotoFor = (id: string) => {
    photoTarget.current = id;
    singlePhotoInput.current?.click();
  };
  const onSinglePhoto = async (file: File | undefined) => {
    const id = photoTarget.current;
    if (singlePhotoInput.current) singlePhotoInput.current.value = '';
    if (!file || !id) return;
    setPhotoBusy((b) => ({ ...b, [id]: true }));
    try {
      const url = await uploadProductPhoto(file);
      await inventoryApi.updateStock([{ id, photoUrl: url }]);
      const product = products.find((p) => p._id === id);
      onPatched(id, { media: [url, ...(product?.media ?? []).filter((m) => m !== url)] });
      toast.success('Photo added.');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Photo upload failed.');
    } finally {
      setPhotoBusy((b) => ({ ...b, [id]: false }));
    }
  };

  // ── Many photos: matched by file name (SKU or exact product name) ───────
  const onManyPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    const bySku = new Map<string, InventoryProduct>();
    const byName = new Map<string, InventoryProduct[]>();
    for (const p of products) {
      if (p.sku) bySku.set(p.sku.trim().toLowerCase(), p);
      const n = p.name.trim().toLowerCase();
      byName.set(n, [...(byName.get(n) ?? []), p]);
    }
    const matched: { file: File; product: InventoryProduct }[] = [];
    const unmatched: string[] = [];
    for (const file of Array.from(files)) {
      const key = photoKey(file.name);
      const sameName = byName.get(key) ?? [];
      const product = bySku.get(key) ?? (sameName.length === 1 ? sameName[0] : undefined);
      if (product) matched.push({ file, product });
      else unmatched.push(file.name);
    }
    setUnmatchedPhotos(unmatched);
    if (!matched.length) {
      toast.error('No photo names matched an item code or product name.');
      return;
    }

    let done = 0;
    let failed = 0;
    setBulkPhotoStatus(`Uploading 0 of ${matched.length}…`);
    await runLimited(matched, PHOTO_UPLOADS_AT_ONCE, async ({ file, product }) => {
      try {
        const url = await uploadProductPhoto(file);
        await inventoryApi.updateStock([{ id: product._id, photoUrl: url }]);
        onPatched(product._id, { media: [url, ...(product.media ?? [])] });
      } catch {
        failed++;
      }
      done++;
      setBulkPhotoStatus(`Uploading ${done} of ${matched.length}…`);
    });
    setBulkPhotoStatus(null);
    if (failed) toast.error(`${matched.length - failed} photos added, ${failed} failed.`);
    else toast.success(`${matched.length} photo${matched.length === 1 ? '' : 's'} added.`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', changedCount > 0 && 'pb-24')}>
      {/* Tools */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            inputMode="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShown(PAGE);
            }}
            placeholder="Search by name or item code"
            className="h-11 w-full rounded-xl bg-white pl-10 pr-10 text-sm ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-orange-300"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <label
          className={cn(
            'inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50',
            bulkPhotoStatus && 'pointer-events-none opacity-60',
          )}
        >
          {bulkPhotoStatus ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
          {bulkPhotoStatus ?? 'Add many photos'}
          <input
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              void onManyPhotos(e.target.files);
              e.target.value = '';
            }}
          />
        </label>
        <Button variant="ghost" onClick={onReload} className="h-11 gap-2 text-gray-500">
          <RefreshCcw size={14} /> Refresh
        </Button>
      </div>

      <p className="text-xs text-gray-400">
        Many photos: name each file by its item code (e.g. <b>PK-400.jpg</b>) or the exact product
        name. Photos are shrunk before upload.
      </p>

      {unmatchedPhotos.length > 0 && (
        <div className="rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-bold">
            {unmatchedPhotos.length} photo(s) didn’t match a product — rename them to the item code
            and try again:
          </p>
          <p className="mt-1 break-words">{unmatchedPhotos.join(', ')}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => {
              setFilter(f.key);
              setShown(PAGE);
            }}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-sm font-medium transition',
              filter === f.key ? 'bg-orange-500 text-white' : 'bg-white text-gray-600 ring-1 ring-gray-200',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 ring-1 ring-black/5">
          No products yet. Upload a file in the Upload tab.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-2xl bg-white p-8 text-center text-sm text-gray-400 ring-1 ring-black/5">
          Nothing matches.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100 overflow-hidden rounded-2xl bg-white ring-1 ring-black/5">
          {visible.slice(0, shown).map((p) => {
            const v = value(p);
            const changed = Boolean(drafts[p._id]);
            return (
              <li
                key={p._id}
                className={cn(
                  'flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap',
                  v.isHidden && 'bg-gray-50',
                  changed && 'bg-orange-50/50',
                )}
              >
                {/* Photo — tap to take or choose one */}
                <button
                  onClick={() => pickPhotoFor(p._id)}
                  disabled={photoBusy[p._id]}
                  aria-label={`Add a photo for ${p.name}`}
                  className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-gray-100"
                >
                  <ProductImage src={p.media?.[0]} alt="" className="h-full w-full object-cover" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition hover:bg-black/30 hover:opacity-100">
                    {photoBusy[p._id] ? (
                      <Loader2 size={16} className="animate-spin opacity-100" />
                    ) : (
                      <Camera size={16} />
                    )}
                  </span>
                  {photoBusy[p._id] && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 size={16} className="animate-spin text-white" />
                    </span>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-semibold', v.isHidden ? 'text-gray-400' : 'text-gray-900')}>
                    {p.name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {[p.sku, p.unit, p.category].filter(Boolean).join(' · ') || '—'}
                  </p>
                </div>

                {/* Price */}
                <label className="flex items-center gap-1 text-sm">
                  <span className="text-gray-400">₦</span>
                  <input
                    type="number"
                    min={0}
                    inputMode="decimal"
                    value={v.price}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (e.target.value !== '' && Number.isFinite(n) && n >= 0) setDraft(p, { price: n });
                    }}
                    aria-label={`Price of ${p.name}`}
                    className="h-9 w-24 rounded-lg border border-gray-200 px-2 text-right tabular-nums"
                  />
                </label>

                {/* Stock − / + */}
                <div className="flex items-center rounded-lg border border-gray-200">
                  <button
                    onClick={() => setDraft(p, { stock: Math.max(0, v.stock - 1) })}
                    aria-label="One less"
                    className="flex h-9 w-8 items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Minus size={14} />
                  </button>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    inputMode="numeric"
                    value={v.stock}
                    onChange={(e) => {
                      const n = Number(e.target.value);
                      if (e.target.value !== '' && Number.isInteger(n) && n >= 0) setDraft(p, { stock: n });
                    }}
                    aria-label={`Stock of ${p.name}`}
                    className={cn(
                      'h-9 w-14 border-x border-gray-200 text-center tabular-nums',
                      v.stock === 0 && 'text-red-600 font-semibold',
                    )}
                  />
                  <button
                    onClick={() => setDraft(p, { stock: v.stock + 1 })}
                    aria-label="One more"
                    className="flex h-9 w-8 items-center justify-center text-gray-500 hover:bg-gray-50"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* On / Off */}
                <button
                  role="switch"
                  aria-checked={!v.isHidden}
                  aria-label={`${p.name} is ${v.isHidden ? 'off' : 'on'}`}
                  onClick={() => setDraft(p, { isHidden: !v.isHidden })}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-500"
                >
                  <span
                    className={cn(
                      'relative h-6 w-11 rounded-full transition',
                      v.isHidden ? 'bg-gray-300' : 'bg-green-500',
                    )}
                  >
                    <span
                      className={cn(
                        'absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all',
                        v.isHidden ? 'left-0.5' : 'left-5.5',
                      )}
                    />
                  </span>
                  <span className="w-6">{v.isHidden ? 'Off' : 'On'}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {visible.length > shown && (
        <div className="text-center">
          <Button variant="outline" onClick={() => setShown((n) => n + PAGE)} className="rounded-xl">
            Show more ({(visible.length - shown).toLocaleString()} left)
          </Button>
        </div>
      )}

      <p className="text-xs text-gray-400">
        “Off” items are hidden from shoppers and can’t be bought, but stay in this list.
      </p>

      {/* One button saves every change */}
      {changedCount > 0 && (
        <div className="fixed inset-x-0 bottom-16 z-30 px-4 pb-4 md:bottom-0">
          <div className="mx-auto flex max-w-xl items-center justify-between gap-3 rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-xl">
            <span className="text-sm font-semibold">
              {changedCount} unsaved change{changedCount === 1 ? '' : 's'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={() => setDrafts({})}
                disabled={saving}
                className="text-white hover:bg-white/10 hover:text-white"
              >
                Undo
              </Button>
              <Button
                onClick={() => void saveAll()}
                disabled={saving}
                className="gap-2 bg-orange-500 hover:bg-orange-600"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save
              </Button>
            </div>
          </div>
        </div>
      )}

      <input
        ref={singlePhotoInput}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => void onSinglePhoto(e.target.files?.[0])}
      />
    </div>
  );
}
