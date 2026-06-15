// src/hooks/api/use-categories.ts
import { useState, useEffect } from 'react';
import { fetchProductCategories } from '@/lib/api';

export const useCategories = (type: 'product' | 'business' = 'product') => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCategories = async () => {
      // Only fetch if we don't have them yet to prevent redundant calls
      if (categories.length > 0) return;

      setIsLoading(true);
      setError(null);

      try {
        const data = await fetchProductCategories();
        setCategories(data);
      } catch (err: any) {
        setError(err.message || 'Something went wrong');
        console.error('Category Hook Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (type === 'product') {
      loadCategories();
    }
  }, [type]);

  return { categories, isLoading, error };
};
