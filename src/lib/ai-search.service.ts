import axios from 'axios';

const AI_SEARCH_BASE_URL = import.meta.env.VITE_AI_SEARCH_BASE_URL || '/prod';

const aiSearchClient = axios.create({
  baseURL: AI_SEARCH_BASE_URL,
  timeout: 15000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextSearchRequest {
    q: string;
    category?: string;
    lat?: number;
    lng?: number;
    radius_km?: number;
    business_limit?: number;
    product_limit?: number;
}

export interface AISearchResult {
  id: string;
  type: 'business' | 'product';
  name: string;
  description: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  rating: number | null;
  location: string | null;
  inStock: boolean | null;
  score: number;
  raw: Record<string, unknown>;
}

export interface AISearchResponse {
  query: string;
  geo_active: boolean;
  results: Record<string, Record<string, unknown>>;
  total: number;
}

export interface ImageSearchResponse {
  query_description?: string;
  geo_active: boolean;
  results: Record<string, Record<string, unknown>>;
  total: number;
}

function unwrap(raw: Record<string, unknown>): Record<string, unknown> {
  const score = raw.score ?? raw._score ?? raw.similarity;
  for (const key of ['_source', 'source', 'document', 'hit', 'data', 'item']) {
    const inner = raw[key];
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
      const unwrapped = inner as Record<string, unknown>;
      if (score !== undefined && unwrapped.score === undefined) {
        unwrapped._outerScore = score;
      }
      return unwrapped;
    }
  }
  return raw;
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const aiSearchService = {
    textSearch: async (params: TextSearchRequest): Promise<AISearchResponse> => {
        const { data } = await aiSearchClient.post<AISearchResponse>('/search', {
            q: params.q,
            category: params.category,
            lat: params.lat,
            lng: params.lng,
            radius_km: params.radius_km ?? 10,
            business_limit: params.business_limit ?? 5,
            product_limit: params.product_limit ?? 10,
        });

    console.log(`Data from aiSearch service: ${data.results}`);
    return data;
  },

  imageSearch: async (
    imageFile: File,
    options?: { lat?: number; lng?: number; radius_km?: number },
  ): Promise<ImageSearchResponse> => {
    const formData = new FormData();
    formData.append('file', imageFile);
    if (options?.lat !== undefined) formData.append('lat', String(options.lat));
    if (options?.lng !== undefined) formData.append('lng', String(options.lng));
    if (options?.radius_km !== undefined) formData.append('radius_km', String(options.radius_km));

    const { data } = await aiSearchClient.post<ImageSearchResponse>('/search/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  healthCheck: async (): Promise<boolean> => {
    try {
      await aiSearchClient.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};

// ─── flatten ─────────────────────────────────────────────────────────────────
export function flattenResults(results: Record<string, unknown>): AISearchResult[] {
  const flat: AISearchResult[] = [];

  const businesses = results['businesses'];
  const products = results['products'];

  if (Array.isArray(businesses)) {
    for (const biz of businesses as Record<string, unknown>[]) {
      flat.push({
        id: biz['_id'] as string,
        type: 'business',
        name: (biz['businessName'] as string) ?? 'Unnamed Business',
        description: (biz['about'] as string) ?? '',
        subtitle: (biz['category'] as string) ?? '',
        image: (biz['businessLogo'] as string) ?? null,
        price: null,
        rating: (biz['averageRating'] as number) ?? null,
        inStock: null,
        location: (biz as any)?.address?.fullAddress ?? null,
        score: (biz['final_score'] as number) ?? 0,
        raw: biz,
      });
    }
  }

  if (Array.isArray(products)) {
    for (const prod of products as Record<string, unknown>[]) {
      const mediaArr = prod['media'] as string[] | undefined;
      flat.push({
        id: prod['_id'] as string,
        type: 'product',
        name: (prod['name'] as string) ?? 'Unnamed Product',
        description: (prod['description'] as string) ?? '',
        subtitle: (prod['category'] as string) ?? '',
        image: mediaArr?.[0] ?? null,
        price: (prod['price'] as number) ?? null,
        rating: (prod['averageRating'] as number) ?? null,
        inStock: typeof prod['stock'] === 'number' ? (prod['stock'] as number) > 0 : null,
        location: null,
        score: (prod['final_score'] as number) ?? 0,
        raw: prod,
      });
    }
  }

  return flat;
}

/** Expose unwrap for use in the debug card overlay */
export { unwrap };
