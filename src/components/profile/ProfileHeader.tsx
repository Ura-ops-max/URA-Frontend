// src/components/profile/ProfileHeader.tsx
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { BadgeCheck } from 'lucide-react';
import React from 'react';

type Props = {
  profile: any;
  isBusiness: boolean;
};

const ProfileHeader: React.FC<Props> = ({ profile, isBusiness = false }) => {
  const fallbackSeed = isBusiness
    ? profile.business?.businessName || 'Business'
    : `${profile.user.firstName} ${profile.user.lastName}`;

  const FALLBACK_PROFILE_URL = generateAvatarUrl(fallbackSeed);
  const cover = isBusiness ? profile.business?.businessCover : profile.user.coverPicture;
  const avatar = isBusiness
    ? (profile.business?.businessLogo ?? FALLBACK_PROFILE_URL)
    : (profile.user.profilePicture ?? FALLBACK_PROFILE_URL);
  const isVerified = isBusiness && (profile.business?.isVerified ?? false);

  return (
    <header className="bg-white rounded-3xl shadow-sm ring-1 ring-black/5 overflow-hidden">
      {/* Banner */}
      <div className="relative h-44 md:h-56">
        {cover ? (
          <img src={cover} alt="cover" className="w-full h-full object-cover" />
        ) : (
          // On-brand gradient when there's no cover image.
          <div className="h-full w-full bg-linear-to-br from-amber-400 to-orange-600">
            <div aria-hidden className="absolute inset-0 overflow-hidden">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full border-[22px] border-white/10" />
              <div className="absolute -bottom-20 left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            </div>
          </div>
        )}
        {/* Bottom fade for depth */}
        <div className="absolute inset-0 bg-linear-to-t from-black/25 to-transparent" />

        {/* Avatar */}
        <div className="absolute left-6 md:left-12 -bottom-12">
          <div className="relative">
            <img
              src={avatar}
              alt="avatar"
              className="w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-white object-cover shadow-xl bg-white"
            />
            {isVerified && (
              <span className="absolute bottom-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow-md">
                <BadgeCheck className="h-5 w-5 text-sky-500" />
              </span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ProfileHeader;
