import { useQuery } from '@tanstack/react-query';
import { getBusinessQrCodeQueryFn, getPublicBusinessBySlugQueryFn } from '@/lib/api';

/** Public business page data by slug. Safe to call whether or not the viewer is logged in. */
export const usePublicBusiness = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['public-business', slug],
    queryFn: () => getPublicBusinessBySlugQueryFn(slug!),
    enabled: !!slug,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useBusinessQrCode = (slug: string | undefined, loc?: string) => {
  return useQuery({
    queryKey: ['business-qrcode', slug, loc],
    queryFn: () => getBusinessQrCodeQueryFn(slug!, loc),
    enabled: !!slug,
    staleTime: Infinity,
  });
};
