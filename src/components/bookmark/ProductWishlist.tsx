// components/bookmarks/WishlistTab.tsx
import { useWishlist } from '@/hooks/api/use-product';
import { ProductCard } from '../feed/ProductCard';
import { ProductDetailsModal } from '../feed/ProductDetailsModal';
import { useState } from 'react';
import { Loader2, HeartOff } from 'lucide-react';
import type { ProductPostType } from '@/types/feed.types';

export default function WishlistTab() {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useWishlist();
  const [selectedProduct, setSelectedProduct] = useState<ProductPostType | null>(null);

  const allProducts = data?.pages.flatMap((page) => page) || [];

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );

  if (allProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
        <HeartOff className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold">Your wishlist is empty.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {allProducts.map((product: any) => (
        <ProductCard
          key={product._id}
          product={product}
          isAuthenticated={true}
          onViewDetails={(p) => setSelectedProduct(p)}
        />
      ))}

      {/* Reusing your modal logic */}
      <ProductDetailsModal
        isOpen={!!selectedProduct}
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isAuthenticated={true}
      />

      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
          className="col-span-full py-4 text-orange-600 font-bold text-sm"
        >
          {isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
}
