import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import { useUserProfile } from '@/hooks/api/use-user-profile';

// Components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileTabs from '@/components/profile/ProfileTabs';
import ProfileAbout from '@/components/profile/ProfileAbout';
import ProfileInfo from '@/components/profile/ProfileInfo';
import ReviewsSection from '@/components/profile/ReviewSection';
import PostsFeed from '@/components/feed/PostFeed';
import ProductsFeed from '@/components/feed/ProductsFeed';

// Types - Use the central ProfileResponse to avoid assignment conflicts
import type { ProfileResponse } from '@/types/api.types';
import FollowList from '@/components/profile/FollowList';
import { ProfileSkeleton } from '@/components/skeleton/ProfileSkelenton';

const TABS = {
  FEEDS: 'Feeds',
  POSTS: 'Posts',
  PRODUCTS: 'Products',
  ABOUT: 'About',
  REVIEWS: 'Reviews',
  FOLLOWERS: 'Followers', // New
  FOLLOWING: 'Following', // New
} as const;

const ProfilePage: React.FC = () => {
  const { userId, businessId } = useParams<{ userId?: string; businessId?: string }>();
  const { user: currentUser, related } = useAuthContext();

  const isBusinessProfile = location.pathname.includes('/business/');
  const targetId = businessId || userId;

  const [activeTab, setActiveTab] = useState<string>(TABS.FEEDS);

  const isMe = useMemo(() => {
    if (!currentUser || !targetId) return false;
    if (isBusinessProfile) {
      // Check if current user owns the business being viewed
      return related?.businesses[0]?._id === targetId;
    }
    return currentUser._id === targetId;
  }, [currentUser, targetId, isBusinessProfile]);
  // Inside ProfilePage.tsx

  const { data: profile, isLoading } = useUserProfile(targetId, isBusinessProfile);

  const userProfile = useMemo(() => {
    // 1. If we have fetched data from the server, use it (most accurate)
    if (profile) return profile as unknown as ProfileResponse;

    // 2. If no server data yet, but I am looking at MYSELF, use context data
    if (isMe && currentUser) {
      return {
        user: currentUser,
        business: currentUser.isBusinessOwner ? currentUser.business : null,
        related: {
          counts: { posts: 0, followers: 0, following: 0 },
          stats: { rating: 0, reviewsCount: 0 },
        },
      } as unknown as ProfileResponse;
    }

    return null;
  }, [profile, isMe, currentUser]);
  // --- CRITICAL FIXES BELOW ---

  // Set correct initial tab based on profile type
  useEffect(() => {
    if (isBusinessProfile && activeTab === TABS.FEEDS) {
      setActiveTab(TABS.POSTS); // Businesses default to Posts
    }
  }, [isBusinessProfile]);

  // All hooks are declared above, so it's safe to bail out here (keeps hook
  // order stable across renders — React's rules-of-hooks).
  if (!currentUser) {
    return <ProfileSkeleton />;
  }

  const renderTabContent = () => {
    if (!userProfile) return null;
    console.log(isBusinessProfile);
    switch (activeTab) {
      case TABS.FEEDS:
        return !isBusinessProfile ? (
          <PostsFeed targetId={targetId!} type="feed" />
        ) : (
          <PostsFeed targetId={targetId!} type="post" />
        );

      case TABS.POSTS:
        return <PostsFeed targetId={targetId!} type="post" />;

      case TABS.PRODUCTS:
        return isBusinessProfile ? <ProductsFeed targetId={targetId!} type="post" /> : null;

      case TABS.REVIEWS:
        return isBusinessProfile ? (
          <ReviewsSection itemId={targetId!} itemModel="Business" />
        ) : null;

      case TABS.FOLLOWERS:
        return <FollowList targetId={targetId!} type="followers" currentUser={currentUser} />;

      case TABS.FOLLOWING:
        return !isBusinessProfile ? (
          <FollowList targetId={targetId!} type="following" currentUser={currentUser} />
        ) : null;

      case TABS.ABOUT:
        return <ProfileAbout profile={userProfile} isBusinessPage={isBusinessProfile} />;

      default:
        return null;
    }
  };
  if (isLoading && !userProfile) return <ProfileSkeleton />;

  // Guard for JSX rendering
  if (!userProfile?.user) return <ProfileSkeleton />;

  return (
    /* 1. Wrapper: Changed max-w to 7xl and increased py to give the header more air */
    <div className="min-h-screen bg-[#FFF9F6] pt-6 pb-10 px-4 lg:px-12 animate-in fade-in duration-500">
      <div className="max-w-7xl mx-auto">
        {/* Profile Header stays at the top */}
        <ProfileHeader profile={userProfile} isBusiness={isBusinessProfile} />

        {/* 2. Grid: items-start prevents the sidebar from stretching unnecessarily */}
        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-3 items-start">
          {/* LEFT SIDEBAR */}
          <aside className="lg:col-span-1">
            {/* Added a subtle wrapper for the info card to ensure it feels separate */}
            <div className="bg-white rounded-[25px] p-4 lg:py-8 border border-gray-100/80 shadow-sm overflow-hidden">
              <ProfileInfo
                user={userProfile.user}
                business={userProfile.business}
                related={userProfile.related}
                isMe={isMe}
              />
            </div>
          </aside>

          {/* MAIN CONTENT COLUMN */}
          <main className="lg:col-span-2 flex flex-col">
            {/* 3. Tabs: Added a small bottom margin and ensured they don't scroll away */}
            <div className="mb-2">
              <ProfileTabs
                tabs={Object.values(TABS)}
                active={activeTab}
                onChange={setActiveTab}
                isBusiness={isBusinessProfile}
              />
            </div>

            {/* 4. SCROLLABLE AREA: Added your custom scrollbar ID and adjusted height */}
            <div
              id="main-feed-container" // This triggers your custom CSS scrollbar
              className="mt-4 overflow-y-auto pr-3 scroll-smooth"
              /* Adjusted height: 100vh minus header and tabs space */
              style={{ maxHeight: 'calc(120vh)' }}
            >
              <div className="space-y-6 pb-20 animate-in slide-in-from-bottom-4 duration-500">
                {renderTabContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
