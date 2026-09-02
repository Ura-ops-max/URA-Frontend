// src/components/feed/ProfileCard.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import type { UserType, RelatedData } from '@/types/api.types';

interface ProfileCardProps {
  user: UserType;
  related: RelatedData;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, related }) => {
  const FALLBACK_PROFILE_URL = generateAvatarUrl(`${user.firstName} ${user.lastName}`);

  return (
    <div className="rounded-[32px] bg-white/40 backdrop-blur-2xl p-3 border border-white/60 shadow-[0_10px_40px_rgba(0,0,0,0.03)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(255,107,53,0.08)] group">
      {/* Cover Section */}
      <div className="relative">
        <div className="relative h-24 w-full rounded-[24px] overflow-hidden bg-linear-to-br from-amber-400 to-orange-500">
          {user.coverPicture ? (
            <img
              src={user.coverPicture}
              alt="Cover"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full border-[16px] border-white/15" />
              <div className="absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-white/10 blur-2xl" />
            </div>
          )}
        </div>

        {/* Profile photo with soft glow */}
        <div className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-1/2">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF6B35]/20 blur-xl rounded-full animate-pulse" />
            <img
              src={user.profilePicture ?? FALLBACK_PROFILE_URL}
              className="relative h-20 w-20 rounded-full border-[5px] border-white shadow-xl object-cover"
            />
          </div>
        </div>
      </div>

      <div className="mt-12 text-center px-2 pb-2">
        <h2 className="font-bold text-[18px] text-gray-900 tracking-tight leading-tight">
          {user.firstName} {user.lastName}
        </h2>
        <p className="text-[13px] font-medium text-gray-400 mt-1">@{user.username}</p>

        {/* Stats Section: Using Brand Orange and Cream Tint */}
        <div className="mt-6 flex justify-between px-3 bg-[#F5F3F0]/60 backdrop-blur-md rounded-[22px] py-4 border border-white/40">
          {[
            { label: 'Posts', count: related.counts.posts, color: 'text-blue-500' },
            { label: 'Followers', count: related.counts.followers, color: 'text-[#FF6B35]' },
            { label: 'Following', count: related.counts.following, color: 'text-violet-500' },
          ].map((stat) => (
            <div key={stat.label} className="flex flex-col items-center">
              <p className={`font-black text-[16px] leading-none mb-1.5 ${stat.color}`}>
                {stat.count}
              </p>
              <span className="text-[9px] uppercase font-extrabold tracking-[0.15em] text-gray-400">
                {stat.label}
              </span>
            </div>
          ))}
        </div>

        {/* Primary Action: Brand Orange #FF6B35 */}
        <Button
          className="mt-6 bg-[#FF6B35] hover:bg-[#e85a20] text-white w-full rounded-[20px] h-12 text-sm font-bold shadow-[0_10px_25px_rgba(255,107,53,0.2)] transition-all active:scale-[0.96] cursor-pointer"
          asChild
        >
          <Link to={`/dashboard/profile/user/${user._id}`}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
};

export default ProfileCard;
