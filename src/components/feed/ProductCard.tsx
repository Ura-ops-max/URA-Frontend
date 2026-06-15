import React, { useState } from 'react';
import { Heart, ShoppingCart, Info, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToggleLike } from '@/hooks/api/use-feed';
import type { ProductType } from '@/types/feed.types';

// interface Product {
//   _id: string;
//   name: string;
//   price: number;
//   description: string;
//   media: string[];
//   category: string;
//   stock: number;
//   isLiked?: boolean;
// }

interface ProductCardProps {
  product: ProductType;
  isAuthenticated: boolean;
  onRequireAuth?: () => void;
  onViewDetails?: (product: ProductType) => void;
  onAddToCart?: (product: ProductType) => void;
  className?: string;
}

export const ProductCard = ({
  product,
  isAuthenticated,
  onRequireAuth,
  onViewDetails,
  onAddToCart,
  className,
}: ProductCardProps) => {
  const [isWishlisted, setIsWishlisted] = useState(product.isLiked || false);
  const { mutate: toggleLike } = useToggleLike(product._id, 'product');

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return onRequireAuth?.();

    setIsWishlisted((prev) => !prev);
    toggleLike(undefined, {
      onError: () => setIsWishlisted(!isWishlisted),
    });
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col h-full bg-white rounded-2xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-orange-100',
        className,
      )}
    >
      {/* 1. IMAGE CONTAINER */}
      <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 shrink-0">
        <img
          src={product.media[0] || '/placeholder-product.png'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Floating Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            onClick={handleWishlist}
            className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-400 transition-all active:scale-90"
          >
            <motion.div animate={{ scale: isWishlisted ? [1, 1.4, 1] : 1 }}>
              <Heart
                size={18}
                className={cn(
                  'transition-colors',
                  isWishlisted ? 'fill-red-500 text-red-500' : 'hover:text-red-400',
                )}
              />
            </motion.div>
          </button>
        </div>

        {/* Badge: Stock or Category */}
        <div className="absolute bottom-2 left-2 flex gap-1">
          {product.stock <= 0 ? (
            <span className="bg-gray-900 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase">
              Sold Out
            </span>
          ) : product.stock < 5 ? (
            <span className="bg-red-500 text-white text-[9px] font-bold px-2 py-1 rounded-md uppercase animate-pulse">
              Low Stock
            </span>
          ) : null}
        </div>
      </div>

      {/* 2. CONTENT SECTION */}
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest truncate">
            {product.category}
          </span>
          <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full">
            <Star size={10} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[10px] font-bold text-gray-600">4.8</span>
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed h-8">
            {product.description}
          </p>
        </div>

        {/* 3. FOOTER SECTION */}
        <div className="mt-auto pt-2 space-y-3">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-gray-900">{formattedPrice}</span>
            {/* Optional: Add a "was" price if your API supports it */}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewDetails?.(product)}
              className="flex items-center justify-center w-10 h-10 rounded-xl border border-gray-200 text-gray-400 hover:bg-gray-50 hover:text-orange-500 transition-all shrink-0"
            >
              <Info size={18} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (onAddToCart) {
                  onAddToCart(product);
                }
              }}
              disabled={product.stock <= 0} // Disable if out of stock
              className={cn(
                'flex-1 bg-gray-900 hover:bg-orange-600 text-white h-10 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95',
                product.stock <= 0 && 'opacity-50 cursor-not-allowed bg-gray-400 hover:bg-gray-400',
              )}
            >
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">
                {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
              </span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
