import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchChatList } from '@/lib/api';
import type { Chat } from '@/types/api.types';

type ChatQueryOptions = Omit<UseQueryOptions<Chat[]>, 'queryKey' | 'queryFn'>;

/**
 * Custom hook to fetch the list of recent conversations.
 */

export const useChats = (options: ChatQueryOptions = {}) => {
  const { data, isLoading, isError, error } = useQuery<Chat[]>({
    queryKey: ['chatList'],
    queryFn: fetchChatList,
    refetchInterval: 30000,
    ...options, // <-- Spread the options here
  });

  // 3. Return the necessary state and data
  return {
    chats: data ?? [], // Return an empty array if data is undefined
    isLoading,
    isError,
    error,
  };
};
