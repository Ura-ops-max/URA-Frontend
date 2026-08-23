import { useState } from 'react';
import { ShoppingBag, CheckCircle2, Star, Info, Trash2, Edit2, Loader2 } from 'lucide-react';
import useAuth from '@/hooks/api/use-auth';
import type { CardProps, ProductPostType } from '@/types/feed.types';
import { MediaCarousel } from './MediaCarousel';
import { PostActions } from './PostAction';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { Link, useLocation } from 'react-router-dom';
import { useCartContext } from '@/context/cart-provider';
import { ProductDetailsModal } from './ProductDetailsModal';
import { cn } from '@/lib/utils';
import { AuthPromptModal } from '../shared/AuthPromptModel';
import { PostMenu } from './PostMenu';
import { Flag, UserPlus, Link2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatTimeAgo } from '@/utils/date-format';
import { useDeletePost } from '@/hooks/api/use-feed';
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogDescription,
  DialogTitle,
  DialogContent,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { EditItemModal } from './EditItemModal';

export default function ProductPostCard({ post, onRequireAuth }: CardProps<ProductPostType>) {
  const { isAuthenticated, user, related } = useAuth();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cart = useCartContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDetails, setShowDetails] = useState(false); // Modal state
  const product = post.product;
  const price = product?.price || 0;
  const stock = product?.stock || 0;
  const category = product?.category || 'General'; // Fallback if category is missing
  // 1. SINGLE STATE FOR AUTH POPUP
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authConfig, setAuthConfig] = useState({ title: '', subtitle: '', action: '' });

  const location = useLocation();
  const isPublicPath = location.pathname === '/';

  // Products posted by a business carry the BUSINESS id in `authorId` /
  // `product.business`, so comparing only against `user._id` never matched and
  // sellers never saw Edit/Delete on their own products. Also match the id of
  // the business this user owns.
  const myBusinessId = (related as { business_id?: string } | undefined)?.business_id;
  const ownerIds = [user?._id, myBusinessId].filter(Boolean);
  const isOwner =
    ownerIds.includes(post.authorId) ||
    ownerIds.includes(post.product?.business as unknown as string);

  const deleteMutation = useDeletePost(post._id, 'product');

  const handleDelete = () => {
    deleteMutation.mutate(undefined, {
      onSuccess: () => setShowDeleteConfirm(false),
      onError: () => setShowDeleteConfirm(false),
    });
  };

  // 2. CENTRALIZED AUTH CHECKER
  const ensureAuth = (type: 'buy' | 'like' | 'comment' | 'bookmark' | 'menu') => {
    if (isAuthenticated) return true;

    const configs = {
      buy: {
        title: 'Ready to shop?',
        subtitle: 'Sign in to add items to your cart and enjoy a seamless checkout.',
        action: 'purchase',
      },
      like: {
        title: 'Like this product?',
        subtitle: 'Sign in to show your appreciation and save it to your feed.',
        action: 'like',
      },
      comment: {
        title: 'Have a question?',
        subtitle: 'Log in to chat with the vendor or ask about this product.',
        action: 'comment',
      },
      bookmark: {
        title: 'Save for later',
        subtitle: 'Login to add this item to your personal wishlist.',
        action: 'bookmark',
      },
      menu: {
        title: 'More Options',
        subtitle: 'Sign in to follow this vendor or report inappropriate content.',
        action: 'access menu',
      },
    };

    setAuthConfig(configs[type]);
    setShowAuthModal(true);
    return false;
  };
  // Define your menu actions
  const menuActions = [
    {
      label: 'Follow Vendor',
      icon: UserPlus,
      show: true,
      onClick: () => console.log('Follow logic'),
    },
    {
      label: 'Copy Store Link',
      icon: Link2,
      show: true,
      onClick: () => {
        const storeId = post.authorId || (post.product?.business as unknown as string);
        const url = storeId
          ? `${window.location.origin}/dashboard/profile/business/${storeId}`
          : `${window.location.origin}/posts/${post._id}`;
        navigator.clipboard.writeText(url);
        toast.success(storeId ? 'Store link copied!' : 'Link copied!');
      },
    },
    {
      label: 'Report Post',
      icon: Flag,
      variant: 'danger' as const,
      show: true,
      onClick: () => console.log('Report logic'),
    },
    ...(isOwner
      ? [
          {
            label: 'Edit Product',
            icon: Edit2,
            show: true,
            onClick: () => setShowEditModal(true),
          },
          {
            label: 'Delete Product',
            icon: Trash2,
            variant: 'danger' as const,
            show: true,
            onClick: () => setShowDeleteConfirm(true),
          },
        ]
      : []),
  ];

  const handleBuy = () => {
    if (ensureAuth('buy') && product?._id) {
      cart?.addItem(product._id, 1);
    }
  };

  const handleMenuIntercept = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      ensureAuth('menu');
    }
  };

  // Dynamic Button Content
  const buttonLabel = isAuthenticated ? 'Add to Cart' : 'Buy Now';
  const ButtonIcon = isAuthenticated ? ShoppingBag : ShoppingBag; // You can use a different icon like ShoppingCart if preferred

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(price);

  const user_image = post.displayAvatar || generateAvatarUrl(post.displayName);
  const TEXT_LIMIT = 120;
  const shouldShowReadMore = post.caption.length > TEXT_LIMIT;
  const displayText = isExpanded ? post.caption : post.caption.slice(0, TEXT_LIMIT) + '...';

  return (
    <div className="bg-white border-b border-gray-100 lg:rounded-[2rem] lg:border lg:mb-10 lg:shadow-xl overflow-hidden animate-fadeIn transition-transform duration-300">
      {/* 1. TOP HEADER & CAPTION SECTION */}
      <div className="p-4 lg:p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user_image}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 p-0.5"
              alt=""
            />
            <div>
              <Link
                to={`/dashboard/profile/business/${post.authorId}`}
                className="flex items-center gap-1 group"
              >
                <h3 className="font-black text-gray-900 text-[16px] group-hover:text-orange-600 transition-colors">
                  {post.displayName}
                </h3>
                {post.isVerified && <CheckCircle2 size={14} className="fill-blue-500 text-white" />}
              </Link>
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      size={10}
                      className={cn(
                        'transition-all',
                        star <= Math.round(post.rating || 0)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'fill-gray-200 text-gray-200',
                      )}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    {isPublicPath
                      ? 'Featured Vendor'
                      : post?.rating > 0
                        ? `${post.rating} Shop Rating`
                        : 'New Vendor'}
                  </span>
                  <span className="text-[12px] text-gray-300">•</span>
                  <span className="text-[10px] font-medium text-gray-400 lowercase italic">
                    {formatTimeAgo(post.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* AUTH PROTECTED MENU */}
          <div onClickCapture={handleMenuIntercept}>
            <PostMenu
              actions={menuActions}
              triggerClassName={!isAuthenticated ? 'pointer-events-none' : ''}
            />
          </div>
        </div>

        <p className="text-gray-700 text-[15px] leading-relaxed mb-3">
          {shouldShowReadMore ? displayText : post.caption}
          {shouldShowReadMore && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-600 font-extrabold ml-1 hover:underline"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </button>
          )}
        </p>
      </div>

      {/* 2. MEDIA CAROUSEL */}
      <div className="px-0 lg:px-4">
        {/* Inside ProductPostCard.tsx */}
        <div className="lg:rounded-2xl overflow-hidden relative shadow-inner isolate">
          {' '}
          {/* "isolate" is the magic CSS property here */}
          <MediaCarousel media={product?.media ?? []} />
          <div className="absolute top-4 left-4 z-[35] bg-orange-600/95 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg border border-white/10">
            <ShoppingBag size={12} />
            <span>Marketplace Item</span>
          </div>
        </div>
      </div>

      {/* 3. PRODUCT INFO & CONVERSION SECTION */}
      {/* 3. PRODUCT INFO & CONVERSION SECTION */}
      <div className="p-4 lg:p-6 pt-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
          <div className="flex-1 min-w-0">
            {/* --- NEW CATEGORY BADGE --- */}
            <div className="inline-flex items-center mb-1.5 px-2 py-0.5 rounded-md bg-orange-100/50 border border-orange-200/50">
              <span className="text-[9px] font-black uppercase tracking-widest text-orange-700">
                {category}
              </span>
            </div>

            <h2 className="text-lg font-black text-gray-900 truncate tracking-tight">
              {product?.name || 'Product'}
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-orange-600">{formattedPrice}</span>
              {stock < 5 && (
                <span className="bg-red-100 text-red-600 text-[9px] font-black px-2 py-0.5 rounded uppercase">
                  Only {stock} Left
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-orange-600 hover:border-orange-200 transition-all shadow-sm active:scale-90 shrink-0"
              title="View Product Details"
            >
              <Info size={22} />
            </button>
            {/* DYNAMIC BUTTON: Swaps based on isAuthenticated */}
            <button
              onClick={handleBuy}
              className={cn(
                'flex-1 sm:flex-none px-6 py-3.5 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95',
                isAuthenticated
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-100'
                  : 'bg-black text-white hover:bg-gray-800 shadow-gray-200',
              )}
            >
              <ButtonIcon size={18} />
              <span className="whitespace-nowrap">{buttonLabel}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4. SOCIAL ACTIONS */}
      <PostActions
        postId={post._id}
        user_image={user_image}
        isAuthenticated={isAuthenticated}
        onRequireAuth={onRequireAuth}
        initialLikes={post.likesCount || 0}
        initialComments={post.commentsCount || 0}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
        storeId={(post.authorId || (post.product?.business as unknown as string)) ?? undefined}
      />

      {/* Product Details Modal Integration */}
      <ProductDetailsModal
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        product={{
          ...product,
          media: product?.media,
          displayAvatar: user_image,
          displayName: post.displayName,
        }}
        isAuthenticated={isAuthenticated}
        onRequireAuth={onRequireAuth}
        onAddToCart={(p: any) => {
          cart?.addItem(p?._id || post._id, 1);
          setShowDetails(false);
        }}
      />

      <EditItemModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={{
          _id: post._id,
          type: 'PRODUCT',
          caption: post.caption,
          tags: post.tags || [],
          productDetails: {
            _id: post.product!._id,
            name: post.product!.name,
            price: post.product!.price,
            description: post.product!.description,
            category: post.product!.category,
            stock: post.product!.stock,
            media: post.product!.media || [],
          },
        }}
      />

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              This will permanently delete the product and any associated posts. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* THE ONLY AUTH MODAL INSTANCE */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authConfig.title}
        subtitle={authConfig.subtitle}
        actionName={authConfig.action}
      />
    </div>
  );
}
