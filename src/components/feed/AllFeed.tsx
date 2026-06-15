// src/components/feed/AllFeed.tsx
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { Loader2, RefreshCcw, PlusCircle, ArrowUp } from 'lucide-react';
import { useInfiniteFeed } from '@/hooks/api/use-feed';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import SocialPostCard from './SocialPostCard';
import ProductPostCard from './ProductPostCard';
import { Link } from 'react-router-dom';

interface AllFeedProps {
  userId?: string;
  onRequireAuth?: () => void;
  onCreatePostClick?: () => void;
}

export default function AllFeed({ userId, onRequireAuth, onCreatePostClick }: AllFeedProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    status, // 'pending' | 'error' | 'success'
    refetch,
    isRefetching,
  } = useInfiniteFeed(userId);

  const [showScrollTop, setShowScrollTop] = useState(false);
  const { ref: bottomRef, inView: isBottomInView } = useInView();

  // 1. Scroll-to-Top Visibility
  // Update your useEffect inside AllFeed.tsx
  useEffect(() => {
    const container = document.getElementById('main-feed-container');

    const handleScroll = () => {
      if (container) {
        setShowScrollTop(container.scrollTop > 400);
      }
    };

    if (container) {
      container.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // 2. Infinite Scroll trigger
  useEffect(() => {
    if (isBottomInView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isBottomInView, hasNextPage, fetchNextPage, isFetchingNextPage]);

  const scrollToTop = () => {
    const container = document.getElementById('main-feed-container');
    if (container && container.scrollHeight > window.innerHeight) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 3. Status Handling
  if (status === 'pending' && !isRefetching) {
    return (
      <div className="flex flex-col items-center py-20 text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <p className="text-sm font-medium">Curating your feed...</p>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="text-center py-10 bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-500 font-medium mb-3">Couldn't load your feed.</p>
        <Button
          onClick={() => refetch()}
          variant="outline"
          className="flex items-center gap-2 mx-auto bg-white"
        >
          <RefreshCcw size={14} /> Try Again
        </Button>
      </div>
    );
  }

  const allPosts = data?.pages.flatMap((page) => page) || [];

  // 4. Empty State
  if (allPosts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white border border-dashed rounded-2xl border-gray-200">
        <div className="bg-orange-50 p-4 rounded-full mb-4">
          <PlusCircle className="w-8 h-8 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">No posts yet</h3>
        <p className="text-gray-500 max-w-[250px] mb-6">
          {userId
            ? "This user hasn't shared anything yet."
            : 'Your network is quiet. Why not start the conversation?'}
        </p>
        <Link to="/dashboard/post/create?type=post">
          <Button
            onClick={onCreatePostClick}
            className="bg-orange-600 hover:bg-orange-700 text-white rounded-full px-8"
          >
            Create your first post
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      id="main-feed-container"
      className="relative h-[calc(100vh-180px)] overflow-y-auto overflow-x-hidden pb-10 scrollbar-base scrollbar-main lg:px-4 scroll-smooth"
    >
      <div className="grid gap-6 mx-auto max-w-full">
        {/* Updating Indicator */}
        {/* {isRefetching && !isFetchingNextPage && (
        <div className="flex justify-center py-2 sticky top-0 z-10 animate-bounce">
          <div className="bg-orange-500 text-white px-4 py-1 rounded-full text-xs flex items-center gap-2 shadow-lg">
            <RefreshCcw size={12} className="animate-spin" /> Updating Feed...
          </div>
        </div>
      )} */}

        {/* Feed List */}
        <div className="grid gap-6">
          {allPosts.map((post) =>
            post?.type === 'PRODUCT' ? (
              <ProductPostCard key={post._id} post={post} onRequireAuth={onRequireAuth} />
            ) : (
              <SocialPostCard key={post._id} post={post} onRequireAuth={onRequireAuth} />
            ),
          )}
        </div>
        {/* Load More / Footer */}
        <div ref={bottomRef} className="py-10 text-center">
          {isFetchingNextPage ? (
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
          ) : !hasNextPage ? (
            <div className="space-y-4 pt-4 border-t border-dashed border-gray-200">
              <p className="text-gray-400 text-sm italic font-light">
                You've caught up with everything!
              </p>
              <Button
                variant="ghost"
                onClick={scrollToTop}
                className="text-orange-600 hover:text-orange-700 gap-2"
              >
                <ArrowUp size={16} /> Back to Top
              </Button>
            </div>
          ) : null}
        </div>

        {/* Floating Scroll Top */}
        <button
          onClick={scrollToTop}
          className={cn(
            'fixed bottom-24 right-6 p-3 bg-orange-600 text-white rounded-full shadow-2xl transition-all duration-300 transform z-50 hover:scale-110 active:scale-95',
            showScrollTop
              ? 'translate-y-0 opacity-100'
              : 'translate-y-20 opacity-0 pointer-events-none',
          )}
        >
          <ArrowUp size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
}
