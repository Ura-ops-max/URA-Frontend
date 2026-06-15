import { useState } from 'react';
import { LayoutGrid, Store, Heart, ChevronRight } from 'lucide-react';
import DashboardContainer from '@/layout/DashboardContainer';
import ProfileCard from '@/components/dashboard/ProfileCard';
import SidebarWidget from '@/components/dashboard/SidebarWidget';
import ChatList from '@/components/dashboard/ChatList';
import { useAuthContext } from '@/context/auth-provider';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import { cn } from '@/lib/utils';
import { Navigate } from 'react-router-dom';

import BookmarkedPosts from '@/components/bookmark/BookmarkPost';
import BookmarkedBusinesses from '@/components/bookmark/BookmarkBusiness';
import WishlistTab from '@/components/bookmark/ProductWishlist';
import { useChat } from '@/hooks/use-chat';

const BookmarkPage = () => {
  const { user, related } = useAuthContext();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState<'posts' | 'businesses' | 'wishlist'>('posts');

  // API Hooks
  const activeProfileId = user?._id;
  const {
    conversations,
    isError: chatError, // This maps the hook's isError to the name chatError
  } = useChat(activeProfileId!);

  const tabs = [
    { id: 'posts', label: 'Saved Posts', icon: LayoutGrid, desc: 'Posts & Media' },
    { id: 'wishlist', label: 'Wishlist', icon: Heart, desc: 'Products & Items' },
    { id: 'businesses', label: 'Saved Stores', icon: Store, desc: 'Stores & Creators' },
  ];

  if (!user || !related) return <Navigate to="/auth/login" replace />;

  return (
    <DashboardContainer
      leftColumn={
        <div className="hidden lg:block sticky top-8 space-y-6">
          {/* RESTORED: Profile & Chat Sidebar */}
          <ProfileCard user={user} related={related} />
          <SidebarWidget
            isDesktop={isDesktop}
            isError={chatError}
            errorTitle="Messages"
            // Use subtle headers for the widgets
            className="bg-white/40 backdrop-blur-xl border-white/20 rounded-[24px] overflow-hidden"
          >
            <ChatList chatList={conversations} activeProfileId={activeProfileId!} />
          </SidebarWidget>
        </div>
      }
    >
      {/* INTERNAL MODULAR SPLIT */}
      <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-120px)]">
        {/* LEFT COMPONENT: Local Tab Navigation */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="sticky top-8">
            <div className="mb-6 px-2 md:px-0">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Library</h1>
              <p className="text-sm text-slate-500 font-medium">Manage your saves</p>
            </div>

            {/* Desktop: Vertical Menu | Mobile: Horizontal Scroll */}
            <div className="flex lg:flex-col gap-2 p-1 bg-slate-100/50 lg:bg-transparent rounded-2xl overflow-x-auto no-scrollbar">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex flex-1 lg:flex-none items-center justify-between p-3 lg:p-4 rounded-2xl transition-all duration-200 group whitespace-nowrap lg:whitespace-normal',
                      isActive
                        ? 'bg-white lg:bg-slate-900 text-slate-900 lg:text-white shadow-sm lg:shadow-md'
                        : 'text-slate-500 hover:bg-slate-100',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          isActive
                            ? 'bg-orange-600 text-white'
                            : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300',
                        )}
                      >
                        <tab.icon size={18} />
                      </div>
                      <div className="text-left hidden lg:block">
                        <p className="text-sm font-bold leading-none">{tab.label}</p>
                        <p
                          className={cn(
                            'text-[10px] mt-1 font-medium',
                            isActive ? 'text-slate-300' : 'text-slate-400',
                          )}
                        >
                          {tab.desc}
                        </p>
                      </div>
                      <span className="text-xs font-bold lg:hidden">{tab.label}</span>
                    </div>
                    <ChevronRight
                      size={16}
                      className={cn(
                        'hidden lg:block transition-transform',
                        isActive
                          ? 'translate-x-0'
                          : '-translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0',
                      )}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COMPONENT: Dynamic Content Column */}
        <div className="flex-1 min-w-0">
          <div className="bg-white/50 lg:bg-transparent rounded-[32px]">
            {/* Handling the 'unequal length' issue: 
                On the right side, we use a single column flow that is wider than mobile
                but narrower than the full screen to maintain readability.
            */}
            <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              {activeTab === 'posts' && <BookmarkedPosts />}
              {activeTab === 'wishlist' && <WishlistTab />}
              {activeTab === 'businesses' && <BookmarkedBusinesses />}
            </div>
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default BookmarkPage;
