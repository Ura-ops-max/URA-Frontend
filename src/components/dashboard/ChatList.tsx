import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { socketService } from '@/services/socket.service';
import { Briefcase, User as UserIcon, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { Link } from 'react-router-dom';

interface ChatListProps {
  chatList: any[];
  activeProfileId: string;
  isError?: boolean;
}

const ChatList: React.FC<ChatListProps> = ({ chatList, activeProfileId, isError }) => {
  const displayChats = chatList.slice(0, 6);

  return (
    <div className="flex flex-col max-h-[280px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 shrink-0">
        <h3 className="font-bold text-[16px] tracking-tight text-slate-900">Messages</h3>
        <Link
          to="/dashboard/chat"
          className="text-[11px] font-black uppercase tracking-[0.12em] text-[#f97316] hover:opacity-70 transition-all"
        >
          View All
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-base scrollbar-main">
        {isError ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-30">
            <AlertCircle strokeWidth={1.5} size={28} className="mb-2 text-slate-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-center">
              Failed to load
            </p>
          </div>
        ) : chatList.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center opacity-30">
            <MessageSquare strokeWidth={1.5} size={28} className="mb-2 text-slate-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-center">
              No conversations
            </p>
          </div>
        ) : (
          displayChats.map((chat) => (
            <ChatListItem key={chat.id} chat={chat} activeProfileId={activeProfileId} />
          ))
        )}
      </div>
    </div>
  );
};

const ChatListItem = ({ chat, activeProfileId }: { chat: any; activeProfileId: string }) => {
  const otherParticipant = chat.participants.find(
    (p: any) => p.participantId?._id !== activeProfileId,
  );

  const details = otherParticipant?.participantId;
  const partnerId = details?._id;
  const isBusiness = otherParticipant?.participantModel === 'Business';

  const avatar = isBusiness ? details?.businessLogo : details?.profilePicture;
  const name = isBusiness ? details?.businessName : details?.fullName;
  const fallback = generateAvatarUrl(name || 'User');

  const [isOnline, setIsOnline] = useState(details?.isOnline || false);
  const unreadCount = chat.unreadCount?.[activeProfileId] || 0;

  useEffect(() => {
    if (!partnerId) return;

    const handleStatus = (data: { userId: string; status: 'online' | 'offline' }) => {
      if (data.userId === partnerId) {
        setIsOnline(data.status === 'online');
      }
    };

    socketService.onStatusChange(handleStatus);
    socketService.emit('check_online_status', partnerId);

    return () => {
      socketService.off('user_status_changed', handleStatus);
    };
  }, [partnerId]);

  return (
    <Link to={`/dashboard/chat/${chat?._id}`}>
      <div className="group relative flex items-center gap-3.5 p-3 rounded-[24px] transition-all duration-300 hover:bg-white/80 hover:shadow-sm cursor-pointer active:scale-[0.98]">
        {/* Avatar Wrapper */}
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white/60 shadow-sm bg-slate-100 ring-1 ring-slate-200/50">
            <img
              src={avatar || fallback}
              alt={name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>

          {isOnline && (
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-emerald-500 border-[2.5px] border-white rounded-full shadow-sm ring-1 ring-emerald-100 animate-pulse" />
          )}

          <div className="absolute -top-1 -right-1 bg-white/90 backdrop-blur-md rounded-full p-1 shadow-sm border border-slate-100">
            {isBusiness ? (
              <Briefcase size={9} className="text-[#f97316]" />
            ) : (
              <UserIcon size={9} className="text-blue-500" />
            )}
          </div>
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-0.5">
            <h4 className="text-[14px] font-bold text-slate-800 truncate tracking-tight">{name}</h4>
            <span className="text-[10px] font-medium text-slate-400 lowercase italic">
              {chat.lastMessage?.createdAt
                ? formatDistanceToNow(new Date(chat.lastMessage.createdAt), { addSuffix: false })
                : ''}
            </span>
          </div>

          <div className="flex justify-between items-center gap-2">
            <p
              className={cn(
                'text-[12.5px] truncate leading-tight transition-colors',
                unreadCount > 0 ? 'text-slate-950 font-semibold' : 'text-slate-500 font-medium',
              )}
            >
              {chat.lastMessage?.content || 'Tap to chat...'}
            </p>

            {unreadCount > 0 && (
              <span className="h-5 min-w-[20px] px-1.5 flex items-center justify-center bg-[#f97316] text-white text-[10px] font-black rounded-full shadow-[0_4px_10px_rgba(249,115,22,0.3)]">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ChatList;
