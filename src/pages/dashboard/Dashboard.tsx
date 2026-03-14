import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useActivity } from '@/hooks/api/use-activity';
import { useBookmarkedItems } from '@/hooks/api/use-bookmark';

import DashboardContainer from '@/layout/DashboardContainer';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import SidebarWidget from '@/components/dashboard/SidebarWidget';
import ProfileCard from '@/components/dashboard/ProfileCard';
import ChatList from '@/components/dashboard/ChatList';
import ShareBox from '@/components/dashboard/ShareBox';
import AllFeed from '@/components/feed/AllFeed';
import ActivityPanel from '@/components/dashboard/ActivityPanel';
import BookmarkList from '@/components/dashboard/BookmarkList';
import { useChat } from '@/hooks/use-chat';
import React from 'react';

const Dashboard = () => {
  const { user, related, isLoading: isContextLoading } = useAuthContext();
  const isDesktop = useIsDesktop();

  // API Hooks
  const activeProfileId = user?._id;
  const {
    conversations,
    isLoading: isChatsLoading,
    isError: chatError // This maps the hook's isError to the name chatError
  } = useChat(activeProfileId!);

  const {
    activities,
    isError: isActivityError,
    clearAll
  } = useActivity(isDesktop ? { enabled: true } : { enabled: false });

  const {
    data: posts,
    isLoading: isPostsLoading,
    isError: isBookmarksError
  } = useBookmarkedItems('Post');

  const {
    data: businesses,
    isLoading: isBizLoading,
  } = useBookmarkedItems('Business');

  // Combine them for a "Recent Saved" list
  const allBookmarks = React.useMemo(() => {
    return [...(posts || []), ...(businesses || [])].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [posts, businesses]);


  // 1. Loading State
  if (isContextLoading || isChatsLoading) {
    return <DashboardSkeleton />;
  }

  // 2. Auth Guard
  if (!user || !related) {
    return <Navigate to="/auth/login" replace />;
  }

  // Inside Dashboard.tsx return statement:

  return (
    <DashboardContainer
      // --- LEFT SIDE ---
      leftColumn={
        <div className="flex flex-col gap-6">
          {/* Ensure ProfileCard is bg-white/40 backdrop-blur internally */}
          <ProfileCard user={user} related={related} />

          <SidebarWidget
            isDesktop={isDesktop}
            isError={chatError}
            errorTitle="Messages"
            // Use subtle headers for the widgets
            className="bg-white/40 backdrop-blur-xl border-white/20 rounded-[24px] overflow-hidden"
          >
            <ChatList
              chatList={conversations}
              activeProfileId={activeProfileId!}
            />
          </SidebarWidget>
        </div>
      }
      // --- RIGHT SIDE ---
      rightColumn={
        <div className="flex flex-col gap-6">
          <SidebarWidget
            isDesktop={isDesktop}
            isError={isActivityError}
            errorTitle="Recent Activity"
            className="bg-white/40 backdrop-blur-xl border-white/20 rounded-[24px]"
          >
            <ActivityPanel
              activities={activities}
              isError={isActivityError}
              onClearAll={clearAll}
            />
          </SidebarWidget>

          <SidebarWidget
            isDesktop={isDesktop}
            isError={isBookmarksError}
            errorTitle="Saved Items"
            className="bg-white/40 backdrop-blur-xl border-white/20 rounded-[24px]"
          >
            <BookmarkList
              bookmarks={allBookmarks}
              isLoading={isPostsLoading || isBizLoading}
              isError={isBookmarksError}
            />
          </SidebarWidget>
        </div>
      }
    >
      <div className="flex flex-col h-screen overflow-hidden">
        {/* ShareBox stays at the top */}
        <div className="flex-shrink-0 py-4 lg:p-4">
          <ShareBox />
        </div>

        {/* AllFeed takes the remaining space and scrolls */}
        <div className="flex-1 min-h-0">
          <AllFeed />
        </div>
      </div>
    </DashboardContainer>
  );
};

export default Dashboard;