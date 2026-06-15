// src/hooks/api/use-search.ts
import { useState, useEffect } from 'react';
import { searchAPI } from '@/lib/api';

export const useSearch = (query: string, searchType: string, filters: any) => {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Minimum query check: prevent API spam for very short strings
    if (!query || query.trim().length < 2) {
      setResults(null);
      setIsLoading(false);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Axios automatically converts these into query params: ?q=...&type=...&rating=...
        const response = await searchAPI.getGlobalSearch({
          q: query,
          type: searchType,
          ...filters, // Spreads city, category, rating, openNow, etc.
        });

        // Our controller returns { success: true, data: { businesses: [], products: [] } }
        // So response.data is the body, and .data.data is our results object
        setResults(response.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Search failed');
        console.error('Search API Error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms is perfect for mobile/web typing speed

    return () => clearTimeout(delayDebounceFn);
  }, [query, searchType, JSON.stringify(filters)]);

  return { results, isLoading, error };
};

export const useSearchHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await searchAPI.getRecentSearches();
      setHistory(res.data.data);
    } catch (err) {
      console.error('Failed to fetch history');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteItem = async (id: string) => {
    await searchAPI.deleteHistoryItem(id);
    setHistory((prev) => prev.filter((item: any) => item._id !== id));
  };

  const clearAll = async () => {
    await searchAPI.clearAllHistory();
    setHistory([]);
  };

  const addToHistory = async (query: string) => {
    await searchAPI.saveToHistory(query);
    // No need to fetch immediately, usually done when overlay re-opens
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return { history, isLoading, deleteItem, clearAll, addToHistory, refreshHistory: fetchHistory };
};
