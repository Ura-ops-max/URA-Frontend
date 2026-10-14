import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchChatList } from '@/lib/api';
import type { Chat } from '@/types/api.types';

type ChatQueryOptions = Omit<UseQueryOptions<Chat[]>, 'queryKey' | 'queryFn'>;

/**
 * Custom hook to fetch the list of recent conversations.
 */

export const useChats = (profileId: string | undefined, options: ChatQueryOptions = {}) => {
  const { data, isLoading, isError, error } = useQuery<Chat[]>({
    queryKey: ['chatList', profileId],
    queryFn: () => fetchChatList(profileId!),
    refetchInterval: 30000,
    ...options,
    // The server needs to know whose chats to list; wait until we know.
    enabled: Boolean(profileId) && (options.enabled ?? true),
  });

  // 3. Return the necessary state and data
  return {
    chats: data ?? [], // Return an empty array if data is undefined
    isLoading,
    isError,
    error,
  };
};
