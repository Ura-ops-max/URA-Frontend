export type loginType = { email: string; password: string };

export type LoginResponseType = {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      businessName?: string;
    };
  };
};

export type RegisterResponseType = {
  success: boolean;
  message: string;
};

export type registerType = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  phone: string;
};

// USER TYPE - matches backend IUser model
export type UserType = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  phone?: string;
  paylukCustomerId?: string;
  shippingAddress?: {
    phone?: string;
    city?: string;
    fullAddress?: string;
  };
  coverPicture?: string;
  isBusinessOwner: boolean;
  profilePicture?: string;
  bio?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  lastLoginAt?: Date;
  bookmarkedBusinesses: string[];
  bookmarkedPosts: string[];
  savedEvents: string[];
  followingUsers: string[];
  followingBusinesses: string[];
  followers: string[];
  business: BusinessType | null;
  createdAt: Date;
  updatedAt: Date;
};

export type BusinessType = {
  _id: string;
  businessName: string;
  about: string;
  category: string;
  businessLogo: string;
  businessCover: string;
  contact: {
    phone?: string;
    website?: string;
    email?: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    fullAddress: string;
  };
  averageRating?: number;
  totalReviews?: number;
  operatingHours: IOperatingHour[];
};
export interface IOperatingHour {
  day: string;
  open: string; // Will be "09:00" or "Closed"
  close: string; // Will be "17:00" or "Closed"
}

export type ProfileResponse = {
  user: UserType;
  business: BusinessType | null;
  related: {
    counts: { posts: number; followers: number; following: number };
    stats: { rating: number; reviewsCount: number };
  };
};

export type RelatedData = {
  business_id: string;
  businesses: Array<{
    _id: string;
    businessName: string;
    profileImage?: string;
    coverImage?: string;
    followers?: string[];
    likes?: string[];
    category?: string;
  }>;
  recentPosts: Array<{
    _id: string;
    business: string;
    name: string;
    description: string;
    itemNumber?: string;
    price: number;
    media?: string[];
    tags?: string[];
    likes?: string[];
    createdAt: string;
    updatedAt: string;
  }>;
  counts: {
    posts: number;
    followers: number;
    following: number;
  };
};

export interface CurrentUserResponseType {
  success: boolean;
  message?: string;
  user: UserType;
  // Add this line:
  business: BusinessType | null;
  related: RelatedData;
}

export type UsernameCheckResponse = {
  available: boolean;
  message: string; // e.g., "Username is available" or "Username is taken"
};

export interface Chat {
  id: string;
  name: string;
  message: string;
  date: string;
  avatar: string;
  isUnread: boolean;
}

// Import the interface defined above
export interface Activity {
  id: string | number;
  name: string;
  action: string;
  time: string;
  avatar: string;
}

export interface Bookmark {
  id: string;
  name: string;
  description: string;
  avatar: string;
}

// types/api.types.ts
export interface ICommentAuthor {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  businessName?: string;
  businessLogo?: string;
  profilePicture?: string;
}

export interface CommentData {
  _id: string;
  content: string;
  author: ICommentAuthor;
  authorType: 'User' | 'Business';
  postId: string;
  likes: string[];
  parentId: string | null;
  likesCount: number;
  isLiked: boolean;
  replies?: CommentData[];
  createdAt: string;
}
