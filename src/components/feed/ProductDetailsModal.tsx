import { useState, useEffect } from "react";
import { X, ShoppingCart, Heart, Star, ShieldCheck, Truck, Package, Ruler, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useToggleLike } from "@/hooks/api/use-feed";

export const ProductDetailsModal = ({ 
  isOpen, onClose, product, onAddToCart, isAuthenticated, onRequireAuth 
}: any) => {
  // WISHLIST LOGIC
  const [isLiked, setIsLiked] = useState(false);
  const { mutate: toggleLike } = useToggleLike(product?._id || "", 'product');

  useEffect(() => {
    if (product) {
      // Prioritize isLiked from your API JSON
      setIsLiked(!!product.isLiked);
    }
  }, [product, isOpen]);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated) return onRequireAuth?.();
    
    const previousState = isLiked;
    setIsLiked(!previousState);

    toggleLike(undefined, {
      onError: () => setIsLiked(previousState)
    });
  };

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency", currency: "NGN", maximumFractionDigits: 0,
  }).format(product.price || 0);

  // FIX: Handle size whether it's a string "sm, lg" or an array ["sm", "lg"]
  const displaySizes = typeof product.size === 'string' 
    ? product.size 
    : Array.isArray(product.size) 
      ? product.size.join(", ") 
      : "Standard Size";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end lg:items-center justify-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-sm" />

          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full bg-white flex flex-col rounded-t-[32px] h-[95vh] lg:flex-row lg:rounded-3xl lg:max-w-5xl lg:h-auto lg:max-h-[85vh] lg:w-full overflow-hidden"
          >
            {/* MOBILE FLOATING BUTTONS */}
            <div className="lg:hidden flex items-center justify-between px-6 py-4 absolute top-0 left-0 right-0 z-30 pointer-events-none">
              <button onClick={onClose} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto shadow-md">
                <X size={20} />
              </button>
              <button onClick={handleLikeClick} className="w-10 h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-auto shadow-md">
                <Heart size={20} className={cn(isLiked ? "fill-red-500 text-red-500" : "text-gray-900")} />
              </button>
            </div>

            {/* FULL SCROLLABLE AREA */}
            <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row no-scrollbar">
              
              {/* IMAGE SECTION */}
              <div className="w-full lg:w-[45%] shrink-0 bg-gray-50">
                <img src={product.media?.[0]} alt={product.name} className="w-full h-full object-cover aspect-[4/5] lg:aspect-square lg:h-full" />
              </div>

              {/* DETAILS SECTION */}
              <div className="w-full lg:w-[55%] p-6 lg:p-12 flex flex-col">
                <button onClick={onClose} className="hidden lg:flex absolute top-6 right-6 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"><X size={20}/></button>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em]">{product.category}</span>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    <span>4.5 Rating</span>
                  </div>
                </div>

                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">{product.name}</h1>
                <p className="text-3xl font-black text-orange-600 mb-8">{formattedPrice}</p>

                {/* DYNAMIC SPECS GRID */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                  <div className="flex flex-col gap-1 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                      <Package size={16} />
                      <span className="text-[10px] font-bold uppercase text-gray-400">Availability</span>
                    </div>
                    <p className="text-sm font-black text-gray-900">{product.stock > 0 ? `${product.stock} pieces left` : "Out of Stock"}</p>
                  </div>
                  
                  <div className="flex flex-col gap-1 p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-2 text-orange-500 mb-1">
                      <Ruler size={16} />
                      <span className="text-[10px] font-bold uppercase text-gray-400">Available Sizes</span>
                    </div>
                    <p className="text-sm font-black text-gray-900 truncate">{displaySizes}</p>
                  </div>
                </div>

                {/* DESCRIPTION */}
                <div className="mb-8">
                  <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Product Story</h3>
                  <p className="text-gray-600 text-sm lg:text-base leading-relaxed whitespace-pre-line">{product.description}</p>
                </div>

                {/* BUSINESS INFO SECTION */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-orange-50/50 border border-orange-100 mb-8">
                  <div className="flex items-center gap-3">
                    <img 
                      src={product.business?.businessLogo || product.displayAvatar} 
                      className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm" 
                      alt="vendor" 
                    />
                    <div>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-black text-gray-900">{product.business?.businessName || product.displayName}</p>
                        <CheckCircle2 size={14} className="text-blue-500 fill-blue-50" />
                      </div>
                      <p className="text-[11px] text-gray-500">Professional Merchant</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-black text-orange-600 px-4 py-2 bg-white rounded-xl shadow-sm hover:bg-orange-600 hover:text-white transition-all">
                    STORE
                  </button>
                </div>

                {/* ADD TO CART - Inside scroll for mobile flow */}
                <button
                  onClick={() => onAddToCart?.(product)}
                  className="w-full bg-gray-900 hover:bg-black text-white h-16 rounded-2xl font-black flex items-center justify-center gap-3 transition-all active:scale-95 shadow-2xl shadow-gray-200 mb-10 shrink-0"
                >
                  <ShoppingCart size={22} />
                  BUY NOW — {formattedPrice}
                </button>

                {/* TRUST FOOTER */}
                <div className="flex items-center justify-center gap-6 pb-10 opacity-40">
                  <div className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest"><ShieldCheck size={14}/> Secure</div>
                  <div className="flex items-center gap-2 font-bold text-[9px] uppercase tracking-widest"><Truck size={14}/> Shipping</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};