import React, { useState } from 'react';
import { Heart, ShoppingCart, Info, Star, Pencil, Trash2, Loader2, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useToggleLike, useDeletePost } from '@/hooks/api/use-feed';
import { categoryColor } from '@/lib/category-colors';
import { useAuthContext } from '@/context/auth-provider';
import { EditItemModal } from './EditItemModal';
import type { ProductType } from '@/types/feed.types';
import { useCartContext } from '@/context/cart-provider';
import ProductImage from '@/components/product/ProductImage';
import { visibleDescription } from '@/lib/product-placeholder';

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
  const cat = categoryColor(product.category);

  // Owner (the seller) sees Edit / Delete on their own products. Products carry
  // the BUSINESS id in authorId/business, so match against the user's own id
  // AND the id of the business they own.
  const { user, related } = useAuthContext();
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const myBusinessId = (related as { business_id?: string } | undefined)?.business_id;
  const ownerIds = [user?._id, myBusinessId].filter(Boolean) as string[];
  const p = product as { authorId?: string; business?: string; isOwner?: boolean };
  const isOwner =
    p.isOwner ?? (ownerIds.includes(p.authorId as string) || ownerIds.includes(p.business as string));
  const deleteProduct = useDeletePost(product._id, 'product');

  // Once the item is in the cart, the card shows − qty + instead of "Add".
  const { cart, updateQty, removeItem, isUpdating } = useCartContext();
  const cartQty: number = isAuthenticated
    ? (cart?.items ?? []).find(
        (i: any) => (i?.product?._id ?? i?.product) === product._id,
      )?.quantity ?? 0
    : 0;
  const changeQty = (e: React.MouseEvent, next: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (isUpdating) return;
    if (next < 1) void removeItem(product._id);
    else void updateQty(product._id, next);
  };

  // Real rating only — hidden until the product has been reviewed.
  const rating = Number((product as { averageRating?: number }).averageRating) || 0;
  const reviews = Number((product as { totalReviews?: number }).totalReviews) || 0;

  // Bulk-uploaded items often have no description, or one that just repeats
  // the name. Don't show it twice.
  const description = visibleDescription(product.description, product.name);
  const showDescription = description.length > 0;

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
        <ProductImage
          src={product.media?.[0]}
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

        {/* Owner actions — Edit / Delete (only the seller sees these) */}
        {isOwner && (
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowEdit(true);
              }}
              title="Edit product"
              className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-white text-gray-700 transition-all active:scale-90"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              title="Delete product"
              className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-sm hover:bg-red-50 text-red-600 transition-all active:scale-90"
            >
              <Trash2 size={16} />
            </button>
          </div>
        )}

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
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest truncate',
              cat.bg,
              cat.text,
            )}
          >
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', cat.dot)} />
            {product.category}
          </span>
          {reviews > 0 && rating > 0 && (
            <div className="flex items-center gap-0.5 bg-gray-50 px-1.5 py-0.5 rounded-full">
              <Star size={10} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[10px] font-bold text-gray-600">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-bold text-gray-900 text-sm leading-tight line-clamp-1 group-hover:text-orange-600 transition-colors">
            {product.name}
          </h3>
          <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed h-8">
            {showDescription ? description : ''}
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
            {cartQty > 0 ? (
              <div className="flex-1 flex items-center justify-between h-10 rounded-xl bg-gray-900 text-white px-1">
                <button
                  onClick={(e) => changeQty(e, cartQty - 1)}
                  disabled={isUpdating}
                  aria-label={cartQty === 1 ? 'Remove from cart' : 'One less'}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 disabled:opacity-50"
                >
                  {cartQty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                </button>
                <span className="text-sm font-black tabular-nums" aria-live="polite">
                  {cartQty}
                </span>
                <button
                  onClick={(e) => changeQty(e, cartQty + 1)}
                  disabled={isUpdating || cartQty >= product.stock}
                  aria-label="One more"
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/10 active:scale-90 disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>
            ) : (
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
            )}
          </div>
        </div>
      </div>

      {/* Owner: edit product */}
      {isOwner && (
        <EditItemModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          item={{
            _id: product._id,
            type: 'PRODUCT',
            caption: product.description ?? '',
            tags: [],
            media: product.media ?? [],
            productDetails: {
              _id: product._id,
              name: product.name ?? '',
              price: product.price ?? 0,
              description: product.description ?? '',
              category: product.category ?? '',
              stock: product.stock ?? 0,
              media: product.media ?? [],
            },
          }}
        />
      )}

      {/* Owner: delete confirmation */}
      {isOwner && showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (!deleteProduct.isPending) setShowDeleteConfirm(false);
          }}
        >
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-6 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Delete this product?</h3>
            <p className="mt-1 text-sm text-gray-500">
              “{product.name}” will be removed permanently. This can't be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteProduct.isPending}
                className="flex-1 h-11 rounded-xl border border-gray-200 font-bold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() =>
                  deleteProduct.mutate(undefined, {
                    onSuccess: () => setShowDeleteConfirm(false),
                    onError: () => setShowDeleteConfirm(false),
                  })
                }
                disabled={deleteProduct.isPending}
                className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2"
              >
                {deleteProduct.isPending ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Trash2 size={16} />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
