import type {
  CurrentUserResponseType,
  LoginResponseType,
  loginType,
  RegisterResponseType,
  registerType,
  UsernameCheckResponse,

} from '@/types/api.types';
import API from './axios-client';
import { uploadImageToCloudinary, uploadMediaToCloudinary } from "@/services/cloudinary.service";
import type { UnifiedPost, ProductPostType } from '@/types/feed.types';


export const checkUsernameAvailability = async (username: string): Promise<UsernameCheckResponse> => {
  // Only call the API if the username is not empty
  if (!username) {
    return { available: true, message: '' };
  }

  const response = await API.get(`/auth/check-username`, {
    params: { username }
  });
  return response.data;
};


export const loginMutationFn = async (data: loginType): Promise<LoginResponseType> => {
  const response = await API.post('/auth/login', data);
  return response.data;
};

export const registerMutationFn = async (data: registerType): Promise<RegisterResponseType> => {
  const response = await API.post('/auth/register', data);
  return response.data;
};

export const verifyEmailMutationFn = async ({ email, token }: { email: string; token: string }) =>
  await API.post('/auth/verify-email', { email, token });

export const logoutMutationFn = async (refreshToken?: string) =>
  await API.post('/auth/logout', refreshToken ? { refreshToken } : {});

export const getCurrentUserQueryFn = async (): Promise<CurrentUserResponseType> => {
  const response = await API.get(`/user/current`);
  // console.log("Current user response:", response.data);
  return response.data;
};

// Required userId to prevent accidental fallbacks
// Existing User Fetcher
export const getUserQueryFn = async (userId: string): Promise<CurrentUserResponseType> => {
  const response = await API.get(`/user/profile/${userId}`);
  return response.data; // Ensure this matches your ProfileResponse type
};

// New Business Fetcher
export const getBusinessQueryFn = async (businessId: string): Promise<CurrentUserResponseType> => {
  // This fetches the user data associated with this business ID
  const response = await API.get(`/user/business/profile/${businessId}`);
  return response.data;
};

// Update Personal Profile (Handles Multipart/Form-Data for images)

export const updateProfileMutationFn = async (data: {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePicture?: File | string | null;
  coverPicture?: File | string | null;
}) => {
  const payload = { ...data };

  // 1. Upload Profile Picture if it's a new File
  if (data.profilePicture instanceof File) {
    payload.profilePicture = await uploadImageToCloudinary(data.profilePicture);
  }

  // 2. Upload Cover Photo if it's a new File
  if (data.coverPicture instanceof File) {
    payload.coverPicture = await uploadImageToCloudinary(data.coverPicture);
  }

  // 3. Send clean JSON to your backend
  // Note: We are no longer using multipart/form-data headers here!
  const response = await API.patch(`/user/profile/update`, payload);
  return response.data;
};



// src/hooks/api/use-user-mutations.ts
export const updateBusinessMutationFn = async (data: any) => {
  const payload = { ...data };

  const handleImage = async (_field: string, value: any) => {
    if (value instanceof File) {
      // User uploaded a new file
      return await uploadImageToCloudinary(value);
    } else if (value === "DELETE_IMAGE") {
      // User explicitly wants to remove the photo
      return null;
    } else {
      // No change made (value is undefined or the existing URL)
      return undefined;
    }
  };

  const logo = await handleImage('businessLogo', data.businessLogo);
  const cover = await handleImage('businessCover', data.businessCover);

  // If the result is undefined, we remove the key so it doesn't overwrite DB
  if (logo === undefined) delete payload.businessLogo; else payload.businessLogo = logo;
  if (cover === undefined) delete payload.businessCover; else payload.businessCover = cover;

  const response = await API.patch(`/user/business/update`, payload);
  return response.data;
};


export const fetchChatList = async () => {
  const response = await API.get('/chat/conversations/list');
  return response.data.data; // Assuming response.data is { success: true, data: [...] }
};

export const fetchActivityList = async () => {
  const response = await API.get('/log/activities');
  console.log('response', response);
  return response.data;
}

export const fetchBookmarkList = async () => {
  const response = await API.get('/bookmark/list');
  return response.data.bookmarks;
}


export const fetchBookmarksLoad = async (type: 'Post' | 'Business') => {
  // We pass the type as a query parameter as expected by our controller
  const response = await API.get(`/bookmark/load?type=${type}`);
  return response.data;
};

export const fetchPostFeedQueryFn = async (userId?: string, page: number = 1): Promise<UnifiedPost[]> => {
  const url = userId
    ? `/post/feed?userId=${userId}&page=${page}`
    : `/post/feed?page=${page}`;

  const response = await API.get(url);
  return response.data.posts;
};

// src/services/post.service.ts


interface FetchParams {
  targetId?: string;
  restrict?: boolean;
  page: number;
}

