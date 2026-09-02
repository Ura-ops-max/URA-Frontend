import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, BadgeCheck, Store, ShoppingBag } from 'lucide-react';
import { useSeo } from '@/hooks/useSeo';
import { categoryColor } from '@/lib/category-colors';
import { ProductThumb } from '@/components/product/shared/ProductThumb';
import { getPublicProductsFn } from '@/lib/api';
import { FadeIn, Stagger, FadeItem } from '@/components/shared/Motion';

interface CatalogProduct {
  _id: string;
  name?: string;
  price?: number;
  description?: string;
  media?: string[];
  category?: string;
  stock?: number;
  displayName?: string;
  displayAvatar?: string;
  isVerified?: boolean;
}

const naira = (n?: number) =>
  typeof n === 'number' ? `₦${n.toLocaleString()}` : '—';

const ProductsPage = () => {
  useSeo({
    title: 'Shop Products',
    description:
      'Browse and buy products from verified vendors across Nigeria. Escrow-protected payments, AI-powered search, and fast delivery on URA.',
    url: 'https://www.ura.com.ng/products',
  });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-products'],
    queryFn: () => getPublicProductsFn(1),
    staleTime: 1000 * 60 * 2,
  });

  const products = (data as CatalogProduct[] | undefined) ?? [];

  // Build the category list from the products actually available.
  const categories = [
    'All',
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean) as string[])).sort(),
  ];

  const filtered = products.filter((p) => {
    const q = query.toLowerCase();
    const matchesQuery =
      !q ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q) ||
      p.displayName?.toLowerCase().includes(q);
    const matchesCategory = category === 'All' || p.category === category;
    return matchesQuery && matchesCategory;
  });

  return (
    <main className="bg-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-slate-50">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.12),transparent_55%)]" />
        <FadeIn className="relative mx-auto max-w-3xl px-6 py-16 text-center md:py-24">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-500 shadow-sm ring-1 ring-slate-100">
            <ShoppingBag className="h-3.5 w-3.5" /> Marketplace
          </span>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 md:text-6xl">
            Discover <span className="text-amber-500">Products</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600">
            Browse products from trusted local businesses. Sign in to buy securely with escrow.
          </p>

          <div className="relative mx-auto mt-8 max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-11 pr-4 text-sm shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </div>
        </FadeIn>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        {/* Category filter */}
        {!isLoading && !isError && products.length > 0 && (
          <div className="mb-10 flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  category === cat
                    ? 'bg-amber-500 text-white shadow-sm shadow-amber-200'
                    : 'border border-slate-200 bg-white text-slate-600 hover:border-amber-300 hover:text-amber-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          </div>
        ) : isError ? (
          <p className="py-20 text-center text-slate-400">Couldn&apos;t load products. Please try again.</p>
        ) : filtered.length === 0 ? (
          <p className="py-20 text-center text-slate-400">
            {query
              ? `No products match “${query}”.`
              : category !== 'All'
                ? `No products in ${category} yet.`
                : 'No products listed yet.'}
          </p>
        ) : (
          <Stagger className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {filtered.map((p) => (
              <FadeItem key={p._id}>
                <Link
                  to={`/dashboard/product/${p._id}`}
                  className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white transition hover:shadow-lg hover:shadow-slate-100"
                >
                  <div className="aspect-square overflow-hidden bg-slate-100">
                    {p.media?.[0] ? (
                      <ProductThumb
                        url={p.media[0]}
                        alt={p.name}
                        imgClassName="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-300">
                        <ShoppingBag className="h-10 w-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {p.category && (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${categoryColor(p.category).bg} ${categoryColor(p.category).text}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${categoryColor(p.category).dot}`}
                        />
                        {p.category}
                      </span>
                    )}
                    <h3 className="mt-1 truncate text-sm font-bold text-slate-900">{p.name}</h3>
                    <p className="mt-1 text-lg font-black text-amber-600">{naira(p.price)}</p>
                    {p.displayName && (
                      <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Store className="h-3 w-3" />
                        <span className="truncate">{p.displayName}</span>
                        {p.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-sky-500" />}
                      </div>
                    )}
                  </div>
                </Link>
              </FadeItem>
            ))}
          </Stagger>
        )}
      </section>
    </main>
  );
};

export default ProductsPage;
