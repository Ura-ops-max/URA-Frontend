import { useEffect, useState } from 'react';
import {
  Pencil,
  UserPlus,
  MessageCircle,
  Briefcase,
  Share2,
  Bookmark,
  UserCheck,
  // PlusCircle, // unused — Insights/Tools action commented out
  User,
  Settings,
  // BarChart3, // unused — Insights/Tools action commented out
  Star,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import type { UserType, BusinessType } from '@/types/api.types';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useProfileActions } from '@/hooks/api/use-user-profile';
import { UnfollowDialog } from './UnfollowDialog';
import { useToggleBookmark } from '@/hooks/api/use-feed';
import { BusinessContactInfo } from './BusinessContactInfo';
import { chatAPI } from '@/lib/chat-api';
import { useAuthContext } from '@/context/auth-provider';

type Props = {
  user: UserType;
  business: BusinessType | null;
  related: any;
  isMe: boolean;
};

const ProfileInfo: React.FC<Props> = ({ user, business, related, isMe }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user: Me } = useAuthContext();

  const isBusinessRoute = location.pathname.includes('/business/');
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const isSaved = related?.isBookmarked;
  // const isFollowing = related?.isFollowing;
  const displayName = (isBusinessRoute ? business?.businessName : user?.firstName) || 'User';
  const targetId = isBusinessRoute ? business?._id : user._id;

  const [localIsSaved, setLocalIsSaved] = useState(isSaved);

  const [localFollowerCount, setLocalFollowerCount] = useState(related?.counts?.followers || 0);
  const [localIsFollowing, setLocalIsFollowing] = useState(related?.isFollowing);
  // const { follow } = useProfileActions(targetId!, isBusinessRoute);

  // 2. Sync local state if the 'related' prop updates (e.g., after a fresh fetch)
  useEffect(() => {
    setLocalIsSaved(related?.isBookmarked);
    setLocalIsFollowing(related?.isFollowing);
    setLocalFollowerCount(related?.counts?.followers || 0);
  }, [related]);

  // const profileKey = ["profile", isBusinessRoute ? business?._id : user.username];

  // 3. Handle Bookmark Toggle
  const { mutate: toggleBookmarkRequest } = useToggleBookmark(targetId!, 'Business');

  const handleBookmarkToggle = () => {
    // Instant UI Change
    setLocalIsSaved(!localIsSaved);

    // Fire API request in background
    toggleBookmarkRequest();
  };

  // 4. Handle Follow Toggle
  const { follow: followRequest } = useProfileActions(targetId!, isBusinessRoute);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (localIsFollowing) {
      setShowUnfollowDialog(true);
    } else {
      // Instant UI Change
      setLocalIsFollowing(true);
      setLocalFollowerCount((prev: number) => prev + 1);
      followRequest();
    }
  };

  const confirmUnfollow = () => {
    // Instant UI Change
    setLocalIsFollowing(false);
    setLocalFollowerCount((prev: number) => Math.max(0, prev - 1));
    followRequest();
    setShowUnfollowDialog(false);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: displayName,
          text: `Check out ${displayName} on our platform!`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (err) {
      console.log('Error sharing', err);
    }
  };
  const handleStartChat = async () => {
    if (!targetId || !Me?._id) return;
    // Prepare the payload to match your backend's req.body
    const payload = {
      senderId: Me?._id ?? '',
      senderModel: 'User',
      receiverId: targetId,
      receiverModel: (isBusinessRoute ? 'Business' : 'User') as 'User' | 'Business',
    } as any;

    try {
      const { data } = await chatAPI.accessConversation(payload);
      navigate(`/dashboard/chat/${data.data._id}`);
    } catch (err) {
      console.error('Error starting chat:', err);
    }
  };

  // const handleFollow = (e: React.MouseEvent) => {
  //   e.preventDefault();
  //   if (isFollowing) {
  //     // If already following, show confirmation before unfollowing
  //     setShowUnfollowDialog(true);
  //   } else {
  //     // If not following, just follow immediately
  //     follow();
  //   }
  // };
  // Button Styles
  const btnBase = 'flex items-center justify-center transition-all duration-200';
  const btnAction = 'flex-col py-4 px-1 h-auto text-[11px] gap-2 rounded-[22px] font-bold border';

  const title =
    isBusinessRoute && business ? business.businessName : `${user.firstName} ${user.lastName}`;
  const subTitle = isBusinessRoute && business ? '' : `@${user.username}`;
  const bio = isBusinessRoute && business ? business.about : (user as any).bio;

  return (
    <div className="flex flex-col gap-6 p-5">
      {/* Identity Section */}
      <div>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h2>

          {/* RATING SECTION (Only for Business) */}
          {isBusinessRoute && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => {
                  // Logic: If rating is 3.5, stars 1, 2, 3 are filled.
                  // We'll use business.related.rating once available.
                  const ratingValue = business?.averageRating || 0;
                  return (
                    <Star
                      key={star}
                      size={14}
                      className={cn(
                        'transition-colors',
                        star <= Math.round(ratingValue)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-200',
                      )}
                    />
                  );
                })}
              </div>
              <span className="text-xs font-bold text-gray-500">
                ({business?.totalReviews || 'No ratings'})
              </span>
            </div>
          )}
        </div>

        <p className="text-orange-600 font-bold text-sm mt-1">{subTitle}</p>

        <p className="mt-4 text-gray-500 leading-relaxed text-sm">
          {bio || 'No bio description yet.'}
        </p>
      </div>

      {/* Stats Table */}
      <div className="flex justify-between items-center py-4 border-y border-gray-100 mt-2">
        {/* Always show Followers */}
        {/* <StatBlock label="Followers" value={related?.counts?.followers || 0} /> */}
        {/* Updated StatBlock to use localFollowerCount */}
        <StatBlock label="Followers" value={localFollowerCount} />
        <div className="w-[1px] h-6 bg-gray-100" />
        {/* CONDITIONAL BLOCK: Show Products for Business, otherwise show Following */}
        {isBusinessRoute ? (
          <>
            <StatBlock label="Posts" value={related?.counts?.posts || 0} />
            <div className="w-[1px] h-6 bg-gray-100" />
            <StatBlock label="Products" value={related?.counts?.products || 0} />
          </>
        ) : (
          <>
            <StatBlock label="Following" value={related?.counts?.following || 0} />
            <div className="w-[1px] h-6 bg-gray-100" />
            <StatBlock label="Posts" value={related?.counts?.posts || 0} />
          </>
        )}
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-3 gap-3 mt-2">
        {isMe ? (
          <>
            {/* 1. PRIMARY ACTION: EDIT (Personal) or MANAGE (Business) */}
            {isBusinessRoute ? (
              <Link
                to="/dashboard/settings/profile?page=business"
                className={cn(
                  btnBase,
                  btnAction,
                  'bg-orange-500 text-white shadow-lg shadow-orange-100 hover:bg-orange-600',
                )}
              >
                <Settings size={20} strokeWidth={2.5} />
                <span>Manage</span>
              </Link>
            ) : (
              <Link
                to="/dashboard/settings/profile?page=profile"
                className={cn(
                  btnBase,
                  btnAction,
                  'bg-orange-500 text-white shadow-lg shadow-orange-100 hover:bg-orange-600',
                )}
              >
                <Pencil size={20} strokeWidth={2.5} />
                <span>Edit</span>
              </Link>
            )}

            {/* 2. SECONDARY ACTION: TOOLS (Personal) or ANALYTICS/INSIGHTS (Business) */}
            {/* Insights/Tools action hidden per request
            <Link
              to={isBusinessRoute ? '/dashboard/business/insights' : '/dashboard/settings'}
              className={cn(
                btnBase,
                btnAction,
                'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              )}
            >
              {isBusinessRoute ? (
                <BarChart3 size={20} className="text-gray-400" />
              ) : (
                <PlusCircle size={20} className="text-gray-400" />
              )}
              <span>{isBusinessRoute ? 'Insights' : 'Tools'}</span>
            </Link>
            */}

            {/* 3. SHARE (Always present for owners) */}
            <button
              onClick={handleShare}
              className={cn(
                btnBase,
                btnAction,
                'bg-white text-gray-700 border-gray-200 hover:bg-gray-50',
              )}
            >
              <Share2 size={20} className="text-orange-500" strokeWidth={2.5} />
              <span>Share</span>
            </button>
          </>
        ) : (
          <>
            {/* VISITOR VIEW */}
            {/* 1. FOLLOW */}
            <button
              onClick={handleFollowClick}
              className={cn(
                btnBase,
                btnAction,
                localIsFollowing ? 'bg-gray-100 text-gray-800' : 'bg-orange-500 text-white',
              )}
            >
              {localIsFollowing ? <UserCheck size={20} /> : <UserPlus size={20} />}
              <span>{localIsFollowing ? 'Following' : 'Follow'}</span>
            </button>
            {/* 2. MESSAGE (Standard for everyone) */}
            <button
              onClick={handleStartChat}
              className={cn(btnBase, btnAction, 'bg-white text-gray-700 border-gray-200')}
            >
              <MessageCircle size={20} className="text-orange-500" />
              <span>Message</span>
            </button>

            {/* 3. CONTEXTUAL ACTION: SAVE (Business) or SHARE (User) */}
            {isBusinessRoute ? (
              <button
                onClick={handleBookmarkToggle}
                className={cn(
                  btnBase,
                  btnAction,
                  'bg-white text-gray-700 border-gray-200',
                  localIsSaved && 'bg-orange-50 border-orange-100',
                )}
              >
                <Bookmark
                  size={20}
                  className={localIsSaved ? 'fill-orange-500 text-orange-500' : 'text-gray-400'}
                />
                <span>{localIsSaved ? 'Saved' : 'Save'}</span>
              </button>
            ) : (
              <button
                onClick={handleShare}
                className={cn(btnBase, btnAction, 'bg-white text-gray-700 border-gray-200')}
              >
                <Share2 size={20} className="text-gray-400" />
                <span>Share</span>
              </button>
            )}
          </>
        )}
      </div>

      {/* Secondary Prompts */}
      <div className="flex flex-col gap-3 mt-4">
        {/* Link to Alternate Page - Personalized Labels */}
        {!isBusinessRoute && user.isBusinessOwner && business && (
          <Link
            to={`/dashboard/profile/business/${business._id}`}
            className="flex items-center justify-center gap-2 py-3.5 bg-gray-50 text-gray-700 rounded-2xl text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <Briefcase size={16} />
            {isMe ? 'View My Business Page' : 'View Business Page'}
          </Link>
        )}

        {isBusinessRoute && (
          <Link
            to={`/dashboard/profile/user/${user._id}`}
            className="flex items-center justify-center gap-2 py-3.5 bg-gray-50 text-gray-700 rounded-2xl text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-colors"
          >
            <User size={16} />
            {isMe ? 'View My Personal Profile' : 'View Owner Profile'}
          </Link>
        )}
      </div>

      {/* Contact Info (Only for Business) */}

      {isBusinessRoute && business && <BusinessContactInfo business={business} />}

      {/* Unfollow Confirmation */}
      <UnfollowDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={confirmUnfollow}
        displayName={displayName}
      />
    </div>
  );
};

const StatBlock = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center flex flex-col gap-0.5">
    <span className="text-lg font-black text-gray-900">{value.toLocaleString()}</span>
    <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest">{label}</span>
  </div>
);

// const InfoRow = ({ icon, text, link }: { icon: React.ReactNode; text: string; link?: string }) => (
//   <div className="flex items-center gap-3 text-[13px] text-gray-600 group">
//     <div className="text-orange-500 shrink-0 bg-orange-50 p-1.5 rounded-lg">{icon}</div>
//     {link ? (
//       <a href={link} target="_blank" rel="noreferrer" className="hover:text-orange-600 font-medium truncate underline decoration-orange-200 underline-offset-4 decoration-2">{text}</a>
//     ) : (
//       <span className="font-medium line-clamp-1">{text}</span>
//     )}
//   </div>
// );

export default ProfileInfo;
