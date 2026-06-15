import { useState } from 'react';
import { CheckCircle2, Flag, Trash2, BellOff, Link2, UserPlus, Loader2, Edit2 } from 'lucide-react';
import type { CardProps, SocialPostType } from '@/types/feed.types';
import { MediaCarousel } from './MediaCarousel';
import { PostActions } from './PostAction';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { Link } from 'react-router-dom';
import { formatTimeAgo } from '@/utils/date-format';
import { PostMenu } from './PostMenu';
import { toast } from 'sonner';
import { useAuthContext } from '@/context/auth-provider';
import { AuthPromptModal } from '../shared/AuthPromptModel';
import { useDeletePost } from '@/hooks/api/use-feed';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EditItemModal } from './EditItemModal';

export default function SocialPostCard({ post, onRequireAuth }: CardProps<SocialPostType>) {
  const { user, isAuthenticated } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const isOwner = post.authorId === user?._id;
  const deletePostMutation = useDeletePost(post._id, 'social');
  const [showEditModal, setShowEditModal] = useState(false);

  // 1. AUTH MODAL STATE (Matches ProductPostCard)
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authConfig, setAuthConfig] = useState({ title: '', subtitle: '', action: '' });

  const ensureAuth = (type: 'menu' | 'follow') => {
    if (isAuthenticated) return true;

    const configs = {
      menu: {
        title: 'More Options',
        subtitle: 'Sign in to follow users, mute notifications, or report content.',
        action: 'access menu',
      },
      follow: {
        title: 'Follow this creator?',
        subtitle: 'Sign in to see more updates from David in your home feed.',
        action: 'follow',
      },
    };

    setAuthConfig(configs[type]);
    setShowAuthModal(true);
    return false;
  };

  const handleDelete = () => {
    if (deletePostMutation.isPending) return;
    deletePostMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteConfirm(false);
      },
      onError: () => {
        // Error is already handled by the mutation hook (toast)
        setShowDeleteConfirm(false);
      },
    });
  };

  const menuActions = [
    {
      label: 'Copy Link',
      icon: Link2,
      show: true,
      onClick: () => {
        navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
        toast.success('Link copied!');
      },
    },
    {
      label: isOwner ? 'Mute Notifications' : 'Follow User',
      icon: isOwner ? BellOff : UserPlus,
      show: true,
      onClick: () => (isOwner ? console.log('Muted') : ensureAuth('follow')),
    },
    {
      label: 'Report Post',
      icon: Flag,
      variant: 'danger' as const,
      show: !isOwner,
      onClick: () => console.log('Reported'),
    },
    {
      label: 'Edit Post',
      icon: Edit2, // import { Edit2 } from "lucide-react"
      show: isOwner,
      onClick: () => setShowEditModal(true),
    },
    {
      label: 'Delete Post',
      icon: Trash2,
      variant: 'danger' as const,
      show: isOwner,
      onClick: () => {
        if (!isOwner) return;
        setShowDeleteConfirm(true);
      },
    },
  ];

  const handleMenuIntercept = (e: React.MouseEvent) => {
    if (!isAuthenticated) {
      e.preventDefault();
      e.stopPropagation();
      ensureAuth('menu');
    }
  };

  const TEXT_LIMIT = 120; // Matched to ProductPostCard
  const shouldShowReadMore = post.caption.length > TEXT_LIMIT;
  const displayText = isExpanded ? post.caption : post.caption.slice(0, TEXT_LIMIT) + '...';
  const user_image = post.displayAvatar || generateAvatarUrl(post.displayName);

  return (
    <div className="bg-white border-b border-gray-100 lg:rounded-[2rem] lg:border lg:mb-10 lg:shadow-xl overflow-hidden animate-fadeIn transition-transform duration-300">
      {/* 1. TOP HEADER & CAPTION SECTION (Identical to ProductPostCard) */}
      <div className="p-4 lg:p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img
              src={user_image}
              className="w-12 h-12 rounded-full object-cover border-2 border-orange-100 p-0.5"
              alt={post.displayName}
            />
            <div>
              <Link
                to={`/dashboard/profile/user/${post.authorId}`}
                className="flex items-center gap-1 group"
              >
                <h3 className="font-black text-gray-900 text-[16px] group-hover:text-orange-600 transition-colors">
                  {post.displayName}
                </h3>
                {post.isVerified && <CheckCircle2 size={14} className="fill-blue-500 text-white" />}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 tracking-tight">
                  @{post.username}
                </span>
                <span className="text-[12px] text-gray-300">•</span>
                <span className="text-[10px] font-medium text-gray-400 lowercase italic">
                  {formatTimeAgo(post.createdAt)}
                </span>
              </div>
            </div>
          </div>

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

        {/* TAGS SECTION */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {post.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[13px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 2. MEDIA CAROUSEL (Identical Isolation logic) */}
      {post.media && post.media.length > 0 && (
        <div className="px-0 lg:px-4">
          <div className="lg:rounded-2xl overflow-hidden relative shadow-inner isolate">
            <MediaCarousel media={post.media} />
          </div>
        </div>
      )}

      {/* 3. SPACING ADAPTER (Since there's no Buy Now row, we add a divider or padding) */}
      <div className="h-2" />

      {/* 4. SOCIAL ACTIONS (Identical) */}
      <PostActions
        postId={post._id}
        user_image={user_image}
        isAuthenticated={isAuthenticated}
        onRequireAuth={onRequireAuth}
        initialLikes={post.likesCount || 0}
        initialComments={post.commentsCount || 0}
        isLiked={post.isLiked}
        isBookmarked={post.isBookmarked}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deletePostMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditItemModal
        key={post._id + (post.media?.join(',') || '')}
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        item={{
          _id: post._id,
          type: 'POST',
          caption: post.caption,
          tags: post.tags || [],
          media: post.media || [],
        }}
      />

      {/* AUTH MODAL INSTANCE */}
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
