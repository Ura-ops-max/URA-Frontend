import { useState } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';
import ChatSidebar from '@/components/chat/ChatSidebar';
import { useChat } from '@/hooks/use-chat';
import { useAuthContext } from '@/context/auth-provider';

const ChatsPage = () => {
  const { user, related } = useAuthContext();
  const { conversationId } = useParams();
  const location = useLocation();
  
  // State to toggle between User and Business chat threads
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BUSINESS'>('PERSONAL');

  // Determine which ID to use for fetching chats based on the active tab
const activeProfileId = activeTab === 'PERSONAL' 
    ? user?._id 
    : related?.business_id; // Sometimes business is the ID string itself
  // Custom hook to handle socket connections and data fetching
  const chatData = useChat(activeProfileId!);

  // Check if we are looking at a specific chat or starting a new one
  const isDetailView = !!conversationId || location.pathname.includes('/new');

  return (
    <div className="flex h-[calc(100vh-80px)] w-full overflow-hidden p-0 lg:p-6 gap-6 font-sans">
      
      {/* 1. SIDEBAR CONTAINER: Glassy, Modern, Rounded */}
      <aside className={`
        ${isDetailView ? 'hidden' : 'flex'} 
        lg:flex w-full lg:w-[400px] flex-col 
        bg-white/60 backdrop-blur-xl 
        border border-white/80 shadow-2xl shadow-gray-200/50 
        rounded-none lg:rounded-[40px] 
        overflow-hidden transition-all duration-500
      `}>
        <ChatSidebar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
          chatData={chatData} 
        />
      </aside>

      {/* 2. MAIN CONTENT AREA: Glassy, Clean, Independent Scroll */}
      <main className={`
        ${!isDetailView ? 'hidden' : 'flex'} 
        lg:flex flex-1 flex-col 
        bg-white/40 backdrop-blur-2xl 
        border border-white/60 shadow-2xl shadow-gray-200/40 
        rounded-none lg:rounded-[40px] 
        overflow-hidden relative
      `}>
        <Outlet context={{ chatData, activeTab, activeProfileId }} />
      </main>
      
    </div>
  );
};

export default ChatsPage;