// Shop owner's Inventory: bulk upload (CSV / .xlsx) and a stock table with
// quick price / stock / On-Off / photo edits.
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Boxes, Store } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/auth-provider';
import { cn } from '@/lib/utils';
import { inventoryApi, type InventoryProduct } from '@/lib/inventory';
import UploadTab from '@/components/inventory/UploadTab';
import StockTab from '@/components/inventory/StockTab';

type Tab = 'stock' | 'upload';

export default function InventoryPage() {
  const { user } = useAuthContext();
  const isSeller = Boolean(user?.isBusinessOwner);
  const [tab, setTab] = useState<Tab>('stock');
  const [products, setProducts] = useState<InventoryProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setProducts(await inventoryApi.list());
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not load your products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isSeller) void load();
    else setLoading(false);
  }, [isSeller, load]);

  // New shops start on Upload; shops with products start on Stock.
  useEffect(() => {
    if (!loading && products.length === 0) setTab('upload');
  }, [loading, products.length]);

  const patch = (id: string, change: Partial<InventoryProduct>) =>
    setProducts((list) => list.map((p) => (p._id === id ? { ...p, ...change } : p)));

  if (!isSeller) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <Store className="mx-auto h-10 w-10 text-orange-400" />
        <h1 className="mt-3 text-lg font-bold text-gray-900">Inventory is for shops</h1>
        <p className="mt-1 text-sm text-gray-500">
          Turn your account into a business to list and manage products.
        </p>
        <Link
          to="/dashboard/settings/profile?page=business"
          className="mt-4 inline-block font-semibold text-orange-600 hover:underline"
        >
          Set up my business
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF9F6] px-4 pb-16 pt-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50">
            <Boxes className="h-6 w-6 text-orange-500" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Inventory</h1>
            <p className="text-sm text-gray-500">
              {loading ? 'Loading…' : `${products.length.toLocaleString()} products`}
            </p>
          </div>
        </div>

        <div className="mb-5 flex w-fit gap-1 rounded-full bg-white p-1 ring-1 ring-black/5">
          {(
            [
              ['stock', 'Stock'],
              ['upload', 'Upload'],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={cn(
                'rounded-full px-5 py-1.5 text-sm font-medium transition',
                tab === key ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'upload' ? (
          <UploadTab onSaved={() => void load()} />
        ) : (
          <StockTab products={products} loading={loading} onReload={() => void load()} onPatched={patch} />
        )}
      </div>
    </div>
  );
}
