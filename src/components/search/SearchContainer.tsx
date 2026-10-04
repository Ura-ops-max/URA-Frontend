import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  X,
  MapPin,
  Loader2,
  AlertCircle,
  Building2,
  Package,
  Clock,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Star,
  CheckCircle,
  User,
  FileText,
} from 'lucide-react';
import { searchAPI, fetchProductCategories } from '@/lib/api';

interface SearchContainerProps {
  isSearchOpen: boolean;
  onClose: () => void;
}

// ─── Result type ──────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  type: 'business' | 'product' | 'user' | 'post';
  name: string;
  subtitle: string;
  image: string | null;
  price: number | null;
  rating: number | null;
  location: string | null;
  inStock: boolean | null;
  url: string;
}

function flattenBackendResults(data: any): SearchResult[] {
  const flat: SearchResult[] = [];

  for (const biz of data?.businesses ?? []) {
    flat.push({
      id: biz._id,
      type: 'business',
      name: biz.businessName ?? 'Unnamed Business',
      subtitle: biz.category ?? '',
      image: biz.businessLogo ?? null,
      price: null,
      rating: biz.averageRating ?? null,
      location: biz.address?.fullAddress ?? biz.address?.city ?? null,
      inStock: null,
      // Open business page (works signed out); old profile page as fallback.
      url: biz.slug ? `/${biz.slug}` : `/dashboard/profile/business/${biz._id}`,
    });
  }

  for (const user of data?.users ?? []) {
    flat.push({
      id: user._id,
      type: 'user',
      name: user.fullName ?? user.username ?? 'Unknown User',
      subtitle: `@${user.username ?? ''}`,
      image: user.profilePicture ?? null,
      price: null,
      rating: null,
      location: null,
      inStock: null,
      url: `/dashboard/profile/user/${user._id}`,
    });
  }

  for (const prod of data?.products ?? []) {
    const img = Array.isArray(prod.media) ? prod.media[0] : null;
    flat.push({
      id: prod._id,
      type: 'product',
      name: prod.name ?? 'Unnamed Product',
      subtitle: prod.category ?? '',
      image: img ?? null,
      price: prod.price ?? null,
      rating: prod.averageRating ?? null,
      location: null,
      inStock: typeof prod.stock === 'number' ? prod.stock > 0 : null,
      url: `/dashboard/product/${prod._id}`,
    });
  }

  for (const post of data?.posts ?? []) {
    const img = Array.isArray(post.media) ? post.media[0] : null;
    flat.push({
      id: post._id,
      type: 'post',
      name: post.caption ?? 'Post',
      subtitle: post.author?.username ? `@${post.author.username}` : '',
      image: img ?? null,
      price: null,
      rating: null,
      location: null,
      inStock: null,
      url: `/posts/${post._id}`,
    });
  }

  return flat;
}

const TRENDING = [
  'Fresh groceries',
  'Electronics',
  'Hair salon',
  'Restaurants near me',
  'Clothing',
];

const TYPE_META: Record<string, { label: string; badgeCls: string }> = {
  business: { label: 'Business', badgeCls: 'bg-violet-100 text-violet-600' },
  product:  { label: 'Product',  badgeCls: 'bg-emerald-100 text-emerald-600' },
  user:     { label: 'User',     badgeCls: 'bg-sky-100 text-sky-600' },
  post:     { label: 'Post',     badgeCls: 'bg-rose-100 text-rose-600' },
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === 'business') return <Building2 className="w-5 h-5 text-gray-300" />;
  if (type === 'user')     return <User       className="w-5 h-5 text-gray-300" />;
  if (type === 'post')     return <FileText   className="w-5 h-5 text-gray-300" />;
  return <Package className="w-5 h-5 text-gray-300" />;
};

