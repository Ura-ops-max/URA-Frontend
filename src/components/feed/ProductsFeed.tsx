import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, RefreshCcw, PackageOpen, ArrowUp } from "lucide-react";
import {  useProductsFeed } from "@/hooks/api/use-feed"; // Reusing your specific author feed hook
import { useAuthContext } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProductCard } from "./ProductCard";
import { ProductDetailsModal } from "./ProductDetailsModal";
import type {  ProductType } from "@/types/feed.types";
import { useCartContext } from "@/context/cart-provider"; // Import the context hook


interface ProductsFeedProps {
  targetId?: string; // The Business ID
  onRequireAuth?: () => void;
  type?: string;
  category?: string;
}



export default function ProductsFeed({ targetId, onRequireAuth, type = "feed", category }: ProductsFeedProps) {

  const {isAuthenticated } = useAuthContext();
  const { addItem } = useCartContext(); // Pull the cart methods

  const isPostType = type === 'post'

  // Centralized Add to Cart Handler
  const handleAddToCart = async (product: ProductType) => {
    if (!isAuthenticated) {
      return onRequireAuth?.();
    }
    
    // We pass 1 as the default quantity from the feed
    await addItem(product._id, 1);
  };

  // 1. Fetch logic - strictly filtering for products by this specific business
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
    isRefetching,
  } = useProductsFeed(targetId!, isPostType); // Passing 'false' for isPostType to get products

  const [selectedProduct, setSelectedProduct] = useState<ProductType | null>(null);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref: bottomRef, inView: isBottomInView } = useInView();

  // Handle Scroll tracking for the floating button
  useEffect(() => {
    const container = document.getElementById("main-feed-container");
    const handleScroll = () => {
      if (container) setShowScrollTop(container.scrollTop > 400);
    };
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite Scroll Logic
  useEffect(() => {
    if (isBottomInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const scrollToTop = () => {
    const container = document.getElementById("main-feed-container");
    container?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (status === 'pending') {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2 text-orange-500" />
        <p className="text-sm font-medium italic">Loading store...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-10 bg-red-50 rounded-[32px] border border-red-100">
        <p className="text-red-500 font-medium mb-3">Failed to load products.</p>
        <Button onClick={() => refetch()} variant="outline" className="bg-white border-red-200 text-red-600">
          <RefreshCcw size={14} className="mr-2" /> Refresh Store
        </Button>
      </div>
    );
  }


  // TO THIS (Adding the explicit Type Cast):
  const allProducts = data?.pages.flatMap((page) => page as ProductType[]) || [];
  // We filter the existing data based on the category prop
  const filteredProducts = category && category !== 'All'
    ? allProducts.filter((product) => product.category === category)
    : allProducts;

if (filteredProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed rounded-[32px] border-gray-100">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <PackageOpen className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-900">
            {category && category !== 'All' ? `No ${category} items` : "No products yet"}
        </h3>
        <p className="text-gray-400 text-xs max-w-[220px]">
           Try selecting a different category or check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6 px-1">
      {/* Syncing State indicator */}
      {isRefetching && !isFetchingNextPage && (
        <div className="flex justify-center sticky top-2 z-10">
          <div className="bg-gray-900/90 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-[10px] font-black flex items-center gap-2 shadow-xl">
            <RefreshCcw size={10} className="animate-spin" /> UPDATING STORE
          </div>
        </div>
      )}

      {/* PRODUCT GRID - Optimized for e-commerce */}
      {/* PRODUCT GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
        {filteredProducts.map((product: ProductType) => ( // Add explicit type here
          <ProductCard
            key={product._id}
            product={product}
            isAuthenticated={isAuthenticated}
            onRequireAuth={onRequireAuth}
            onViewDetails={(p) => setSelectedProduct(p)} // 'p' will now be ProductPostType
            onAddToCart={handleAddToCart}
          />
        ))}

        {/* The Modal remains the same */}
        <ProductDetailsModal
          isOpen={!!selectedProduct}
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          isAuthenticated={isAuthenticated}
          onRequireAuth={onRequireAuth}
          onAddToCart={(product: ProductType) => {
            handleAddToCart(product);
            setSelectedProduct(null);
          }}
        />
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={bottomRef} className="py-10 text-center">
        {isFetchingNextPage ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
        ) : !hasNextPage ? (
          <div className="pt-6 border-t border-gray-100">
            <p className="text-gray-300 text-[10px] font-bold tracking-widest uppercase">
              End of Catalog
            </p>
          </div>
        ) : null}
      </div>

      {/* Floating Scroll Top */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-10 right-10 p-4 bg-orange-600 text-white rounded-full shadow-2xl transition-all duration-500 z-50 hover:scale-110 active:scale-90",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <ArrowUp size={20} strokeWidth={3} />
      </button>
    </div>
  );
}