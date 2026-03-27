import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthProvider } from '@/context/auth-provider'; // Import hook
import SearchContainer from '@/components/search/SearchContainer';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import AppSideBar from '@/components/shared/AppSideBar';
import Header from '@/components/Headers/Header';
import MobileBottomNav from '@/components/nav/MobileBottomNav';
import VerificationBanner from '@/components/nav/VerificationBanner';
import { CartProvider } from '@/context/cart-provider';
import { NotificationProvider } from '@/context/notification-provider';
import { SocketSync } from '@/context/socket-sync';
import { ChatProvider } from '@/context/chat-provider';

const AppLayoutContent = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  return (
    <>
    <SocketSync />
      <NotificationProvider>
        <ChatProvider>

        <CartProvider>
          <SidebarProvider>

            <div className="fixed inset-0 -z-10 bg-[#FAFAFB] bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="flex min-h-screen w-full">
              <AppSideBar />

              <SidebarInset className="flex flex-col flex-1 h-screen overflow-y-auto overflow-x-hidden bg-transparent scrollbar-base scrollbar-main">
                <VerificationBanner />

                {/* Header Glass: Lowered opacity to 40% for better transparency */}
                <div className="sticky top-0 z-40 w-full bg-white/40 backdrop-blur-xl border-b border-white/40 shadow-sm">
                  <Header onSearchClick={() => setIsSearchOpen(true)} />
                </div>

                <main className="flex-1 pb-24 lg:pb-10">
                  {/* Ensure your Page components inside <Outlet /> 
                    don't have 'bg-white' classes on their parent containers 
                */}
                  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 mt-6">
                    <Outlet />
                  </div>
                </main>

                <MobileBottomNav onSearchClick={() => setIsSearchOpen(true)} />
              </SidebarInset>
            </div>

            <SearchContainer isSearchOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
          </SidebarProvider>
        </CartProvider>
        </ChatProvider>

      </NotificationProvider>
    </>
  );
};

// Wrap with AuthProvider first so we can use its context inside the content
const AppLayout = () => (
  <AuthProvider>
    <AppLayoutContent />
  </AuthProvider>
);

export default AppLayout;