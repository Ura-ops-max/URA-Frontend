import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Edit3, Search, User, Briefcase, MessageSquare, UserIcon } from 'lucide-react';
import { socketService } from '@/services/socket.service';
import { formatDistanceToNow } from 'date-fns';
import { useAuthContext } from '@/context/auth-provider';
import { generateAvatarUrl } from '@/utils/avatar-generator';

interface SidebarProps {
  activeTab: 'PERSONAL' | 'BUSINESS';
  setActiveTab: (tab: 'PERSONAL' | 'BUSINESS') => void;
  chatData: any;
}

const ChatSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, chatData }) => {
  const navigate = useNavigate();
  const { conversationId } = useParams();
  const { user, related } = useAuthContext();

  const activeProfileId = activeTab === 'PERSONAL' ? user?._id : related?.business_id;

  if (!chatData)
    return (
      <div className="p-6">
        <SidebarSkeleton />
      </div>
    );

  const { conversations, isLoading, searchQuery, setSearchQuery } = chatData;

  return (
    <div className="flex flex-col h-full bg-white/30 backdrop-blur-md">
      {/* HEADER SECTION */}
      <div className="p-6 pb-2 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Chats</h1>
          <button
            onClick={() => navigate('/dashboard/chat/new')}
            className="p-2 bg-white text-[#FF6B35] rounded-full shadow-sm hover:scale-105 transition-all border border-gray-100"
          >
            <Edit3 size={18} />
          </button>
        </div>

        {/* PROFILE SWITCHER */}
        {user?.isBusinessOwner && (
          <div className="flex p-1 bg-[#F5F3F0]/80 rounded-2xl border border-white/50 shadow-inner">
            <TabButton
              active={activeTab === 'PERSONAL'}
              onClick={() => setActiveTab('PERSONAL')}
              icon={<User size={14} />}
              label="Personal"
            />
            <TabButton
              active={activeTab === 'BUSINESS'}
              onClick={() => setActiveTab('BUSINESS')}
              icon={<Briefcase size={14} />}
              label="Business"
            />
          </div>
        )}

        {/* SEARCH */}
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF6B35] transition-colors"
            size={16}
          />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 border-none rounded-full text-sm outline-none shadow-sm focus:ring-1 focus:ring-[#FF6B35]/30 transition-all placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* CHAT LIST */}
      <div className="flex-1 overflow-y-auto px-3 pb-6 mt-4 space-y-1 scrollbar-base scrollbar-main">
        {isLoading ? (
          <SidebarSkeleton />
        ) : conversations.length > 0 ? (
          conversations.map((chat: any) => (
            <ConversationItem
              key={chat._id}
              chat={chat}
              activeProfileId={activeProfileId}
              isActive={conversationId === chat._id}
              onClick={() => navigate(`/dashboard/chat/${chat._id}`)}
            />
          ))
        ) : (
          <EmptySidebarState />
        )}
      </div>
    </div>
  );
};

/* --- REFINED SUB-COMPONENTS --- */

const TabButton = ({ active, onClick, icon, label }: any) => (
  <button
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-semibold rounded-xl transition-all ${
      active ? 'bg-white shadow-sm text-[#FF6B35]' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon} {label}
  </button>
);

const ConversationItem = ({ chat, activeProfileId, isActive, onClick }: any) => {
  const other = chat.participants.find((p: any) => {
    const pId = typeof p.participantId === 'object' ? p.participantId._id : p.participantId;
    return pId !== activeProfileId;
  });

  const details = other?.participantId;
  const partnerId = typeof details === 'object' ? details._id : details;
  const isBusiness = other?.participantModel === 'Business';

  const [isOnline, setIsOnline] = useState(details?.isOnline || false);
  const [liveUnread, setLiveUnread] = useState(chat.unreadCount?.[activeProfileId] || 0);

  // 1. IMPROVED ONLINE LOGIC (Matched to your effective ChatList logic)
  useEffect(() => {
    if (!partnerId) return;

    // Listen for status changes
    const handleStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      if (data.userId === partnerId) {
        setIsOnline(data.status === 'online');
      }
    };

    // Use your specific socket service methods
    socketService.onStatusChange(handleStatus);

    // IMMEDIATE CHECK: Force a check for this partner on mount
    socketService.emit('check_online_status', partnerId);

    return () => {
      socketService.off('user_status_changed', handleStatus);
    };
  }, [partnerId]);

  // 2. LIVE UNREAD COUNT SYNC
  useEffect(() => {
    setLiveUnread(chat.unreadCount?.[activeProfileId] || 0);
  }, [chat.unreadCount, activeProfileId]);

  const name =
    details?.fullName ||
    (details?.firstName ? `${details.firstName} ${details.lastName}` : details?.businessName);
  const avatar = isBusiness ? details?.businessLogo : details?.profilePicture;

  const lastMsgContent = chat.lastMessage?.content || 'Tap to chat...';
  const lastMsgTime = chat.lastMessage?.createdAt || chat.updatedAt;

  return (
    <div
      onClick={onClick}
      className={`group relative flex items-center gap-3 p-3 rounded-[24px] cursor-pointer transition-all duration-300 ${
        isActive
          ? 'bg-white border border-white/50 shadow-sm ring-1 ring-[#FF6B35]/10'
          : 'hover:bg-white/40 active:scale-[0.98]'
      }`}
    >
      {/* Avatar Wrapper */}
      <div className="relative shrink-0">
        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/60 shadow-sm">
          <img
            src={avatar || generateAvatarUrl(name)}
            className="w-full h-full object-cover"
            alt={name}
          />
        </div>

        {/* STATUS DOT (Emerald Green) */}
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
        )}

        {/* ACCOUNT TYPE ICON (Small badge over avatar) */}
        <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-md rounded-full p-1 shadow-sm border border-gray-100">
          {isBusiness ? (
            <Briefcase size={8} className="text-[#FF6B35]" />
          ) : (
            <UserIcon size={8} className="text-blue-500" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-0.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <h4
              className={`text-[13.5px] font-bold truncate ${isActive ? 'text-[#FF6B35]' : 'text-gray-800'}`}
            >
              {name}
            </h4>
            {/* Optional: Small text indicator for business */}
            {isBusiness && !isActive && (
              <span className="text-[9px] bg-orange-50 text-[#FF6B35] px-1 rounded uppercase font-black tracking-tighter">
                Pro
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">
            {lastMsgTime ? formatDistanceToNow(new Date(lastMsgTime), { addSuffix: false }) : ''}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <p
            className={`text-[12px] truncate pr-2 ${
              isActive ? 'text-gray-600' : liveUnread > 0 ? 'text-black font-bold' : 'text-gray-400'
            }`}
          >
            {lastMsgContent}
          </p>

          {/* UNREAD BADGE */}
          {liveUnread > 0 && !isActive && (
            <span className="flex-shrink-0 bg-[#FF6B35] text-white text-[9px] font-black h-4 w-4 flex items-center justify-center rounded-full shadow-sm">
              {liveUnread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const SidebarSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="flex items-center gap-3 animate-pulse">
        <div className="w-12 h-12 bg-white/50 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-white/50 rounded w-1/4" />
          <div className="h-2 bg-white/30 rounded w-3/4" />
        </div>
      </div>
    ))}
  </div>
);

const EmptySidebarState = () => (
  <div className="flex flex-col items-center justify-center py-20 opacity-30">
    <MessageSquare size={40} className="text-gray-400 mb-2" />
    <p className="text-xs font-medium">No messages</p>
  </div>
);

export default ChatSidebar;
