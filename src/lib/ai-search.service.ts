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
    description: string;
    subtitle: string;
    image: string | null;
    price: number | null;
    rating: number | null;
    location: string | null;
    inStock: boolean | null;
    score: number;
    /** Raw object after _source unwrapping — used for dev debug overlay */
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pickString(obj: Record<string, unknown>, keys: string[]): string {
    for (const key of keys) {
        const val = obj[key];
        if (val && typeof val === 'string' && val.trim()) return val.trim();
    }
    return '';
}

function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
    for (const key of keys) {
        const val = obj[key];
        if (typeof val === 'number' && !isNaN(val)) return val;
        if (typeof val === 'string' && val.trim()) {
            const n = parseFloat(val);
            if (!isNaN(n)) return n;
        }
    }
    return null;
}

/**
 * Unwrap Elasticsearch-style envelope.
 * Some search backends wrap the document inside `_source`, `source`, `document`,
 * or `hit` before returning it. We peel that off so the normaliser always sees
 * the flat document fields.
 */
function unwrap(raw: Record<string, unknown>): Record<string, unknown> {
    // If the object has a _source key that is itself an object, use that as the
    // document — but keep score from the outer envelope.
    const score = raw.score ?? raw._score ?? raw.similarity;
    for (const key of ['_source', 'source', 'document', 'hit', 'data', 'item']) {
        const inner = raw[key];
        if (inner && typeof inner === 'object' && !Array.isArray(inner)) {
            const unwrapped = inner as Record<string, unknown>;
            // Preserve outer score if inner doesn't have one
            if (score !== undefined && unwrapped.score === undefined) {
                unwrapped._outerScore = score;
            }
            return unwrapped;
        }
    }
    return raw;
}

// ─── Type detection ───────────────────────────────────────────────────────────

function detectType(raw: Record<string, unknown>): 'business' | 'product' {
    const t = String(raw.type ?? raw.entity_type ?? raw.entityType ?? raw.kind ?? '').toLowerCase();
    if (t === 'business') return 'business';
    if (t === 'product') return 'product';

    // Field-based heuristics
    if (raw.businessName || raw.businessLogo || raw.businessCategory || raw.businessType || raw.isOpen !== undefined) {
        return 'business';
    }
    return 'product';
}

// ─── Normaliser ───────────────────────────────────────────────────────────────

