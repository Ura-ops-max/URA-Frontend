import axios from 'axios';

const AI_SEARCH_BASE_URL = import.meta.env.VITE_AI_SEARCH_BASE_URL || '/prod';

const aiSearchClient = axios.create({
    baseURL: AI_SEARCH_BASE_URL,
    timeout: 15000,
});

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TextSearchRequest {
    q: string;
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
    description?: string;
    score: number;
    image?: string;
    price?: number;
    category?: string;
    location?: string;
    [key: string]: unknown;
}

export interface AISearchResponse {
    query: string;
    geo_active: boolean;
    results: Record<string, AISearchResult>;
    total: number;
}

export interface ImageSearchResponse {
    query_description?: string;
    geo_active: boolean;
    results: Record<string, AISearchResult>;
    total: number;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiSearchService = {
    /**
     * Semantic text search across businesses and products.
     * Uses Amazon Bedrock Titan Text V2 for vector conversion.
     */
    textSearch: async (params: TextSearchRequest): Promise<AISearchResponse> => {
        const { data } = await aiSearchClient.post<AISearchResponse>('/search', {
            q: params.q,
            lat: params.lat,
            lng: params.lng,
            radius_km: params.radius_km ?? 10,
            business_limit: params.business_limit ?? 5,
            product_limit: params.product_limit ?? 10,
        });
        return data;
    },

    /**
     * Semantic image search — finds visually/contextually similar businesses & products.
     * Accepts a File object (JPEG, PNG, WebP, etc.)
     */
    imageSearch: async (
        imageFile: File,
        options?: { lat?: number; lng?: number; radius_km?: number }
    ): Promise<ImageSearchResponse> => {
        const formData = new FormData();
        formData.append('file', imageFile);
        if (options?.lat !== undefined) formData.append('lat', String(options.lat));
        if (options?.lng !== undefined) formData.append('lng', String(options.lng));
        if (options?.radius_km !== undefined)
            formData.append('radius_km', String(options.radius_km));

        const { data } = await aiSearchClient.post<ImageSearchResponse>(
            '/search/image',
            formData,
            { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        return data;
    },

    /** Health ping — useful for detecting if the AI search service is reachable */
    healthCheck: async (): Promise<boolean> => {
        try {
            await aiSearchClient.get('/health');
            return true;
        } catch {
            return false;
        }
    },
};

/** Normalise the results map into a flat sorted array */
export const flattenResults = (
    results: Record<string, AISearchResult>
): AISearchResult[] =>
    Object.values(results).sort((a, b) => b.score - a.score);