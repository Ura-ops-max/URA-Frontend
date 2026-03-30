import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Loader2, RefreshCcw, FileText, ArrowUp } from "lucide-react";
import { usePostsFeed } from "@/hooks/api/use-feed";
import { useAuthContext } from "@/context/auth-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import SocialPostCard from "./SocialPostCard";
import ProductPostCard from "./ProductPostCard";

interface PostsFeedProps {
  targetId?: string; // Passed from the Profile Page
  onRequireAuth?: () => void;
  type: string;
}

export default function PostsFeed({ targetId, onRequireAuth, type="feed" }: PostsFeedProps) {
  const { user: currentUser } = useAuthContext();

  // 1. Determine which ID to use: targetId from params OR the logged-in user's ID
  const effectiveUserId = targetId || currentUser?._id;
  const isPostType = type === 'post'
  // 2. Fetch only 'POST' type for this specific author
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status,
    refetch,
  } = usePostsFeed(effectiveUserId, isPostType);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref: bottomRef, inView: isBottomInView } = useInView();

  // Handle Internal Scroll for the "Back to Top" button
  useEffect(() => {
    const container = document.getElementById("main-feed-container");
    const handleScroll = () => {
      if (container) setShowScrollTop(container.scrollTop > 400);
    };
    if (container) container.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, []);

  // Infinite Scroll Trigger
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
        <p className="text-sm font-medium italic">Gathering posts...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-500 font-medium mb-3">Failed to load posts.</p>
        <Button onClick={() => refetch()} variant="outline" className="bg-white border-red-200 text-red-600">
          <RefreshCcw size={14} className="mr-2" /> Try Again
        </Button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page) || [];

  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white border border-dashed rounded-[32px] border-gray-100">
        <div className="bg-gray-50 p-4 rounded-full mb-3">
          <FileText className="w-8 h-8 text-gray-300" />
        </div>
        <h3 className="text-base font-bold text-gray-900">No posts yet</h3>
        <p className="text-gray-400 text-xs max-w-[200px]">
          {targetId === currentUser?._id
            ? "You haven't shared any posts yet."
            : "This user hasn't posted anything."}
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col gap-6">
      {/* Syncing State */}
      {/* {isRefetching && !isFetchingNextPage && (
        <div className="flex justify-center sticky top-0 z-10">
          <div className="bg-gray-900 text-white px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-2 shadow-lg">
            <RefreshCcw size={10} className="animate-spin" /> REFRESHING
          </div>
        </div>
      )} */}

      {/* Post List */}
      <div className="grid gap-6">
        {allPosts.map((post) => (
          post?.type === 'PRODUCT'
            ? <ProductPostCard key={post._id} post={post} onRequireAuth={onRequireAuth} />
            : <SocialPostCard key={post._id} post={post} onRequireAuth={onRequireAuth} />
        ))}
      </div>
      {/* Infinite Scroll Sentinel */}
      <div ref={bottomRef} className="py-10 text-center">
        {isFetchingNextPage ? (
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
        ) : !hasNextPage ? (
          <div className="pt-6 border-t border-gray-100">
            <p className="text-gray-300 text-[10px] font-bold tracking-widest uppercase">
              End of Gallery
            </p>
          </div>
        ) : null}
      </div>

      {/* Floating Scroll Top */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-10 right-10 p-4 bg-orange-600 text-white rounded-full shadow-2xl transition-all duration-500 z-50 hover:scale-110",
          showScrollTop ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0 pointer-events-none"
        )}
      >
        <ArrowUp size={20} strokeWidth={3} />
      </button>
    </div>
  );
}