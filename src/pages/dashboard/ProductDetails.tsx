import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  ShieldCheck,
  Truck,
  Package,
  Ruler,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Play,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToggleLike } from '@/hooks/api/use-feed';
import { useSingleProduct } from '@/hooks/api/use-product';
import { useCartContext } from '@/context/cart-provider';
import { useAuthContext } from '@/context/auth-provider';
import { Button } from '@/components/ui/button';
import InstallAppButton from '@/components/shared/InstallAppButton';
import { VideoPlayer } from '@/components/feed/VideoPlayer';

/** True when a media URL points to a video file rather than an image. */
const isVideoUrl = (u?: string) => !!u && /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(u);

const ProductDetailsPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useSingleProduct(productId!);
  const product = data?.product;
  const relatedProducts = data?.relatedProducts;

  const { addItem, isUpdating } = useCartContext();
  const { isAuthenticated } = useAuthContext();

  const [isLiked, setIsLiked] = useState(false);
  const [activeMedia, setActiveMedia] = useState(0);
  const { mutate: toggleLike } = useToggleLike(productId || '', 'product');

  useEffect(() => {
    if (product) setIsLiked(!!product.isLiked);
  }, [product]);

  const handleLikeClick = () => {
    if (!isAuthenticated) return navigate('/login'); // Or your auth trigger
    const prev = isLiked;
    setIsLiked(!prev);
    toggleLike(undefined, { onError: () => setIsLiked(prev) });
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) return navigate('/login');
    if (!product?._id) return;
    addItem(product._id, 1);
  };

  const handleViewStore = () => {
    const businessId = product?.business?._id;
    if (!businessId) return;
    navigate(`/dashboard/profile/business/${businessId}`);
  };

  if (isLoading)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-orange-500" size={40} />
        <p className="text-sm font-black text-gray-400 uppercase tracking-widest">
          Loading Product...
        </p>
      </div>
    );

  if (error || !product)
    return (
      <div className="h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-black mb-2">Product Not Found</h2>
        <Button onClick={() => navigate(-1)} variant="ghost">
          Go Back
        </Button>
      </div>
    );

  const formattedPrice = new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(product.price || 0);

  const displaySizes =
    typeof product.size === 'string'
      ? product.size
      : Array.isArray(product.size)
        ? product.size.join(', ')
        : 'Standard Size';

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* 1. TOP NAVIGATION */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-50">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2">
          <InstallAppButton className="hidden sm:inline-flex" />
          <button
            onClick={handleLikeClick}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Heart
              size={24}
              className={cn(isLiked ? 'fill-red-500 text-red-500' : 'text-gray-900')}
            />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:gap-12 lg:p-12">
        {/* 2. MEDIA SECTION */}
        <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-fit">
          <div className="aspect-[4/5] bg-gray-50 overflow-hidden lg:rounded-3xl">
            {isVideoUrl(product.media?.[activeMedia]) ? (
              <VideoPlayer
                key={product.media[activeMedia]}
                url={product.media[activeMedia]}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={product.media?.[activeMedia] ?? product.media?.[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          {/* Gallery thumbnails — click to switch; videos show a play badge */}
          {product.media?.length > 1 && (
            <div className="flex gap-2 p-4 lg:px-0 overflow-x-auto">
              {product.media?.map((m: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveMedia(i)}
                  className={cn(
                    'relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border bg-gray-50 transition',
                    activeMedia === i ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-100',
                  )}
                >
                  {isVideoUrl(m) ? (
                    <>
                      <video src={`${m}#t=0.1`} preload="metadata" className="w-full h-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play size={16} className="text-white fill-white" />
                      </span>
                    </>
                  ) : (
                    <img src={m} className="w-full h-full object-cover" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. DETAILS SECTION */}
        <div className="flex-1 p-6 lg:p-0">
          <span className="text-[11px] font-black text-orange-500 uppercase tracking-[0.3em] mb-4 block">
            {product.category}
          </span>

          <h1 className="text-3xl lg:text-5xl font-black text-gray-900 mb-2 leading-tight">
            {product.name}
          </h1>

          <p className="text-3xl font-black text-orange-600 mb-10">{formattedPrice}</p>

          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Package size={18} />
                <span className="text-[10px] font-bold uppercase text-gray-400">Stock Status</span>
              </div>
              <p className="text-sm font-black text-gray-900">
                {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="flex items-center gap-2 text-orange-500 mb-2">
                <Ruler size={18} />
                <span className="text-[10px] font-bold uppercase text-gray-400">Variations</span>
              </div>
              <p className="text-sm font-black text-gray-900 truncate">{displaySizes}</p>
            </div>
          </div>

          <div className="space-y-4 mb-10">
            <h3 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">
              Description
            </h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-base">
              {product.description}
            </p>
          </div>

          {/* VENDOR CARD */}
          <div className="p-6 rounded-3xl bg-orange-50/30 border border-orange-100 flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <img
                src={product.business?.businessLogo || product.displayAvatar}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-white shadow-sm"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="font-black text-gray-900">
                    {product.business?.businessName || product.displayName}
                  </p>
                  <CheckCircle2 size={16} className="text-blue-500" />
                </div>
                <p className="text-xs text-gray-500 font-medium">Verified Merchant</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleViewStore}
              disabled={!product.business?._id}
              className="rounded-xl border-orange-200 text-orange-600 font-bold text-xs"
            >
              View Store
            </Button>
          </div>

          {/* ACTION BUTTONS */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-100 lg:relative lg:bg-transparent lg:border-none lg:p-0 flex gap-4">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock <= 0 || isUpdating}
              className="flex-1 h-16 bg-gray-900 hover:bg-black text-white rounded-2xl font-black text-lg gap-3 transition-all active:scale-95 shadow-xl disabled:opacity-60"
            >
              {isUpdating ? (
                <Loader2 size={22} className="animate-spin" />
              ) : (
                <ShoppingCart size={22} />
              )}
              {product.stock <= 0 ? 'OUT OF STOCK' : isUpdating ? 'ADDING…' : 'ADD TO CART'}
            </Button>
          </div>

          <div className="hidden lg:flex items-center gap-8 mt-12 opacity-40">
            <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
              <ShieldCheck size={16} /> Secure Payment
            </div>
            <div className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-widest">
              <Truck size={16} /> Doorstep Delivery
            </div>
          </div>
        </div>
      </div>

      {relatedProducts?.length > 0 && (
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20 border-t border-gray-100">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl font-black text-gray-900">You Might Also Like</h2>
              <p className="text-sm text-gray-500 font-medium">
                Similar items from the {product?.category} category
              </p>
            </div>
            <Link
              to={`/dashboard/feed?category=${product?.category}`}
              className="text-xs font-black text-orange-600 hover:underline tracking-widest uppercase"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
            {relatedProducts.map((item: any) => (
              <Link
                key={item._id}
                to={`/dashboard/product/${item._id}`}
                className="group block"
                onClick={() => window.scrollTo(0, 0)} // Scroll to top when clicking related
              >
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 mb-3">
                  <img
                    src={item.media[0]}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    alt={item.name}
                  />
                </div>
                <h4 className="font-bold text-gray-900 text-sm truncate group-hover:text-orange-600 transition-colors">
                  {item.name}
                </h4>
                <p className="text-orange-600 font-black text-sm">
                  {new Intl.NumberFormat('en-NG', {
                    style: 'currency',
                    currency: 'NGN',
                    maximumFractionDigits: 0,
                  }).format(item.price)}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailsPage;
