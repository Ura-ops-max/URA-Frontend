// src/components/feed/CommentDrawer.tsx
import { useState } from 'react';
import { Drawer } from 'vaul';
import { X, Heart, Send, Smile } from 'lucide-react';
import * as VisuallyHidden from '@radix-ui/react-visually-hidden';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import API from '@/lib/axios-client';
import type { CommentData } from '@/types/api.types';
import { generateAvatarUrl } from '@/utils/avatar-generator';

export const CommentDrawer = ({ postId, user_image, isOpen, onClose }: any) => {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<CommentData | null>(null);

  // New state to track which comment threads are open
  const [expandedComments, setExpandedComments] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setReplyingTo(null);
      onClose();
    }
  };

  // Helper for your specific avatar requirement
  const getAvatar = (author: any) => {
    const avatarUrl = author.profilePicture || author.businessLogo;
    if (avatarUrl) return avatarUrl;

    // Fallback using your generateAvatart function
    const name = author.businessName || `${author.firstName} ${author.lastName}`;
    return generateAvatarUrl(name);
  };

  // Toggle function for replies
  const toggleReplies = (commentId: string) => {
    setExpandedComments((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  // 1. Fetch Comments
  const { data: comments, isLoading } = useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const res = await API.get(`/posts/${postId}/comments`);
      return res.data.comments as CommentData[];
    },
    // FIXED: Ensured strictly boolean to prevent TanStack Query v5 crash
    enabled: !!isOpen && !!postId,
  });

  // 2. Post Comment Mutation
  const { mutate: submitComment, isPending } = useMutation({
    mutationFn: async (newComment: any) => {
      return API.post(`/posts/${postId}/comments`, newComment);
    },
    onSuccess: () => {
      // 1. Refresh the comments inside this drawer
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });

      // 2. Refresh the main feeds so the comment count updates on the PostCard
      queryClient.invalidateQueries({ queryKey: ['posts-feed'] });
      queryClient.invalidateQueries({ queryKey: ['products-feed'] });

      // 3. Optional: If you want to be extra precise and avoid a full feed flash:
      // queryClient.invalidateQueries({ queryKey: ['posts-feed', 'me'] });

      setCommentText('');
      setReplyingTo(null);
    },
  });

  // 3. Toggle Like Mutation
  const { mutate: toggleLike } = useMutation({
    mutationFn: async (commentId: string) => {
      return API.post(`/posts/comments/${commentId}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
    },
  });

  const handleSend = () => {
    if (!commentText.trim()) return;
    submitComment({
      content: commentText,
      postId,
      // FIXED: Using ._id from the replyingTo object
      parentId: replyingTo?._id || null,
    });
  };

  return (
    <Drawer.Root open={isOpen} onOpenChange={handleOpenChange} direction="bottom">
      <Drawer.Portal>
        <Drawer.Overlay
          className="fixed inset-0 bg-black/40 z-[60] cursor-pointer"
          onClick={onClose}
        />
        <Drawer.Content className="fixed z-[70] bg-white flex flex-col outline-none bottom-0 left-0 right-0 h-[85vh] rounded-t-[32px] lg:top-0 lg:right-0 lg:left-auto lg:h-screen lg:w-[450px] lg:rounded-none">
          <VisuallyHidden.Root>
            <Drawer.Title>Post Comments</Drawer.Title>
            <Drawer.Description>Discussion and replies for this post</Drawer.Description>
          </VisuallyHidden.Root>

          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-gray-200 my-4 lg:hidden" />

          {/* HEADER - Updated Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
            <h2 className="text-xl font-bold tracking-tight">Comments</h2>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onClose(); // This now explicitly calls your parent's close function
              }}
              className="relative p-2 hover:bg-gray-100 rounded-full transition-all active:scale-90 z-[80]"
              aria-label="Close comments"
            >
              <X size={24} className="text-gray-500" />
            </button>
          </div>

          {/* COMMENTS LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar bg-white">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-40">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
                <p className="text-gray-400 text-sm">Loading discussion...</p>
              </div>
            ) : (
              comments?.map((comment: any) => (
                <div key={comment._id} className="relative">
                  {/* PARENT COMMENT */}
                  <div className="flex gap-3">
                    <img
                      src={getAvatar(comment.author)}
                      className="w-10 h-10 rounded-full border border-gray-100 shrink-0 object-cover"
                      alt=""
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <div className="bg-gray-50 rounded-2xl rounded-tl-none px-4 py-2 inline-block max-w-[90%]">
                          <span className="font-bold text-[13px] block text-gray-900">
                            {comment.authorType === 'Business'
                              ? comment.author.businessName
                              : `${comment.author.firstName} ${comment.author.lastName}`}
                          </span>
                          <p className="text-[14px] text-gray-700 leading-normal">
                            {comment.content}
                          </p>
                        </div>
                        <button
                          onClick={() => toggleLike(comment._id)}
                          className="flex flex-col items-center gap-0.5 mt-1 shrink-0"
                        >
                          <Heart
                            size={18}
                            className={`transition-all ${comment.isLiked ? 'text-red-500 fill-red-500 scale-110' : 'text-gray-300 hover:text-gray-400'}`}
                          />
                          <span className="text-[10px] text-gray-500 font-medium">
                            {comment.likesCount || 0}
                          </span>
                        </button>
                      </div>

                      {/* ACTION ROW */}
                      <div className="flex items-center gap-4 mt-2 ml-1 text-[12px] font-semibold text-gray-400">
                        <span>
                          {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                        </span>
                        <button
                          onClick={() => setReplyingTo(comment)}
                          className="hover:text-orange-600 transition-colors uppercase tracking-tight"
                        >
                          Reply
                        </button>
                      </div>

                      {/* VIEW REPLIES TOGGLE */}
                      {comment.repliesCount > 0 && (
                        <button
                          onClick={() => toggleReplies(comment._id)}
                          className="flex items-center gap-3 mt-4 text-[12px] font-bold text-gray-500 hover:text-orange-500 transition-colors"
                        >
                          <div className="w-10 h-[1px] bg-gray-200" />
                          <span>
                            {expandedComments[comment._id]
                              ? 'Hide replies'
                              : `View ${comment.repliesCount} ${comment.repliesCount === 1 ? 'reply' : 'replies'}`}
                          </span>
                        </button>
                      )}

                      {/* THREADED REPLIES AREA */}
                      {/* THREADED REPLIES AREA */}
                      {expandedComments[comment._id] && comment.replies?.length > 0 && (
                        <div className="mt-4 space-y-5 relative">
                          <div className="absolute left-[-1.25rem] top-[-1rem] bottom-4 w-[2px] bg-gray-100 rounded-full" />

                          {comment.replies.map((reply: any) => (
                            <div
                              key={reply._id}
                              className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300"
                            >
                              <img
                                src={getAvatar(reply.author)}
                                className="w-7 h-7 rounded-full border border-gray-100 shrink-0 object-cover"
                                alt=""
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                  <div className="bg-orange-50/50 border border-orange-100/50 rounded-2xl rounded-tl-none px-3 py-1.5 inline-block max-w-[85%]">
                                    <span className="font-bold text-[12px] block text-gray-900">
                                      {reply.author.firstName} {reply.author.lastName}
                                    </span>
                                    <p className="text-[13px] text-gray-700 leading-snug">
                                      {reply.content}
                                    </p>
                                  </div>

                                  {/* ADDED: Like Button for Replies */}
                                  <button
                                    onClick={() => toggleLike(reply._id)}
                                    className="flex flex-col items-center shrink-0 mt-1"
                                  >
                                    <Heart
                                      size={14}
                                      className={`transition-colors ${reply.isLiked ? 'text-red-500 fill-red-500' : 'text-gray-300 hover:text-red-400'}`}
                                    />
                                    <span className="text-[9px] text-gray-500 font-bold">
                                      {reply.likesCount || 0}
                                    </span>
                                  </button>
                                </div>

                                <div className="flex items-center gap-3 mt-1.5 ml-1 text-[11px] font-medium text-gray-400">
                                  <span>
                                    {formatDistanceToNow(new Date(reply.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </span>
                                  <button
                                    onClick={() => setReplyingTo(comment)}
                                    className="hover:text-orange-600 uppercase font-bold"
                                  >
                                    Reply
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* INPUT AREA */}
          <div className="p-4 sm:p-5 border-t bg-white pb-10 lg:pb-5">
            {replyingTo && (
              <div className="flex items-center justify-between bg-orange-50 px-4 py-2 rounded-t-xl border-x border-t border-orange-100">
                <p className="text-[12px] text-orange-700">
                  Replying to{' '}
                  <span className="font-bold">
                    @{replyingTo.author.businessName || replyingTo.author.firstName}
                  </span>
                </p>
                <button onClick={() => setReplyingTo(null)}>
                  <X size={14} className="text-orange-700" />
                </button>
              </div>
            )}

            <div
              className={`flex items-center gap-2 sm:gap-3 bg-gray-50 border border-gray-100 p-2 px-3 sm:px-4 transition-all
              ${replyingTo ? 'rounded-b-2xl border-t-0' : 'rounded-2xl'}
              focus-within:bg-white focus-within:border-orange-500`}
            >
              <img
                src={user_image || '/images/default-avatar.png'}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border shrink-0 object-cover"
                alt="user"
              />

              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
                className="flex-1 min-w-0 bg-transparent border-none outline-none text-[13px] sm:text-[14px] h-10"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />

              <div className="flex items-center gap-1 sm:gap-2 border-l pl-2 sm:pl-3 shrink-0">
                <button type="button" className="p-1">
                  <Smile size={18} className="text-gray-400" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!commentText.trim() || isPending}
                  className="bg-orange-500 text-white p-2 sm:p-2.5 rounded-xl hover:bg-orange-600 disabled:opacity-50 shrink-0 flex items-center justify-center min-w-[36px] sm:min-w-[42px]"
                >
                  {isPending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
