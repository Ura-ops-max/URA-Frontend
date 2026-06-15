// src/types/product.ts
export interface Product {
  id: number;
  name: string;
  category: string; // <-- New field
  imageUrl: string;
  description: string;
  price: number;
  stock: number;
}

// src/types/product.ts (Adding a new interface)
// src/types/product.ts (Adding and updating interfaces)

export interface Seller {
  name: string;
  profileImageUrl: string;
  followers: string;
  rating: number;
}

export interface SingleProduct {
  id: number;
  name: string;
  imageUrl: string;
  description: string;
  price: number;
  availableStocks: number;
  size: string;
  currencySymbol: string;
  seller: Seller;
}

// src/types/product.ts (Adding Category type)
export interface ProductCategory {
  id: string;
  name: string;
}

// --- New Definition for Product Card Display ---
export interface ProductCardProps {
  id: string;
  name: string;
  image: string; // URL or path to the main product image
  merchant: string; // Name of the merchant/shop that posted the product
  photoCount: number; // Total number of media/photos associated with the product
  likes: number; // Total number of likes/saves
  price?: string; // Optional: Price string (if displayed on the card)
}

// --- Updated/Added Types ---

export interface Product {
  _id: string; // Backend uses MongoDB _id
  name: string;
  category: string;
  media: string[]; // Backend uses 'media' for consistency
  description: string;
  price: number;
  stock: number;
  size?: string;
  business?: string; // ID of the business owner
}

// Payload for the /create endpoint
export interface CreatePostPayload {
  type: 'POST' | 'PRODUCT';
  caption: string;
  tags?: string[];
  media?: string[];
  // Product specific (Required if type is PRODUCT)
  productId?: string; // For Requirement 6: Linking existing
  productName?: string;
  category?: string;
  description?: string;
  price?: number;
  stock?: number;
  size?: string;
  publishToFeed?: boolean;
}

export interface PostResponse {
  success: boolean;
  data: any;
  message?: string;
}