export const postService = {
  // Fetch Social Content
  getSocialPosts: async ({ targetId, restrict, page }: FetchParams): Promise<UnifiedPost[]> => {
    const { data } = await API.get("/post/social", {
      params: { authorId: targetId, restrict, page, limit: 15 }
    });
    return data.posts;
  },

  // Fetch Business Content
  getProductPosts: async ({ targetId, restrict, page }: FetchParams): Promise<ProductPostType[]> => {
    const { data } = await API.get("/post/product", {
      params: { businessId: targetId, restrict, page, limit: 15 }
    });
    return data.posts;
  },

  updatePost: async (postId: string, data: { caption?: string; tags?: string[]; media?: string[] }) => {
    const response = await API.patch(`/post/${postId}?type=post`, data);
    return response.data.data;
  },

  updateProduct: async (productId: string, data: any) => {
    const response = await API.patch(`/post/${productId}?type=product`, data);
    return response.data.data;
  },

  deletePost: async (postId: string, type: 'post' | 'product' = 'post') => {
  await API.delete(`/post/${postId}?type=${type}`);
},
};



export const createPostMutationFn = async ({ data, files }: { data: any; files: File[] }) => {
  // 1. Upload media only if files exist
  let mediaUrls: string[] = [];
  if (files && files.length > 0) {
    mediaUrls = await Promise.all(
      files.map((file) => uploadMediaToCloudinary(file))
    );
  }

  // 2. Build the payload
  // If a product is linked, we ensure media is the uploaded list or empty
  const payload = {
    ...data,
    media: mediaUrls,
  };

  const response = await API.post("/post/create", payload);
  return response.data;
};


// --- api.service.ts ---
export const toggleFollowUser = async (targetId: string, isBusiness: boolean) => {
  // We pass isBusiness in the body as your controller expects
  const response = await API.post(`/user/follow/${targetId}`, { isBusiness });
  return response.data;
};


export const toggleBookmarkApi = async (targetId: string, targetType: "Business" | "Post") => {
  const { data } = await API.post(`/user/bookmarks/toggle/${targetId}`, {
    targetType,
  });
  return data;
};

// src/services/product.service.ts

export const toggleWishlist = async (productId: string) => {
  const { data } = await API.patch(`/products/wishlist/${productId}`);
  return data; // returns { success: true, isWishlisted: boolean }
};

export const toggleLikeApi = async (targetId: string, targetType: 'post' | 'product') => {
  const { data } = await API.patch(`/post/likes/${targetType}/${targetId}`);
  return data; // { success: true, isLiked: boolean, likesCount: number }
};

export const fetchFollowList = async (targetId: string, type: "followers" | "following") => {
  // Replace with your actual API base URL
  const { data } = await API.get(`/user/${targetId}/social`, {
    params: { type }
  });
  return data.users; // Returning the 'users' array from your controller's res.json
};


export const searchAPI = {
  getGlobalSearch: (params: {
    q: string;
    type?: 'all' | 'business' | 'user' | 'product' | 'post';
    category?: string;
    city?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string;       // Added for Post filtering
    isBusiness?: boolean;
    inStock?: boolean;   // Added for Product filtering
    openNow?: boolean;   // Added for Business filtering
    rating?: number;     // Added for Business/Product filtering
  }) => API.get('/search', { params }),

  // History Management
  getRecentSearches: () => API.get('/search/recent'),

  saveToHistory: (query: string) => API.post('/search/history', { query }),

  deleteHistoryItem: (id: string) => API.delete(`/search/history/${id}`),

  clearAllHistory: () => API.delete('/search/history'),
};


// src/services/category-service.ts

export const fetchProductCategories = async (): Promise<string[]> => {
  const { data } = await API.get('/product/product-categories'); // Update with your actual base URL

  return data.data; // This is the array of strings from your backend
};

export const cartAPI = {
  // Get current user's cart
  getCart: () => API.get('/cart'),

  // Add item: { productId, quantity }
  addToCart: (data: { productId: string; quantity: number }) => 
    API.post('/cart/add', data),

  // Update quantity: { productId, quantity }
  updateQuantity: (data: { productId: string; quantity: number }) => 
    API.put('/cart/update', data),

  // Remove item
  removeFromCart: (productId: string) => 
    API.delete(`/cart/remove/${productId}`),
};

export const orderAPI = {
  // Checkout: { shippingAddress: { fullAddress, city, phone }, paymentMethod }
  checkout: (data: { 
    shippingAddress: { fullAddress: string; city: string; phone: string }; 
    paymentMethod: string;
  }) => API.post('/order/checkout', data),

  // Get all user orders
  getMyOrders: () => API.get('/order/my-orders'),

  // Get specific order
  getOrderById: (id: string) => API.get(`/order/${id}`),
};


export interface CreateReviewData {
  reviewedItem: string;
  reviewedItemModel: 'Business' | 'Product';
  rating: number;
  comment?: string;
}

export const reviewAPI = {
  // Get reviews for a specific item
  getItemReviews: (itemId: string) => API.get(`/reviews/item/${itemId}`),

  // Create a new review
  createReview: (data: CreateReviewData) => API.post('/reviews', data),

  // Update an existing review
  updateReview: (id: string, data: { rating?: number; comment?: string }) => 
    API.patch(`/reviews/${id}`, data),

  // Delete a review
  deleteReview: (id: string) => API.delete(`/reviews/${id}`),

  // Toggle Like
  likeReview: (id: string) => API.post(`/reviews/${id}/like`),

  // Toggle Dislike
  dislikeReview: (id: string) => API.post(`/reviews/${id}/dislike`),
};