import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { useChats } from '@/hooks/api/use-chat';

import DashboardContainer from '@/layout/DashboardContainer';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import SidebarWidget from '@/components/dashboard/SidebarWidget';
import ProfileCard from '@/components/dashboard/ProfileCard';
import ChatList from '@/components/dashboard/ChatList';
import ProductsFeed from '@/components/feed/ProductsFeed';
import { CategoryPills } from '@/components/feed/CategoryPills';
import { Tag } from 'lucide-react';

const DealsAndOffers = () => {
  const { user, related, isLoading: isContextLoading } = useAuthContext();
  const isDesktop = useIsDesktop();
  const [activeCategory, setActiveCategory] = useState('All');

  const activeProfileId = related?.business_id ?? user?._id ?? '';

  const {
    chats,
    isLoading: isChatsLoading,
    isError: chatError,
  } = useChats(isDesktop ? { enabled: true } : { enabled: false });

  if (isContextLoading || isChatsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user || !related) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <DashboardContainer
      // --- LEFT SIDE (Profile & Chats) ---
      leftColumn={
        <div className="sticky top-8 space-y-6">
          <ProfileCard user={user} related={related} />
          <SidebarWidget isDesktop={isDesktop} isError={chatError} errorTitle="Recent Chats">
            <ChatList chatList={chats} isError={chatError} activeProfileId={activeProfileId} />
          </SidebarWidget>
        </div>
      }
    >
      {/* HEADER SECTION */}
      <div className="bg-white rounded-[32px] p-6 border border-gray-100 shadow-sm mb-2">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-orange-50 rounded-2xl">
            <Tag className="text-orange-600 w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Deals & Offers</h1>
            <p className="text-sm text-gray-500">
              Explore the best products from verified businesses
            </p>
          </div>
        </div>

        <CategoryPills selected={activeCategory} onSelect={setActiveCategory} />
      </div>

      {/* PRODUCTS FEED */}
      <div className="min-h-[600px]">
        <ProductsFeed
          type="feed"
          category={activeCategory === 'All' ? undefined : activeCategory}
        />
      </div>
    </DashboardContainer>
  );
};

export default DealsAndOffers;
