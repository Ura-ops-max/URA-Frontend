import { ArrowLeft, Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { BusinessItem, UserItem, ProductItem, PostItem } from './SearchItems';
import { SearchFilters } from './SearchFilter';

interface SearchResultsProps {
  query: string;
  setQuery: (q: string) => void;
  results: any;
  isLoading: boolean;
  activeType: 'all' | 'user' | 'business' | 'post' | 'product';
  setActiveType: (type: any) => void;
  onBack: () => void;
  onResultClick: (itemQuery: string, targetUrl: string) => void;
  onFilterToggle: () => void;
  isFilterVisible: boolean;
  filters: any; // New
  setFilters: any; // New
}

const SearchResults: React.FC<SearchResultsProps> = ({
  query,
  setQuery,
  results,
  isLoading,
  activeType,
  setActiveType,
  onBack,
  onResultClick,
  onFilterToggle,
  isFilterVisible,
  filters,
  setFilters, // Destructure new props
}) => {
  const searchData = results?.data || results || {};

  const hasResults =
    searchData.businesses?.length > 0 ||
    searchData.users?.length > 0 ||
    searchData.products?.length > 0 ||
    searchData.posts?.length > 0;

  console.log(results);
  return (
    <div className="w-full min-h-screen bg-white flex flex-col relative">
      {/* 1. HEADER */}
      <div className="sticky top-0 bg-white z-30 border-b">
        <div className="flex items-center space-x-2 p-4">
          <button onClick={onBack} className="p-1">
            <ArrowLeft />
          </button>
          <div className="flex-grow relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full py-2 pl-4 pr-10 border rounded-full outline-none focus:border-orange-500"
            />
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          {/* Filter Button - Now visible on all screens */}
          <button
            onClick={onFilterToggle}
            className={`p-2 rounded-full transition-colors ${isFilterVisible ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {/* TABS */}
        <div className="flex space-x-6 px-6 overflow-x-auto no-scrollbar border-t">
          {['all', 'business', 'user', 'product', 'post'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveType(tab)}
              className={`py-3 text-sm font-medium capitalize border-b-2 transition-colors whitespace-nowrap ${
                activeType === tab
                  ? 'border-orange-500 text-orange-500'
                  : 'border-transparent text-gray-500'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow flex">
        {/* ... inside the SIDEBAR FILTERS (Desktop) ... */}
        <div
          className={`hidden lg:block border-r transition-all duration-300 ${isFilterVisible ? 'w-64 p-6' : 'w-0 overflow-hidden border-none'}`}
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold">Filters</h3>
            <button onClick={() => setFilters({})} className="text-xs text-orange-500">
              Reset
            </button>
          </div>
          <SearchFilters activeType={activeType} filters={filters} setFilters={setFilters} />
        </div>

        {/* 3. MAIN RESULTS AREA */}
        <div className="flex-grow p-4 lg:p-6 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center py-20 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2" />
              <p>Loading...</p>
            </div>
          ) : !hasResults ? (
            <div className="text-center py-20">
              <SearchIcon className="mx-auto text-gray-200 w-16 h-16 mb-4" />
              <h3 className="text-gray-800 font-bold">No results found</h3>
              <p className="text-gray-500 text-sm">Try adjusting your search for "{query}"</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-8">
              {/* BUSINESSES */}
              {(activeType === 'all' || activeType === 'business') &&
                searchData.businesses?.map((b: any) => (
                  <BusinessItem
                    key={b._id}
                    biz={b}
                    onClick={() =>
                      onResultClick(
                        b.businessName,
                        b.slug ? `/${b.slug}` : `/dashboard/profile/business/${b._id}`,
                      )
                    }
                  />
                ))}

              {/* USERS */}
              {(activeType === 'all' || activeType === 'user') &&
                searchData.users?.map((u: any) => (
                  <UserItem
                    key={u._id}
                    user={u}
                    onClick={() => onResultClick(u.username, `/dashboard/profile/user/${u._id}`)}
                  />
                ))}

              {/* PRODUCTS */}
              {(activeType === 'all' || activeType === 'product') &&
                searchData.products?.map((p: any) => (
                  <ProductItem
                    key={p._id}
                    prod={p}
                    onClick={() => onResultClick(p.name, `/dashboard/product/${p._id}`)}
                  />
                ))}

              {/* POSTS (Added this section) */}
              {(activeType === 'all' || activeType === 'post') &&
                searchData.posts?.map((post: any) => (
                  <PostItem
                    key={post._id}
                    post={post}
                    onClick={() => onResultClick(post.caption, `/post/${post._id}`)}
                  />
                ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. MOBILE FILTER OVERLAY */}
      {isFilterVisible && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onFilterToggle} />

          {/* Changed h-[60vh] to max-h-[85vh] and added flex-col */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 max-h-[85vh] flex flex-col shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />{' '}
            {/* Pull-down handle UI */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Filters</h3>
              <button onClick={onFilterToggle} className="p-2 bg-gray-50 rounded-full">
                <X size={20} />
              </button>
            </div>
            {/* The filter component itself is now scrollable inside this flex container */}
            <div className="flex-grow overflow-y-auto">
              <SearchFilters activeType={activeType} filters={filters} setFilters={setFilters} />
            </div>
            <div className="pt-4 mt-2 border-t border-gray-100">
              <button
                onClick={onFilterToggle}
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-200 active:scale-95 transition-transform"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResults;
