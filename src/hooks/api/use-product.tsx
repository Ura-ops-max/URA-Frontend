// hooks/api/use-single-product.ts
import { useQuery } from '@tanstack/react-query';
import { useInfiniteQuery } from '@tanstack/react-query';
import API from '@/lib/axios-client';
import { initialProductData } from '@/lib/page-data';

export const useSingleProduct = (productId: string) => {
  return useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await API.get(`/products/${productId}`);
      return response.data;
    },
    enabled: !!productId,
    // A built product page already has the data: show it now, refresh later.
    initialData: () => initialProductData(productId),
    initialDataUpdatedAt: 0,
  });
};

export const useWishlist = () => {
  return useInfiniteQuery({
    queryKey: ['wishlist', 'products'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await API.get(`/users/me/wishlist?page=${pageParam}`);
      return response.data;
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
  });
};
