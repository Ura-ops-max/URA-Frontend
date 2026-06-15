import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatAPI } from '@/lib/chat-api';
import { socketService } from '@/services/socket.service';
import { useAuthContext } from './auth-provider';

interface ChatContextType {
  conversations: any[];
  totalUnreadCount: number;
  refreshConversations: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuthContext(); // Assuming activeProfileId comes from Auth
  const activeProfileId = user?._id;
  const [conversations, setConversations] = useState<any[]>([]);

  const fetchConversations = useCallback(async () => {
    if (!activeProfileId) return;
    try {
      const { data } = await chatAPI.getConversations(activeProfileId);
      setConversations(data.data);
    } catch (error) {
      console.error('Global Chat Fetch Error:', error);
    }
  }, [activeProfileId]);

  if (!activeProfileId) return;

  // Calculate total unread count across all chats
  const totalUnreadCount = conversations.reduce((acc, chat) => {
    return acc + (chat.unreadCount?.[activeProfileId!] || 0);
  }, 0);

  useEffect(() => {
    if (!activeProfileId) return;

    fetchConversations();

    const handleNewMessage = () => fetchConversations();

    socketService.on('message:received', handleNewMessage);
    socketService.on('messages_seen', handleNewMessage);

    return () => {
      socketService.off('message:received', handleNewMessage);
      socketService.off('messages_seen', handleNewMessage);
    };
  }, [activeProfileId, fetchConversations]);

  return (
    <ChatContext.Provider
      value={{ conversations, totalUnreadCount, refreshConversations: fetchConversations }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useGlobalChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useGlobalChat must be used within ChatProvider');
  return context;
};
