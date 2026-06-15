import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  Search,
  ImageIcon,
  X,
  MapPin,
  Loader2,
  AlertCircle,
  Building2,
  Package,
} from 'lucide-react';
import { aiSearchService, flattenResults } from '@/lib/ai-search.service';
import type {
  AISearchResult,
  AISearchResponse,
  ImageSearchResponse,
} from '@/lib/ai-search.service';

// ─── Types ────────────────────────────────────────────────────────────────────

type SearchMode = 'text' | 'image';

interface SearchState {
  mode: SearchMode;
  query: string;
  imageFile: File | null;
  imagePreview: string | null;
  useGeo: boolean;
  userCoords: { lat: number; lng: number } | null;
  results: AISearchResult[];
  isLoading: boolean;
  error: string | null;
  total: number;
  geoActive: boolean;
  hasSearched: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ResultCard = ({ result }: { result: AISearchResult }) => {
  const isBusiness = result.type === 'business';

  return (
    <div className="group flex gap-3 p-3 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer">
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
        {result.image ? (
          <img src={result.image} alt={result.name} className="w-full h-full object-cover" />
        ) : isBusiness ? (
          <Building2 className="w-6 h-6 text-gray-400" />
        ) : (
          <Package className="w-6 h-6 text-gray-400" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-blue-700 transition-colors">
            {result.name}
          </p>
          <span
            className={`flex-shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${
              isBusiness ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'
            }`}
          >
            {isBusiness ? 'Business' : 'Product'}
          </span>
        </div>

        {result.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{result.description}</p>
        )}

        <div className="flex items-center gap-3 mt-1.5">
          {/* Fix: price is number | null, not number | undefined */}
          {result.price !== null && (
            <span className="text-xs font-medium text-gray-700">
              ₦{result.price.toLocaleString()}
            </span>
          )}
          {result.subtitle && <span className="text-xs text-gray-400">{result.subtitle}</span>}
          {result.location && (
            <span className="flex items-center gap-0.5 text-xs text-gray-400">
              <MapPin className="w-3 h-3" />
              {result.location}
            </span>
          )}
          {/* Relevance score pill */}
          <span className="ml-auto text-[10px] text-gray-300">
            {Math.round(result.score * 100)}% match
          </span>
        </div>
      </div>
    </div>
  );
};

const EmptyState = ({ mode }: { mode: SearchMode }) => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    {mode === 'text' ? (
      <Search className="w-10 h-10 text-gray-200 mb-3" />
    ) : (
      <ImageIcon className="w-10 h-10 text-gray-200 mb-3" />
    )}
    <p className="text-sm text-gray-400">
      {mode === 'text'
        ? 'Type something to search across businesses & products'
        : 'Upload an image to find visually similar results'}
    </p>
  </div>
);

const NoResults = () => (
  <div className="flex flex-col items-center justify-center py-10 text-center">
    <AlertCircle className="w-10 h-10 text-gray-200 mb-3" />
    <p className="text-sm font-medium text-gray-500">No results found</p>
    <p className="text-xs text-gray-400 mt-1">Try a different query or expand your search radius</p>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export const ImageSearch = () => {
  const [state, setState] = useState<SearchState>({
    mode: 'text',
    query: '',
    imageFile: null,
    imagePreview: null,
    useGeo: false,
    userCoords: null,
    results: [],
    isLoading: false,
    error: null,
    total: 0,
    geoActive: false,
    hasSearched: false,
  });

  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Geo ────────────────────────────────────────────────────────────────────

  const requestGeo = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setState((s) => ({
          ...s,
          userCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude },
          useGeo: true,
        }));
      },
      () => {
        setState((s) => ({ ...s, useGeo: false }));
      },
    );
  }, []);

  const toggleGeo = () => {
    if (!state.useGeo) {
      requestGeo();
    } else {
      setState((s) => ({ ...s, useGeo: false, userCoords: null }));
    }
  };

  // ─── Text Search ─────────────────────────────────────────────────────────────

  const runTextSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setState((s) => ({ ...s, results: [], hasSearched: false, total: 0 }));
        return;
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      try {
        const res: AISearchResponse = await aiSearchService.textSearch({
          q: query,
          ...(state.useGeo && state.userCoords
            ? { lat: state.userCoords.lat, lng: state.userCoords.lng, radius_km: 10 }
            : {}),
        });

        setState((s) => ({
          ...s,
          results: flattenResults(res.results),
          total: res.total,
          geoActive: res.geo_active,
          hasSearched: true,
          isLoading: false,
        }));
      } catch {
        setState((s) => ({
          ...s,
          error: 'Search failed. Please try again.',
          isLoading: false,
          hasSearched: true,
        }));
      }
    },
    [state.useGeo, state.userCoords],
  );

  // Debounced text search
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setState((s) => ({ ...s, query: value }));

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runTextSearch(value);
    }, 450);
  };

  // ─── Image Search ─────────────────────────────────────────────────────────

  const handleImageSelect = async (file: File) => {
    const preview = URL.createObjectURL(file);
    setState((s) => ({
      ...s,
      imageFile: file,
      imagePreview: preview,
      isLoading: true,
      error: null,
      hasSearched: false,
    }));

    try {
      const res: ImageSearchResponse = await aiSearchService.imageSearch(
        file,
        state.useGeo && state.userCoords ? state.userCoords : undefined,
      );

      setState((s) => ({
        ...s,
        results: flattenResults(res.results),
        total: res.total,
        geoActive: res.geo_active,
        hasSearched: true,
        isLoading: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        error: 'Image search failed. Please try again.',
        isLoading: false,
        hasSearched: true,
      }));
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) handleImageSelect(file);
  };

  const clearImage = () => {
    if (state.imagePreview) URL.revokeObjectURL(state.imagePreview);
    setState((s) => ({
      ...s,
      imageFile: null,
      imagePreview: null,
      results: [],
      hasSearched: false,
      total: 0,
    }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ─── Mode Switch ──────────────────────────────────────────────────────────

  const switchMode = (mode: SearchMode) => {
    setState((s) => ({
      ...s,
      mode,
      query: '',
      imageFile: null,
      imagePreview: null,
      results: [],
      error: null,
      hasSearched: false,
      total: 0,
    }));
    if (mode === 'text') setTimeout(() => inputRef.current?.focus(), 50);
  };

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (state.imagePreview) URL.revokeObjectURL(state.imagePreview);
    };
  }, [state.imagePreview]);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-3">
      {/* Mode Toggle */}
      <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
        {(['text', 'image'] as SearchMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              state.mode === m
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'text' ? (
              <>
                <Search className="w-4 h-4" /> Text Search
              </>
            ) : (
              <>
                <ImageIcon className="w-4 h-4" /> Image Search
              </>
            )}
          </button>
        ))}
      </div>

      {/* Input Area */}
      {state.mode === 'text' ? (
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={state.query}
            onChange={handleQueryChange}
            placeholder="Search businesses, products, services…"
            className="w-full pl-10 pr-24 py-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {/* Geo toggle */}
            <button
              onClick={toggleGeo}
              title={state.useGeo ? 'Disable location filter' : 'Enable location filter'}
              className={`p-1.5 rounded-lg transition-colors ${
                state.useGeo
                  ? 'bg-blue-100 text-blue-600'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            {/* Clear */}
            {state.query && (
              <button
                onClick={() => {
                  setState((s) => ({ ...s, query: '', results: [], hasSearched: false }));
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Image drop zone */
        <div
          onDrop={handleFileDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => !state.imagePreview && fileInputRef.current?.click()}
          className={`relative rounded-xl border-2 border-dashed transition-all duration-200 ${
            state.imagePreview
              ? 'border-transparent'
              : 'border-gray-200 hover:border-blue-300 bg-gray-50 hover:bg-blue-50/30 cursor-pointer'
          }`}
        >
          {state.imagePreview ? (
            <div className="relative rounded-xl overflow-hidden">
              <img
                src={state.imagePreview}
                alt="Search preview"
                className="w-full max-h-48 object-cover"
              />
              <button
                onClick={clearImage}
                className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2 text-center px-4">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">
                Drop an image here or <span className="text-blue-600 font-medium">browse</span>
              </p>
              <p className="text-xs text-gray-400">JPEG, PNG, WebP supported</p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageSelect(file);
            }}
          />
        </div>
      )}

      {/* Geo badge */}
      {state.useGeo && state.userCoords && (
        <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-1.5">
          <MapPin className="w-3.5 h-3.5" />
          <span>Filtering by your location · 10 km radius</span>
        </div>
      )}

      {/* Error */}
      {state.error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {state.error}
        </div>
      )}

      {/* Results */}
      <div className="min-h-[120px]">
        {state.isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            <p className="text-sm text-gray-400">
              {state.mode === 'image' ? 'Analysing image…' : 'Searching…'}
            </p>
          </div>
        ) : !state.hasSearched ? (
          <EmptyState mode={state.mode} />
        ) : state.results.length === 0 ? (
          <NoResults />
        ) : (
          <>
            {/* Results header */}
            <div className="flex items-center justify-between mb-2 px-1">
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-700">{state.total}</span> results
                {state.geoActive && ' near you'}
              </p>
            </div>

            {/* Result cards */}
            <div className="flex flex-col gap-2">
              {state.results.map((result) => (
                <ResultCard key={result.id} result={result} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
