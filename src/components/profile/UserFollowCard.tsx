import { useProfileActions } from '@/hooks/api/use-user-profile';
import { cn } from '@/lib/utils';
import { Loader2, UserCheck, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../ui/button';
import { useState } from 'react';
import { UnfollowDialog } from './UnfollowDialog';
import { generateAvatarUrl } from '@/utils/avatar-generator';

export const UserFollowCard = ({ user, isMe }: { user: any; isMe: boolean }) => {
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const { follow, isFollowingLoading } = useProfileActions(user._id, user.isBusiness);

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (user.isFollowing) {
      // If already following, show confirmation before unfollowing
      setShowUnfollowDialog(true);
    } else {
      // If not following, just follow immediately
      follow();
    }
  };

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-sm transition-all group">
      <Link
        to={`/dashboard/profile/${user.isBusiness ? 'business' : 'user'}/${user._id}`}
        className="flex items-center gap-3 min-w-0"
      >
        <div className="w-12 h-12 rounded-full bg-orange-100 overflow-hidden shrink-0 border-2 border-white">
          <img
            src={user.profilePicture || generateAvatarUrl(`${user.firstName} ${user.lastName}`)}
            alt={user.firstName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-gray-900 truncate">
            {user.firstName} {user.lastName}
            {isMe && <span className="text-[10px] text-orange-500 font-medium ml-1">(You)</span>}
          </h4>
          <p className="text-xs text-gray-500 truncate">@{user.username}</p>
        </div>
      </Link>

      {!isMe && (
        <Button
          onClick={handleButtonClick}
          disabled={isFollowingLoading}
          variant={user.isFollowing ? 'secondary' : 'default'}
          size="sm"
          className={cn(
            'rounded-full px-4 h-9 text-xs font-bold transition-all',
            user.isFollowing
              ? 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
              : 'bg-orange-500 hover:bg-orange-600 text-white',
          )}
        >
          {isFollowingLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : user.isFollowing ? (
            <span className="flex items-center gap-1">
              <UserCheck size={14} /> Following
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <UserPlus size={14} /> Follow
            </span>
          )}
        </Button>
      )}

      <UnfollowDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={follow}
        displayName={user.firstName}
      />
    </div>
  );
};
