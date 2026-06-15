// src/components/homepage/MarketPlace.tsx
import React, { useState } from 'react';
import { usePostsFeed } from '@/hooks/api/use-feed';
import ProductPostCard from '../feed/ProductPostCard';
import CategoryRibbon from './CategoryRibbon';
import { Loader2, AlertCircle, ShoppingBag, ChartNoAxesCombined, Star, MapPin } from 'lucide-react';

// Small utility types
type Stat = {
  label: string;
  value: string;
  icon?: React.ReactNode;
};

// ---------- Feed (composed) ----------
const sampleStats: Stat[] = [
  { label: 'Businesses', value: '50K', icon: <ChartNoAxesCombined className="w-6 h-6" /> },
  { label: 'Transactions', value: '10K', icon: <Star className="w-6 h-6" /> },
  { label: 'State', value: '36', icon: <MapPin className="w-6 h-6" /> },
];

// ---------- Stats Row ----------
export const StatsRow: React.FC<{ stats: Stat[] }> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-lg border border-[#F1D7CC] p-6 shadow-sm flex flex-col justify-center items-center gap-2 text-center"
        >
          {s.icon && <div className="text-[#D9730D] mb-2">{s.icon}</div>}
          <div className="text-2xl font-semibold text-[#D9730D]">{s.value}</div>
          <div className="text-sm text-gray-600">{s.label}</div>
        </div>
      ))}
    </div>
  );
};

const MarketplaceFeed = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Fetching data - restrict: false allows public viewing
  const { data, status, refetch } = usePostsFeed(undefined, false);

  // 1. Flatten pages and 2. Filter ONLY for Product types immediately
  const allProducts = React.useMemo(() => {
    const posts = data?.pages?.flat() || [];
    return posts.filter((post) => post.type === 'PRODUCT');
  }, [data]);

  // 3. Apply Category Filter
  const filteredProducts =
    selectedCategory === 'All'
      ? allProducts
      : allProducts.filter((post) => post?.product?.category === selectedCategory);

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Stats */}
      <div className="mb-8">
        <StatsRow stats={sampleStats} />
      </div>
      <section className="bg-gray-50 min-h-screen">
        <CategoryRibbon activeCategory={selectedCategory} onSelect={setSelectedCategory} />

        <div className="max-w-4xl mx-auto px-4 py-8">
          {status === 'pending' && (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
              <p className="text-sm font-medium italic">Loading Nigerian Marketplace...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center py-10 bg-white rounded-3xl border border-red-100 p-8 shadow-sm">
              <AlertCircle className="mx-auto text-red-500 mb-4" size={32} />
              <p className="text-gray-900 font-bold">Could not load products</p>
              <p className="text-gray-500 text-sm mb-6">
                Check your internet connection and try again.
              </p>
              <button
                onClick={() => refetch()}
                className="bg-orange-500 text-white px-10 py-2 rounded-full font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 gap-8">
            {filteredProducts.map((post) => (
              <ProductPostCard key={post._id} post={post} />
            ))}
          </div>

          {/* Empty State */}
          {status === 'success' && filteredProducts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-gray-100">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="text-gray-300" size={28} />
              </div>
              <h3 className="text-gray-900 font-bold text-lg">No products found</h3>
              <p className="text-gray-400 text-sm">
                {selectedCategory === 'All'
                  ? 'The marketplace is empty right now.'
                  : `No items available in the ${selectedCategory} category.`}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default MarketplaceFeed;
