import { useEffect } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { useAuthContext } from '@/context/auth-provider';
import UploadProductForm from '@/components/product/UploadProductForm';
import MakePostForm from '@/components/product/MakePostForm';
import ProfileCard from '@/components/dashboard/ProfileCard';
import SidebarWidget from '@/components/dashboard/SidebarWidget';
import DashboardContainer from '@/layout/DashboardContainer'; // Import your container
import { PackagePlus, Megaphone, Info, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsDesktop } from '@/hooks/use-is-desktop';
import ChatList from '@/components/dashboard/ChatList';
import { DashboardSkeleton } from '@/components/skeleton/DashboardSkeleton';
import { useChat } from '@/hooks/use-chat';

const CreateProduct = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, related, isLoading } = useAuthContext();
  const isDesktop = useIsDesktop();
  const activeTab = searchParams.get('type') || 'post';
  const isBusiness = user?.isBusinessOwner;

  const activeProfileId = user?._id;
  const {
    conversations,
    isLoading: isChatsLoading,
    isError: chatError, // This maps the hook's isError to the name chatError
  } = useChat(activeProfileId!);
  // 1. FIX: Scroll main container to top when page loads or tab changes
  useEffect(() => {
    const container = document.getElementById('main-feed-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [activeTab]); // Triggers on initial load and when switching between Post/Product

  useEffect(() => {
    if (activeTab === 'product' && !isBusiness) {
      setSearchParams({ type: 'post' });
    }
  }, [activeTab, isBusiness, setSearchParams]);

  if (isLoading || isChatsLoading) {
    return <DashboardSkeleton />;
  }

  if (!user || !related) return <Navigate to="/auth/login" replace />;

  // 1. Define the Widget Content as a reusable constant to keep code DRY
  const TipsWidget = ({ className }: { className?: string }) => (
    <SidebarWidget isDesktop={true} isError={false} errorTitle={''} className={className}>
      <div className="p-4 space-y-4">
        <div className="flex gap-3">
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
            <Sparkles size={16} className="text-orange-600" />
          </div>
          <p className="text-xs text-gray-600 leading-relaxed">
            {activeTab === 'product'
              ? 'Items with **clear pricing** and **multiple photos** sell 3x faster.'
              : 'Posts with **high-quality images** receive 3x more engagement.'}
          </p>
        </div>
      </div>
    </SidebarWidget>
  );
  // 2. Define Sidebar Elements to pass into DashboardContainer
  const leftSidebar = (
    <>
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
    </>
  );

  const rightSidebar = (
    <div className="space-y-6">
      {/* Moved to top for Desktop */}
      <TipsWidget className="hidden lg:block" />
      {/* 1. TOP WIDGET (Info/Guidance) */}
      <SidebarWidget isDesktop={true} isError={false} errorTitle={''}>
        <div className="p-5">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
            <div className="flex items-center gap-2 text-gray-900 font-bold mb-2">
              <Info size={16} className="text-orange-500" />
              <span className="text-sm">
                {activeTab === 'product' ? 'Listing Visibility' : 'Post Reach'}
              </span>
            </div>

            <p className="text-[11px] text-gray-500 leading-normal">
              {activeTab === 'product' ? (
                <>
                  Your products are automatically listed in the <strong>Global Shop</strong>. Ensure
                  your pricing is competitive to attract more buyers.
                </>
              ) : (
                <>
                  Social updates reach your <strong>Followers</strong> and can appear on the
                  <strong> Discover Feed</strong> if they gain early engagement.
                </>
              )}
            </p>
          </div>
        </div>
      </SidebarWidget>

      {/* 2. BOTTOM CTA (Gradient Box) */}
      {activeTab === 'product' ? (
        // PRODUCT CTA
        <div className="p-6 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] text-white shadow-lg shadow-gray-200">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
            <Sparkles size={18} className="text-orange-400" />
          </div>
          <h4 className="font-black text-sm mb-1">Sell Faster</h4>
          <p className="text-[10px] opacity-80 leading-normal">
            High-quality photos and detailed descriptions increase your chances of a sale by 40%. Be
            clear about shipping and stock!
          </p>
        </div>
      ) : (
        // SOCIAL POST CTA
        <div className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-[32px] text-white shadow-lg shadow-orange-200">
          <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center mb-3">
            <Megaphone size={18} className="text-white" />
          </div>
          <h4 className="font-black text-sm mb-1">Engage More</h4>
          <p className="text-[10px] opacity-90 leading-normal">
            Posts with questions or polls get 2x more comments. Use #hashtags to help people outside
            your network find your content.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <DashboardContainer leftColumn={leftSidebar} rightColumn={rightSidebar}>
      <div className="space-y-6">
        {/* MOBILE ONLY WIDGET - Appears at the very top on mobile screens */}
        <div className="lg:hidden">
          <TipsWidget />
        </div>
        {/* Tabs */}
        <div className="bg-white p-1.5 rounded-[24px] shadow-sm border border-gray-100 flex items-center">
          {isBusiness && (
            <button
              onClick={() => setSearchParams({ type: 'product' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-sm font-bold transition-all ${
                activeTab === 'product'
                  ? 'bg-gray-900 text-white shadow-md'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              <PackagePlus size={18} />
              <span>List Product</span>
            </button>
          )}

          <button
            onClick={() => setSearchParams({ type: 'post' })}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[20px] text-sm font-bold transition-all ${
              activeTab === 'post'
                ? 'bg-orange-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-50'
            }`}
          >
            <Megaphone size={18} />
            <span>Make a Post</span>
          </button>
        </div>

        {/* Form Content */}
        <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 lg:p-8 mb-10">
          <div className="mb-8 flex items-start gap-4">
            {/* Dynamic Icon to give visual feedback */}
            <div
              className={cn(
                'p-3 rounded-2xl hidden sm:block',
                activeTab === 'product'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-orange-100 text-orange-600',
              )}
            >
              {activeTab === 'product' ? <PackagePlus size={24} /> : <Megaphone size={24} />}
            </div>

            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {activeTab === 'product' ? 'List a New Product' : "What's on your mind?"}
              </h2>
              <p className="text-[14px] text-gray-500 font-medium mt-1 leading-relaxed max-w-md">
                {activeTab === 'product'
                  ? 'Showcase your items to your customers and the marketplace'
                  : 'Share an update, photo, or thought with your community'}
              </p>
            </div>
          </div>

          <div className="pt-2">
            {activeTab === 'product' ? <UploadProductForm /> : <MakePostForm />}
          </div>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default CreateProduct;