function normaliseResult(id: string, envelope: Record<string, unknown>): AISearchResult {
    const raw = unwrap(envelope);

    const score = pickNumber(raw, ['score', '_score', '_outerScore', 'similarity', 'relevance'])
        ?? pickNumber(envelope, ['score', '_score', 'similarity'])
        ?? 0;

    const type = detectType(raw);

    // ── Common image picker (handles both direct URL and array) ───────────────
    function pickImage(obj: Record<string, unknown>, keys: string[]): string | null {
        for (const key of keys) {
            const val = obj[key];
            if (typeof val === 'string' && val.trim()) return val.trim();
            if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') return val[0];
        }
        return null;
    }

    if (type === 'business') {
        const address = (raw.address ?? raw.location ?? {}) as Record<string, unknown>;

        const locationStr =
            pickString(typeof address === 'object' && address !== null ? address as Record<string, unknown> : {}, [
                'fullAddress', 'address', 'street', 'city', 'state',
            ]) || pickString(raw, ['city', 'state', 'location', 'address', 'area']);

        return {
            id,
            type: 'business',
            name: pickString(raw, [
                'businessName', 'business_name', 'name', 'title', 'companyName',
                'company_name', 'storeName', 'store_name', 'shopName', 'shop_name',
                'displayName', 'display_name',
            ]) || 'Unnamed Business',
            subtitle: pickString(raw, [
                'category', 'businessCategory', 'business_category', 'businessType',
                'business_type', 'industry', 'sector', 'type',
            ]),
            image: pickImage(raw, [
                'businessLogo', 'business_logo', 'logo', 'logoUrl', 'logo_url',
                'image', 'imageUrl', 'image_url', 'photo', 'avatar', 'thumbnail',
                'profilePicture', 'profile_picture', 'coverPicture', 'cover',
            ]),
            price: null,
            rating: pickNumber(raw, ['averageRating', 'average_rating', 'rating', 'avgRating', 'avg_rating', 'stars']),
            location: locationStr || null,
            inStock: null,
            score,
            raw,
        };
    }

    // product
    const bizInfo = (raw.business ?? raw.businessInfo ?? raw.vendor ?? raw.seller ?? {}) as Record<string, unknown>;

    const storeName =
        pickString(typeof bizInfo === 'object' && bizInfo !== null ? bizInfo as Record<string, unknown> : {}, [
            'businessName', 'business_name', 'name', 'storeName', 'store_name',
        ]) || pickString(raw, [
            'businessName', 'business_name', 'storeName', 'store_name',
            'vendorName', 'vendor_name', 'sellerName', 'seller_name', 'brand',
        ]);

    return {
        id,
        type: 'product',
        name: pickString(raw, [
            // Most common first
            'name', 'productName', 'product_name', 'title', 'productTitle',
            'product_title', 'itemName', 'item_name', 'label', 'displayName',
            'display_name', 'description', // last resort — at least show something
        ]) || 'Unnamed Product',
        subtitle: storeName,
        image: pickImage(raw, [
            'media', 'images', 'photos', 'image', 'imageUrl', 'image_url',
            'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'photo', 'cover',
            'picture', 'productImage', 'product_image',
        ]),
        price: pickNumber(raw, ['price', 'amount', 'cost', 'sellingPrice', 'selling_price', 'salePrice', 'sale_price', 'unitPrice', 'unit_price']),
        rating: pickNumber(raw, ['averageRating', 'average_rating', 'rating', 'avgRating', 'avg_rating', 'stars']),
        location: null,
        inStock: raw.inStock !== undefined
            ? Boolean(raw.inStock)
            : raw.in_stock !== undefined
                ? Boolean(raw.in_stock)
                : raw.stock !== undefined
                    ? Number(raw.stock) > 0
                    : raw.quantity !== undefined
                        ? Number(raw.quantity) > 0
                        : null,
        score,
        raw,
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const aiSearchService = {
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

    healthCheck: async (): Promise<boolean> => {
        try {
            await aiSearchClient.get('/health');
            return true;import axios from 'axios';

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
                description: string;   // always present; empty string when unavailable
                subtitle: string;
                image: string | null;
                price: number | null;
                rating: number | null;
                location: string | null;
                inStock: boolean | null;
                score: number;
                /** Raw object after _source unwrapping — used for dev debug overlay */
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

            function pickString(obj: Record<string, unknown>, keys: string[]): string {
                for (const key of keys) {
                    const val = obj[key];
                    if (val && typeof val === 'string' && val.trim()) return val.trim();
                }
                return '';
            }

            function pickNumber(obj: Record<string, unknown>, keys: string[]): number | null {
                for (const key of keys) {
                    const val = obj[key];
                    if (typeof val === 'number' && !isNaN(val)) return val;
                    if (typeof val === 'string' && val.trim()) {
                        const n = parseFloat(val);
                        if (!isNaN(n)) return n;
                    }
                }
                return null;
            }

            /**
             * Unwrap Elasticsearch-style envelope.
             * Some search backends wrap the document inside `_source`, `source`, `document`,
             * or `hit` before returning it. We peel that off so the normaliser always sees
             * the flat document fields.
             */
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

// ─── Type detection ───────────────────────────────────────────────────────────

            function detectType(raw: Record<string, unknown>): 'business' | 'product' {
                const t = String(raw.type ?? raw.entity_type ?? raw.entityType ?? raw.kind ?? '').toLowerCase();
                if (t === 'business') return 'business';
                if (t === 'product') return 'product';

                if (raw.businessName || raw.businessLogo || raw.businessCategory || raw.businessType || raw.isOpen !== undefined) {
                    return 'business';
                }
                return 'product';
            }

// ─── Normaliser ───────────────────────────────────────────────────────────────

            function normaliseResult(id: string, envelope: Record<string, unknown>): AISearchResult {
                const raw = unwrap(envelope);

                const score = pickNumber(raw, ['score', '_score', '_outerScore', 'similarity', 'relevance'])
                    ?? pickNumber(envelope, ['score', '_score', 'similarity'])
                    ?? 0;

                const type = detectType(raw);

                function pickImage(obj: Record<string, unknown>, keys: string[]): string | null {
                    for (const key of keys) {
                        const val = obj[key];
                        if (typeof val === 'string' && val.trim()) return val.trim();
                        if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'string') return val[0];
                    }
                    return null;
                }

                if (type === 'business') {
                    const address = (raw.address ?? raw.location ?? {}) as Record<string, unknown>;

                    const locationStr =
                        pickString(typeof address === 'object' && address !== null ? address as Record<string, unknown> : {}, [
                            'fullAddress', 'address', 'street', 'city', 'state',
                        ]) || pickString(raw, ['city', 'state', 'location', 'address', 'area']);

                    return {
                        id,
                        type: 'business',
                        name: pickString(raw, [
                            'businessName', 'business_name', 'name', 'title', 'companyName',
                            'company_name', 'storeName', 'store_name', 'shopName', 'shop_name',
                            'displayName', 'display_name',
                        ]) || 'Unnamed Business',
                        description: pickString(raw, [
                            'description', 'bio', 'about', 'summary', 'tagline', 'blurb',
                        ]),
                        subtitle: pickString(raw, [
                            'category', 'businessCategory', 'business_category', 'businessType',
                            'business_type', 'industry', 'sector', 'type',
                        ]),
                        image: pickImage(raw, [
                            'businessLogo', 'business_logo', 'logo', 'logoUrl', 'logo_url',
                            'image', 'imageUrl', 'image_url', 'photo', 'avatar', 'thumbnail',
                            'profilePicture', 'profile_picture', 'coverPicture', 'cover',
                        ]),
                        price: null,
                        rating: pickNumber(raw, ['averageRating', 'average_rating', 'rating', 'avgRating', 'avg_rating', 'stars']),
                        location: locationStr || null,
                        inStock: null,
                        score,
                        raw,
                    };
                }

                // product
                const bizInfo = (raw.business ?? raw.businessInfo ?? raw.vendor ?? raw.seller ?? {}) as Record<string, unknown>;

                const storeName =
                    pickString(typeof bizInfo === 'object' && bizInfo !== null ? bizInfo as Record<string, unknown> : {}, [
                        'businessName', 'business_name', 'name', 'storeName', 'store_name',
                    ]) || pickString(raw, [
                        'businessName', 'business_name', 'storeName', 'store_name',
                        'vendorName', 'vendor_name', 'sellerName', 'seller_name', 'brand',
                    ]);

                return {
                    id,
                    type: 'product',
                    name: pickString(raw, [
                        'name', 'productName', 'product_name', 'title', 'productTitle',
                        'product_title', 'itemName', 'item_name', 'label', 'displayName',
                        'display_name', 'description',
                    ]) || 'Unnamed Product',
                    description: pickString(raw, [
                        'description', 'productDescription', 'product_description',
                        'details', 'summary', 'blurb', 'about',
                    ]),
                    subtitle: storeName,
                    image: pickImage(raw, [
                        'media', 'images', 'photos', 'image', 'imageUrl', 'image_url',
                        'thumbnail', 'thumbnailUrl', 'thumbnail_url', 'photo', 'cover',
                        'picture', 'productImage', 'product_image',
                    ]),
                    price: pickNumber(raw, ['price', 'amount', 'cost', 'sellingPrice', 'selling_price', 'salePrice', 'sale_price', 'unitPrice', 'unit_price']),
                    rating: pickNumber(raw, ['averageRating', 'average_rating', 'rating', 'avgRating', 'avg_rating', 'stars']),
                    location: null,
                    inStock: raw.inStock !== undefined
                        ? Boolean(raw.inStock)
                        : raw.in_stock !== undefined
                            ? Boolean(raw.in_stock)
                            : raw.stock !== undefined
                                ? Number(raw.stock) > 0
                                : raw.quantity !== undefined
                                    ? Number(raw.quantity) > 0
                                    : null,
                    score,
                    raw,
                };
            }

// ─── Service ──────────────────────────────────────────────────────────────────

            export const aiSearchService = {
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

            export const flattenResults = (
                results: Record<string, Record<string, unknown>>
            ): AISearchResult[] => {
                if (import.meta.env.DEV) {
                    console.group(`[AI Search] ${Object.keys(results).length} raw result(s)`);
                    Object.entries(results).forEach(([id, raw], i) => {
                        console.group(`Result #${i + 1} — id key: "${id}"`);
                        const unwrapped = unwrap(raw);
                        console.log('Envelope keys:', Object.keys(raw));
                        console.log('Unwrapped keys:', Object.keys(unwrapped));
                        console.log('Full unwrapped object:', unwrapped);
                        console.groupEnd();
                    });
                    console.groupEnd();
                }

                return Object.entries(results)
                    .map(([id, raw]) => normaliseResult(id, raw))
                    .sort((a, b) => b.score - a.score);
            };

            /** Expose unwrap for use in the debug card overlay */
            export { unwrap };
        } catch {
            return false;
        }
    },
};

// ─── flatten ─────────────────────────────────────────────────────────────────

export const flattenResults = (
    results: Record<string, Record<string, unknown>>
): AISearchResult[] => {
    if (import.meta.env.DEV) {
        // Log ALL raw entries so you can see every field from the real API
        console.group(`[AI Search] ${Object.keys(results).length} raw result(s)`);
        Object.entries(results).forEach(([id, raw], i) => {
            console.group(`Result #${i + 1} — id key: "${id}"`);
            const unwrapped = unwrap(raw);
            console.log('Envelope keys:', Object.keys(raw));
            console.log('Unwrapped keys:', Object.keys(unwrapped));
            console.log('Full unwrapped object:', unwrapped);
            console.groupEnd();
        });
        console.groupEnd();
    }

    return Object.entries(results)
        .map(([id, raw]) => normaliseResult(id, raw))
        .sort((a, b) => b.score - a.score);
};

/** Expose unwrap for use in the debug card overlay */
export { unwrap };