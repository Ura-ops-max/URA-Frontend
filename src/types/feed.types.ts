
export type PostType = 'POST' | 'PRODUCT';
export type AuthorType = 'User' | 'Business';
export type PostContentType = 'POST' | 'PRODUCT';


// 1. Shared fields found in every single feed item
interface BasePost {
  _id: string;
  type: 'POST' | 'PRODUCT';
  authorType: AuthorType;
  authorId: string;
  displayName: string;
  displayAvatar: string | null;
  username: string | null;
  isVerified: boolean;
  
  caption: string;
  media: string[];
  tags: string[];
  
  createdAt: string;
  updatedAt: string;
  
  // Engagement
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isBookmarked: boolean;
  
  // Shop Ratings (Now part of the base because you want them everywhere)
  rating: number;
  reviewCount: number;
  isFeatured: boolean;

  // The raw author object from the DB (optional, but present in your JSON)
  author?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    username?: string;
    businessName?: string;
    businessLogo?: string;
    profilePicture?: string;
  };
}

// 2. Shape for a Social Post
export interface SocialPostType extends BasePost {
  type: 'POST';
  product?: never; 
}

// 3. Shape for a Product Post
export interface ProductPostType extends BasePost {
  type: 'PRODUCT';
  product?: {
    _id: string;
    name: string;
    price: number;
    stock: number;
    category: string;
    description: string;
    size?: string;
    media: string[];
    business: string; 
    likes: [];
    image_embedding?: number[]; 
    embedding?: number[];
    averageRating?: number;
  };
  productName?: string; 
  category?: string;
  name?: string;
  price?: number;
  stock?: number;
}

// 3. Shape for a Product Post
export interface ProductType extends BasePost {
  type: 'PRODUCT';
  // Fallback for flat fields seen in your "Vintage Juice" example
  productName: string; 
  category: string;
  name: string;
  price: number;
  stock: number;
  description: string;
  size?: string;
  media: string[];

}



// 4. Unified Types
export type UnifiedPost = SocialPostType | ProductPostType;
export type FeedResponse = {
  success: boolean;
  posts: UnifiedPost[];
};

export interface CardProps<T> {
    post: T;
    onRequireAuth?: () => void;
}

