import { useState, useEffect, useCallback, useMemo } from 'react';
import { chatAPI } from '@/lib/chat-api';
import { socketService } from '@/services/socket.service';
import { useParams } from 'react-router-dom';

export const useChat = (activeProfileId: string | undefined) => {
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isError, setIsError] = useState(false);

  const fetchConversations = useCallback(async () => {
    if (!activeProfileId) return;

    setIsLoading(true);
    setIsError(false);
    try {
      const { data } = await chatAPI.getConversations(activeProfileId);
      setConversations(data.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [activeProfileId]);

  // NEW: Optimistic Unread Clear
  const markAsRead = useCallback(
    async (convId: string) => {
      if (!activeProfileId || !convId) return;

      // 1. Update LOCAL state immediately (Optimistic UI)
      setConversations((prev) =>
        prev.map((chat) => {
          if (chat._id === convId) {
            return {
              ...chat,
              unreadCount: {
                ...chat.unreadCount,
                [activeProfileId]: 0, // Zero out unread for the current user
              },
            };
          }
          return chat;
        }),
      );

      try {
        // 2. Tell the backend to clear it in the DB
        // Note: Your getMessages controller already handles clearing unread count
        await chatAPI.getMessages(convId, activeProfileId);

        // 3. Optional: Notify other user via socket that you've seen the messages
        socketService.emit('mark_seen', { conversationId: convId, profileId: activeProfileId });
      } catch (error) {
        console.error('Failed to mark messages as read:', error);
      }
    },
    [activeProfileId],
  );

  // EFFECT: Fetch conversations on mount or tab switch
  useEffect(() => {
    if (!activeProfileId) {
      setConversations([]);
      return;
    }

    socketService.connect();
    socketService.setup(activeProfileId);
    fetchConversations();

    const handleNewMessage = () => {
      fetchConversations();
    };

    socketService.on('message:received', handleNewMessage);

    // Listen for global 'seen' updates if you want counts to clear when
    // you have the app open on two devices
    socketService.on('messages_seen', ({ conversationId: id, seenBy }) => {
      if (seenBy === activeProfileId) {
        setConversations((prev) =>
          prev.map((c) =>
            c._id === id ? { ...c, unreadCount: { ...c.unreadCount, [seenBy]: 0 } } : c,
          ),
        );
      }
    });

    return () => {
      socketService.off('message:received', handleNewMessage);
      socketService.off('messages_seen');
    };
  }, [activeProfileId, fetchConversations]);

  // EFFECT: Auto-mark as read when URL conversationId changes
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead]);

  const filteredConversations = useMemo(() => {
    return conversations.filter((chat) => {
      const otherParticipant = chat.participants.find(
        (p: any) => (p.participantId?._id || p.participantId) !== activeProfileId,
      );
      const details = otherParticipant?.participantId;
      const name =
        otherParticipant?.participantModel === 'User'
          ? `${details?.firstName} ${details?.lastName}`
          : details?.businessName;

      return name?.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [conversations, searchQuery, activeProfileId]);

  return {
    conversations: filteredConversations,
    isLoading,
    isError,
    searchQuery,
    setSearchQuery,
    fetchConversations,
  };
};
