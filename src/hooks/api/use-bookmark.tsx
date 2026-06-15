// src/hooks/api/use-bookmarks.ts

import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { fetchBookmarkList, fetchBookmarksLoad } from '@/lib/api';

import type { Bookmark } from '@/types/api.types';

type BookmarkQueryOptions = Omit<UseQueryOptions<Bookmark[]>, 'queryKey' | 'queryFn'>;

export const useBookmarks = (options: BookmarkQueryOptions = {}) => {
  const { data, isLoading, isError, error } = useQuery<Bookmark[]>({
    queryKey: ['bookmarks'],
    queryFn: fetchBookmarkList,
    ...options,
  });

  return {
    bookmarks: data ?? [],
    isLoading,
    isError,
    error,
  };
};

export const useBookmarkedItems = (type: 'Post' | 'Business') => {
  return useQuery({
    // The key changes based on type: ['bookmarks', 'Post'] or ['bookmarks', 'Business']
    queryKey: ['posts-feed', type],
    queryFn: () => fetchBookmarksLoad(type),
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes to prevent redundant loads
    refetchOnWindowFocus: false,
  });
};
