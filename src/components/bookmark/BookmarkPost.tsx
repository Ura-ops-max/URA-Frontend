// components/bookmarks/BookmarkedPosts.tsx
import SocialPostCard from '../feed/SocialPostCard';
import ProductPostCard from '../feed/ProductPostCard';
import { useBookmarkedItems } from '@/hooks/api/use-bookmark';
import { Loader2, BookmarkX } from 'lucide-react';

export default function BookmarkedPosts() {
  const { data: posts, isLoading } = useBookmarkedItems('Post');

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="animate-spin text-orange-500" />
      </div>
    );

  if (!posts || posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border border-dashed border-gray-200">
        <BookmarkX className="w-12 h-12 text-gray-300 mb-4" />
        <p className="text-gray-500 font-bold">No posts saved yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post: any) =>
        /* Cards stay the same, the container now splits them into two columns on desktop */
        post?.type === 'PRODUCT' ? (
          <ProductPostCard key={post._id} post={post} />
        ) : (
          <SocialPostCard key={post._id} post={post} />
        ),
      )}
    </div>
  );
}
