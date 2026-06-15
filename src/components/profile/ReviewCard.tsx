import React, { useState } from 'react';
import { ThumbsUp, ThumbsDown, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/auth-provider';

interface ReviewCardProps {
  review: any;
  onLike: () => void;
  onDislike: () => void;
  onEdit: (review: any) => void;
  onDelete: (id: string) => void;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review, onLike, onDislike, onEdit, onDelete }) => {
  const { user: currentUser } = useAuthContext();
  const [showMenu, setShowMenu] = useState(false);

  const reviewer = review.user;
  const isOwner = currentUser?._id === reviewer?._id || currentUser?._id === reviewer?._id;

  // Check if current user has liked/disliked
  const hasLiked = review.likes?.includes(currentUser?._id || currentUser?._id);
  const hasDisliked = review.dislikes?.includes(currentUser?._id || currentUser?._id);

  const avatar =
    reviewer?.profilePicture ||
    `https://ui-avatars.com/api/?name=${reviewer?.firstName}+${reviewer?.lastName}&background=random`;

  return (
    <div className="p-6 hover:bg-gray-50/30 transition-colors relative group">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <img
            src={avatar}
            alt={reviewer?.firstName}
            className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="flex-grow">
            <p className="font-bold text-gray-900 text-sm leading-none">
              {reviewer?.firstName} {reviewer?.lastName}
            </p>
            <div className="flex items-center text-[11px] font-bold text-gray-400 mt-1.5 uppercase tracking-tighter">
              <div className="flex mr-2 text-orange-500">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <span key={i}>{i < review.rating ? '★' : '☆'}</span>
                  ))}
              </div>
              <span>{formatDistanceToNow(new Date(review.createdAt))} ago</span>
            </div>
          </div>
        </div>

        {/* 3-Dot Menu for Owner */}
        {isOwner && (
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-20 py-1 overflow-hidden">
                  <button
                    onClick={() => {
                      onEdit(review);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      onDelete(review._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-xs font-bold text-red-500 hover:bg-red-50 flex items-center gap-2"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-600 mb-5 text-sm leading-relaxed font-medium">{review.comment}</p>

      <div className="flex space-x-6 text-[11px] font-black uppercase tracking-widest">
        <button
          onClick={onLike}
          className={cn(
            'flex items-center space-x-2 transition-all active:scale-90',
            hasLiked ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <ThumbsUp size={16} fill={hasLiked ? 'currentColor' : 'none'} />
          <span>{review.likes?.length || 0}</span>
        </button>

        <button
          onClick={onDislike}
          className={cn(
            'flex items-center space-x-2 transition-all active:scale-90',
            hasDisliked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600',
          )}
        >
          <ThumbsDown size={16} fill={hasDisliked ? 'currentColor' : 'none'} />
          <span>{review.dislikes?.length || 0}</span>
        </button>
      </div>
    </div>
  );
};

export default ReviewCard;