const ResultCard = ({
  result,
  onSelect,
}: {
  result: SearchResult;
  onSelect: (r: SearchResult) => void;
}) => {
  const meta = TYPE_META[result.type] ?? TYPE_META.product;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => onSelect(result)}
        className="group w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/60 transition-colors duration-150 text-left"
      >
        <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
          {result.image ? (
            <img
              src={result.image}
              alt={result.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <TypeIcon type={result.type} />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
              {result.name}
            </span>
            <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${meta.badgeCls}`}>
              {meta.label}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            {result.subtitle && (
              <span className="text-xs text-gray-400 truncate max-w-[160px]">{result.subtitle}</span>
            )}
            {result.price !== null && (
              <span className="text-xs font-semibold text-orange-500">
                ₦{result.price.toLocaleString()}
              </span>
            )}
            {result.rating !== null && result.rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs font-medium text-amber-500">
                <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                {result.rating.toFixed(1)}
              </span>
            )}
            {result.location && (
              <span className="flex items-center gap-0.5 text-xs text-gray-400 truncate max-w-[120px]">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                {result.location}
              </span>
            )}
            {result.inStock !== null && (
              <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${result.inStock ? 'text-green-500' : 'text-red-400'}`}>
                <CheckCircle className="w-3 h-3" />
                {result.inStock ? 'In stock' : 'Out of stock'}
              </span>
            )}
          </div>
        </div>

        <ArrowRight className="flex-shrink-0 w-4 h-4 text-gray-200 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
      </button>
    </div>
  );
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SearchContainer({ isSearchOpen, onClose }: SearchContainerProps) {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ _id: string; query: string }[]>([]);
  // Trending = real product categories that actually have items, so clicking one
  // always returns results. Falls back to the static list if none load.
  const [trending, setTrending] = useState<string[]>(TRENDING);

  const fetchRecentSearches = useCallback(async () => {
    try {
      const res = await searchAPI.getRecentSearches();
      setRecentSearches(res.data.data ?? []);
    } catch {
      // ignore — history is non-critical
    }
  }, []);

  const fetchTrending = useCallback(async () => {
    try {
      const categories = await fetchProductCategories();
      if (Array.isArray(categories) && categories.length) {
        setTrending(categories.filter(Boolean).slice(0, 6));
      }
    } catch {
      // keep the static fallback
    }
  }, []);

  useEffect(() => {
    if (isSearchOpen) {
      fetchRecentSearches();
      fetchTrending();
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isSearchOpen, fetchRecentSearches, fetchTrending]);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isSearchOpen) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isSearchOpen, handleClose]);

  useEffect(() => {
    document.body.style.overflow = isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isSearchOpen]);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    setIsLoading(true);
    setError(null);
    try {
      const res = await searchAPI.getGlobalSearch({ q });
      setResults(flattenBackendResults(res.data.data));
      setHasSearched(true);
    } catch {
      setError('Search failed. Please try again.');
      setHasSearched(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(val), 400);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchAPI.saveToHistory(query.trim()).then(fetchRecentSearches).catch(() => {});
    runSearch(query.trim());
  };

  const handleSuggestionClick = (q: string) => {
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchAPI.saveToHistory(q).then(fetchRecentSearches).catch(() => {});
    runSearch(q);
  };

  const handleResultSelect = (result: SearchResult) => {
    if (query.trim()) searchAPI.saveToHistory(query.trim()).catch(() => {});
    handleClose();
    navigate(result.url);
  };

  const clearQuery = () => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    inputRef.current?.focus();
  };

  const handleRemoveRecent = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      await searchAPI.deleteHistoryItem(id);
      setRecentSearches((prev) => prev.filter((r) => r._id !== id));
    } catch {
      // ignore
    }
  };

  if (!isSearchOpen) return null;

  const showSuggestions = !hasSearched && !isLoading;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex flex-col items-center pt-[72px] px-4 pb-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onMouseDown={(e) => {
        if (e.target === overlayRef.current) handleClose();
      }}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        style={{ maxHeight: 'calc(100vh - 100px)' }}
      >
        {/* ── Search bar ─────────────────────────────────────── */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"
        >
          <div className="flex-shrink-0">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleQueryChange}
            placeholder="Search businesses, products, services…"
            className="flex-1 bg-transparent text-[15px] text-gray-900 placeholder-gray-400 outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <div className="flex items-center gap-1">
            {query && (
              <button
                type="button"
                onClick={clearQuery}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="ml-1 p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {error && (
            <div className="flex items-center gap-2.5 mx-4 my-3 px-4 py-3 bg-red-50 rounded-xl text-sm text-red-600">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {showSuggestions && (
            <div className="py-2">
              {recentSearches.length > 0 && (
                <div className="mb-1">
                  <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                      Recent
                    </span>
                    <button
                      onClick={async () => {
                        try { await searchAPI.clearAllHistory(); } catch { /* ignore */ }
                        setRecentSearches([]);
                      }}
                      className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  {recentSearches.map((item) => (
                    <button
                      key={item._id}
                      onClick={() => handleSuggestionClick(item.query)}
                      className="group w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                      <span className="flex-1 text-sm text-gray-600 text-left truncate">{item.query}</span>
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(e) => handleRemoveRecent(e, item._id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 transition-all"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div>
                <div className="px-4 pt-3 pb-1.5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                    Trending
                  </span>
                </div>
                {trending.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSuggestionClick(q)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{q}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="py-3 px-4 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0" />
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2.5 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && hasSearched && results.length > 0 && (
            <div className="py-2">
              <div className="flex items-center gap-2 px-4 pt-2 pb-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  {results.length} Result{results.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                {results.map((result) => (
                  <ResultCard key={result.id} result={result} onSelect={handleResultSelect} />
                ))}
              </div>
            </div>
          )}

          {!isLoading && hasSearched && results.length === 0 && !error && (
            <div className="flex flex-col items-center justify-center py-14 text-center px-6">
              <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-gray-300" />
              </div>
              <p className="text-sm font-semibold text-gray-700">No results for "{query}"</p>
              <p className="text-xs text-gray-400 mt-1.5">
                Try a broader term or check your spelling
              </p>
            </div>
          )}
        </div>

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-4">
          <span className="text-[11px] text-gray-400">
            Press{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-500 text-[10px]">
              Enter
            </kbd>{' '}
            to search
          </span>
          <span className="text-[11px] text-gray-400">
            <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-500 text-[10px]">
              Esc
            </kbd>{' '}
            to close
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-gray-300">
            <Sparkles className="w-3 h-3 text-amber-300" />
            Powered by AI
          </span>
        </div>
      </div>
    </div>
  );
}
