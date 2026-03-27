import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search, X, MapPin, Loader2, AlertCircle,
    Building2, Package, Clock, TrendingUp, ArrowRight,
    Sparkles, Star, CheckCircle, Bug,
} from 'lucide-react';
import { aiSearchService, flattenResults, unwrap } from '@/lib/ai-search.service';
import type { AISearchResult } from '@/lib/ai-search.service';

interface SearchContainerProps {
    isSearchOpen: boolean;
    onClose: () => void;
}

const IS_DEV = import.meta.env.DEV;

// ─── Local storage ────────────────────────────────────────────────────────────

const RECENT_KEY = 'ura_recent_searches';
const MAX_RECENT = 6;

const getRecentSearches = (): string[] => {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
};
const saveRecentSearch = (q: string) => {
    const prev = getRecentSearches().filter((s) => s !== q);
    localStorage.setItem(RECENT_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
};
const removeRecentSearch = (q: string) => {
    localStorage.setItem(RECENT_KEY, JSON.stringify(getRecentSearches().filter((s) => s !== q)));
};

const TRENDING = ['Fresh groceries', 'Electronics', 'Hair salon', 'Restaurants near me', 'Clothing'];

// ─── Dev Debug Overlay ────────────────────────────────────────────────────────
// Only renders in development. Shows real API field names so you can identify
// which key holds the product name, image, price, etc.

const DebugOverlay = ({ raw }: { raw: Record<string, unknown> }) => {
    const [open, setOpen] = useState(false);
    const unwrapped = unwrap(raw);

    // Only show string/number/boolean leaf values — skip nested objects/arrays
    const leafEntries = Object.entries(unwrapped).filter(([, v]) =>
        typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean'
    );
    const arrayEntries = Object.entries(unwrapped).filter(([, v]) =>
        Array.isArray(v) && (v as unknown[]).length > 0 && typeof (v as unknown[])[0] === 'string'
    );

    return (
        <div className="mt-1" onClick={(e) => e.stopPropagation()}>
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-mono hover:bg-amber-100 transition-colors"
            >
                <Bug className="w-3 h-3" />
                {open ? 'hide raw fields' : 'show raw fields'}
            </button>

            {open && (
                <div className="mt-1 p-2 bg-gray-950 rounded-lg text-[10px] font-mono max-h-40 overflow-y-auto space-y-0.5">
                    {leafEntries.map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                            <span className="text-cyan-400 flex-shrink-0">{k}:</span>
                            <span className="text-green-300 truncate">{String(v)}</span>
                        </div>
                    ))}
                    {arrayEntries.map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                            <span className="text-cyan-400 flex-shrink-0">{k}[0]:</span>
                            <span className="text-yellow-300 truncate">{String((v as string[])[0])}</span>
                        </div>
                    ))}
                    {leafEntries.length === 0 && arrayEntries.length === 0 && (
                        <span className="text-gray-500">No primitive fields found. Check console for full object.</span>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Result Card ──────────────────────────────────────────────────────────────


const ResultCard = ({
                        result,
                        onSelect,
                    }: {
    result: AISearchResult;
    onSelect: (r: AISearchResult) => void;
}) => {
    const isBusiness = result.type === 'business';

    console.log(result)

    return (
        <div className="border-b border-gray-50 last:border-0">
            <button
                onClick={() => onSelect(result)}
                className="group w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50/60 transition-colors duration-150 text-left"
            >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-100 flex items-center justify-center">
                    {result.image ? (
                        <img
                            src={result.image}
                            alt={result.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                const t = e.target as HTMLImageElement;
                                t.style.display = 'none';
                            }}
                        />
                    ) : isBusiness ? (
                        <Building2 className="w-5 h-5 text-gray-300" />
                    ) : (
                        <Package className="w-5 h-5 text-gray-300" />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
                            {result.name}
                        </span>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wide ${
                            isBusiness ? 'bg-violet-100 text-violet-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                            {isBusiness ? 'Business' : 'Product'}
                        </span>
                    </div>

                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                        {result.subtitle && (
                            <span className="text-xs text-gray-400 truncate max-w-[160px]">
                                {isBusiness ? result.subtitle : `by ${result.subtitle}`}
                            </span>
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
                            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${
                                result.inStock ? 'text-green-500' : 'text-red-400'
                            }`}>
                                <CheckCircle className="w-3 h-3" />
                                {result.inStock ? 'In stock' : 'Out of stock'}
                            </span>
                        )}
                    </div>
                </div>

                <ArrowRight className="flex-shrink-0 w-4 h-4 text-gray-200 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* ── DEV ONLY: raw field inspector ─────────────────────── */}
            {IS_DEV && (
                <div className="px-4 pb-2">
                    <DebugOverlay raw={result.raw} />
                </div>
            )}
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
    const [results, setResults] = useState<AISearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const [useGeo, setUseGeo] = useState(false);
    const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

    useEffect(() => {
        if (isSearchOpen) {
            setRecentSearches(getRecentSearches());
            setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
        if (isSearchOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isSearchOpen]);

    useEffect(() => {
        document.body.style.overflow = isSearchOpen ? 'hidden' : '';
        return () => { document.body.style.overflow = ''; };
    }, [isSearchOpen]);

    const handleClose = () => {
        onClose();
        setTimeout(() => {
            setQuery('');
            setResults([]);
            setHasSearched(false);
            setError(null);
        }, 200);
    };

    const toggleGeo = () => {
        if (!useGeo) {
            navigator.geolocation?.getCurrentPosition(
                (pos) => { setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setUseGeo(true); },
                () => setUseGeo(false)
            );
        } else {
            setUseGeo(false);
            setUserCoords(null);
        }
    };

    const runSearch = useCallback(async (q: string) => {
        if (!q.trim()) { setResults([]); setHasSearched(false); return; }
        setIsLoading(true);
        setError(null);
        try {
            const res = await aiSearchService.textSearch({
                q,
                ...(useGeo && userCoords ? { lat: userCoords.lat, lng: userCoords.lng, radius_km: 10 } : {}),
            });
            setResults(flattenResults(res.results));
            setHasSearched(true);
        } catch {
            setError('Search failed. Please try again.');
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    }, [useGeo, userCoords]);

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
        saveRecentSearch(query.trim());
        setRecentSearches(getRecentSearches());
        runSearch(query.trim());
    };

    const handleSuggestionClick = (q: string) => {
        setQuery(q);
        saveRecentSearch(q);
        setRecentSearches(getRecentSearches());
        if (debounceRef.current) clearTimeout(debounceRef.current);
        runSearch(q);
    };

    const handleResultSelect = (result: AISearchResult) => {
        if (query.trim()) saveRecentSearch(query.trim());
        handleClose();
        navigate(result.type === 'business'
            ? `/dashboard/profile/business/${result.id}`
            : `/dashboard/deal-offer/${result.id}`
        );
    };

    const clearQuery = () => {
        setQuery('');
        setResults([]);
        setHasSearched(false);
        setError(null);
        inputRef.current?.focus();
    };

    const handleRemoveRecent = (e: React.MouseEvent, q: string) => {
        e.stopPropagation();
        removeRecentSearch(q);
        setRecentSearches(getRecentSearches());
    };

    if (!isSearchOpen) return null;

    const showSuggestions = !hasSearched && !isLoading;

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-50 flex flex-col items-center pt-[72px] px-4 pb-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onMouseDown={(e) => { if (e.target === overlayRef.current) handleClose(); }}
        >
            <div
                className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                style={{ maxHeight: 'calc(100vh - 100px)' }}
            >
                {/* ── Search bar ─────────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="flex-shrink-0">
                        {isLoading
                            ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                            : <Search className="w-5 h-5 text-gray-400" />
                        }
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
                        <button type="button" onClick={toggleGeo}
                                className={`p-2 rounded-lg transition-colors ${useGeo ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
                        >
                            <MapPin className="w-4 h-4" />
                        </button>
                        {query && (
                            <button type="button" onClick={clearQuery}
                                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                        <button type="button" onClick={handleClose}
                                className="ml-1 p-2 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </form>

                {useGeo && userCoords && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-b border-blue-100">
                        <MapPin className="w-3.5 h-3.5 text-blue-500" />
                        <span className="text-xs text-blue-600 font-medium">Searching within 10 km of your location</span>
                    </div>
                )}

                {/* DEV banner */}
                {IS_DEV && (
                    <div className="flex items-center gap-2 px-4 py-1.5 bg-amber-50 border-b border-amber-100">
                        <Bug className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] text-amber-700 font-mono">
                            DEV MODE — click "show raw fields" on any result to inspect API field names
                        </span>
                    </div>
                )}

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
                                        <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Recent</span>
                                        <button onClick={() => { localStorage.removeItem(RECENT_KEY); setRecentSearches([]); }}
                                                className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
                                        >Clear all</button>
                                    </div>
                                    {recentSearches.map((q) => (
                                        <button key={q} onClick={() => handleSuggestionClick(q)}
                                                className="group w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                                        >
                                            <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                            <span className="flex-1 text-sm text-gray-600 text-left truncate">{q}</span>
                                            <span role="button" tabIndex={0}
                                                  onClick={(e) => handleRemoveRecent(e, q)}
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
                                    <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Trending</span>
                                </div>
                                {TRENDING.map((q) => (
                                    <button key={q} onClick={() => handleSuggestionClick(q)}
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
                                    {results.length} AI Result{results.length !== 1 ? 's' : ''}
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
                            <p className="text-xs text-gray-400 mt-1.5">Try a broader term or check your spelling</p>
                        </div>
                    )}
                </div>

                {/* ── Footer ──────────────────────────────────────────── */}
                <div className="border-t border-gray-100 px-4 py-2.5 flex items-center gap-4">
                    <span className="text-[11px] text-gray-400">
                        Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-500 text-[10px]">Enter</kbd> to search
                    </span>
                    <span className="text-[11px] text-gray-400">
                        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-gray-500 text-[10px]">Esc</kbd> to close
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