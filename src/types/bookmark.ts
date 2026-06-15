// src/types/bookmark.ts
import type { ProductCardProps } from '@/types/product';

// Merchant/User Bookmark structure (based on mobile design)
export interface MerchantBookmark {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  address: string;
  snippet: string; // "Twice the taste, one fiery bite"
  profileImageUrl: string;
}

// Post Bookmark structure (reusing ProductCardProps for simplicity)
export type PostBookmark = ProductCardProps;
