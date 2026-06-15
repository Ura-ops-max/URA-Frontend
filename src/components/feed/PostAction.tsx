import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { CommentDrawer } from './CommentDrawer';
import { useToggleLike, useToggleBookmark } from '@/hooks/api/use-feed';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AuthPromptModal } from '@/components/shared/AuthPromptModel'; // Import the modal

interface PostActionsProps {
  postId: string;
  user_image: string;
  initialLikes?: number;
  initialComments?: number;
  isLiked?: boolean;
  isBookmarked?: boolean;
  onRequireAuth?: () => void;
  isAuthenticated: boolean;
}

export const PostActions = ({
  postId,
  user_image,
  initialLikes = 0,
  initialComments = 0,
  isLiked = false,
  isBookmarked = false,
  isAuthenticated,
}: PostActionsProps) => {
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localLikesCount, setLocalLikesCount] = useState(initialLikes);
  const [localIsBookmarked, setLocalIsBookmarked] = useState(isBookmarked);
  const [isCommentOpen, setIsCommentOpen] = useState(false);

  // Local state to control the auth popup
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalConfig, setAuthModalConfig] = useState({ title: '', subtitle: '', action: '' });

  const { mutate: toggleLike } = useToggleLike(postId, 'post');
  const { mutate: toggleBookmark } = useToggleBookmark(postId, 'Post');

  // Helper to trigger auth check
  const checkAuth = (action: 'like' | 'comment' | 'bookmark') => {
    if (!isAuthenticated) {
      const configs = {
        like: {
          title: 'Like this post?',
          subtitle: 'Sign in to show your appreciation for this product.',
          action: 'like',
        },
        comment: {
          title: 'Join the conversation',
          subtitle: 'Please log in to ask questions or leave a review.',
          action: 'comment',
        },
        bookmark: {
          title: 'Save for later',
          subtitle: 'Login to save this item to your personal collection.',
          action: 'bookmark',
        },
      };
      setAuthModalConfig(configs[action]);
      setShowAuthModal(true);
      return false;
    }
    return true;
  };

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkAuth('like')) return;

    const wasLiked = localIsLiked;
    setLocalIsLiked(!wasLiked);
    setLocalLikesCount((prev) => (wasLiked ? prev - 1 : prev + 1));

    toggleLike(undefined, {
      onError: () => {
        setLocalIsLiked(wasLiked);
        setLocalLikesCount((prev) => (wasLiked ? prev + 1 : prev - 1));
      },
    });
  };

  const handleCommentClick = () => {
    if (!checkAuth('comment')) return;
    setIsCommentOpen(true);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkAuth('bookmark')) return;

    const wasBookmarked = localIsBookmarked;
    setLocalIsBookmarked(!wasBookmarked);

    toggleBookmark(undefined, {
      onError: () => setLocalIsBookmarked(wasBookmarked),
    });
  };

  const handleShare = async () => {
    // Share remains PUBLIC - no auth check needed
    const shareData = {
      title: 'Check out this product!',
      url: `${window.location.origin}/posts/${postId}`,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(shareData.url);
        // Using a simple alert or toast if available
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
  };

  return (
    <div className="bg-white border-t border-gray-50">
      {/* Added 'lg:px-12' to pull buttons inward on desktop 
          Added 'max-w-screen-xl mx-auto' to prevent them from spreading too far on ultra-wide screens
      */}
      <div className="flex items-center justify-between px-4 lg:px-12 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-4 lg:gap-8">
          {/* Like Button with Hover Effect */}
          <button
            onClick={handleLike}
            className="flex items-center lg:gap-2 group outline-none transition-all"
          >
            <motion.div
              className={cn(
                'p-2 rounded-full transition-colors duration-200',
                localIsLiked ? 'bg-red-50' : 'group-hover:bg-gray-100',
              )}
              animate={{ scale: localIsLiked ? [1, 1.4, 1] : 1 }}
            >
              <Heart
                className={cn(
                  'w-6 h-6 transition-colors duration-200',
                  localIsLiked
                    ? 'fill-red-500 text-red-500'
                    : 'text-gray-600 group-hover:text-red-400',
                )}
              />
            </motion.div>
            <span
              className={cn(
                'text-xs font-black transition-colors',
                localIsLiked ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900',
              )}
            >
              {localLikesCount}
            </span>
          </button>

          {/* Comment Button with Hover Effect */}
          <button
            onClick={handleCommentClick}
            className="flex items-center lg:gap-2 group outline-none"
          >
            <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
              <MessageCircle className="w-6 h-6 text-gray-600 group-hover:text-blue-500 transition-colors" />
            </div>
            <span className="text-xs font-bold text-gray-600 group-hover:text-gray-900">
              {initialComments}
            </span>
          </button>

          {/* Share Button with Hover Effect */}
          <button onClick={handleShare} className="group outline-none">
            <div className="p-2 rounded-full group-hover:bg-orange-50 transition-colors">
              <Share2 className="w-6 h-6 text-gray-600 group-hover:text-orange-500 transition-colors" />
            </div>
          </button>
        </div>

        {/* Bookmark Button with Hover Effect */}
        <button onClick={handleBookmark} className="group outline-none">
          <motion.div
            className={cn(
              'p-2 rounded-full transition-colors',
              localIsBookmarked ? 'bg-orange-50' : 'group-hover:bg-gray-100',
            )}
            animate={{ scale: localIsBookmarked ? [1, 1.2, 1] : 1 }}
          >
            <Bookmark
              className={cn(
                'w-6 h-6 transition-colors duration-200',
                localIsBookmarked
                  ? 'fill-orange-500 text-orange-500'
                  : 'text-gray-600 group-hover:text-orange-400',
              )}
            />
          </motion.div>
        </button>
      </div>

      {/* Auth Modal Triggered by Actions */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        title={authModalConfig.title}
        subtitle={authModalConfig.subtitle}
        actionName={authModalConfig.action}
      />

      <CommentDrawer
        isOpen={isCommentOpen}
        onClose={setIsCommentOpen}
        postId={postId}
        user_image={user_image}
      />
    </div>
  );
};
