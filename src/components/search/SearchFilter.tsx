import { useCategories } from '@/hooks/api/use-categories';
import React from 'react';
import { Clock, Star, CheckCircle, Package } from 'lucide-react'; // Assuming lucide-react for icons

interface FilterProps {
  activeType: string;
  filters: any;
  setFilters: (filters: any) => void;
}

export const SearchFilters: React.FC<FilterProps> = ({ activeType, filters, setFilters }) => {
  const { categories, isLoading } = useCategories(
    activeType === 'business' ? 'business' : 'product',
  );

  const updateFilter = (key: string, value: any) => {
    // Toggle logic: if clicking the same value, clear it (optional but good UX)
    const newValue = filters[key] === value ? undefined : value;
    setFilters({ ...filters, [key]: newValue });
  };

  const renderRatingFilter = () => (
    <div className="mt-6 pt-4 border-t border-gray-100">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-3">
        <Star size={12} /> Minimum Rating
      </label>
      <div className="flex items-center justify-between bg-gray-50 p-1.5 rounded-xl">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateFilter('rating', star)}
            className={`flex flex-col items-center justify-center w-10 h-10 rounded-lg transition-all ${
              filters.rating >= star
                ? 'bg-orange-500 text-white shadow-md scale-105'
                : 'text-gray-400 hover:bg-gray-100'
            }`}
          >
            <span className="text-xs font-bold">{star}</span>
            <span className="text-[10px]">★</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderBusinessFilters = () => (
    <div className="space-y-6">
      {/* Quick Toggles */}
      <div className="space-y-3">
        <button
          onClick={() => updateFilter('openNow', filters.openNow ? undefined : 'true')}
          className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
            filters.openNow === 'true'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <Clock
              size={16}
              className={filters.openNow === 'true' ? 'text-orange-500' : 'text-gray-400'}
            />
            <span className="text-sm font-medium text-gray-700">Open Now</span>
          </div>
          <div
            className={`w-8 h-4 rounded-full relative transition-colors ${filters.openNow === 'true' ? 'bg-orange-500' : 'bg-gray-200'}`}
          >
            <div
              className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${filters.openNow === 'true' ? 'left-4.5' : 'left-0.5'}`}
            />
          </div>
        </button>

        <button
          onClick={() => updateFilter('isVerified', !filters.isVerified)}
          className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
            filters.isVerified ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100'
          }`}
        >
          <div className="flex items-center gap-3">
            <CheckCircle
              size={16}
              className={filters.isVerified ? 'text-blue-500' : 'text-gray-400'}
            />
            <span className="text-sm font-medium text-gray-700">Verified Only</span>
          </div>
        </button>
      </div>

      {renderRatingFilter()}
    </div>
  );

  const renderPostFilters = () => (
    <div className="space-y-6">
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
          Trending Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {['Promotions', 'NewArrival', 'Discounts', 'Events', 'Restock'].map((tag) => {
            // Check if tag is already in the comma-separated string
            const activeTags = filters.tags ? filters.tags.split(',') : [];
            const isActive = activeTags.includes(tag);

            return (
              <button
                key={tag}
                onClick={() => {
                  let newTags;
                  if (isActive) {
                    newTags = activeTags.filter((t: string) => t !== tag).join(',');
                  } else {
                    newTags = [...activeTags, tag].join(',');
                  }
                  updateFilter('tags', newTags || undefined);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs transition-all border ${
                  isActive
                    ? 'bg-orange-500 border-orange-500 text-white shadow-sm'
                    : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                }`}
              >
                #{tag}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-gray-400 mt-2 italic">
          Posts matching all selected tags will appear.
        </p>
      </div>
    </div>
  );

  const renderUserFilters = () => (
    <div className="space-y-6">
      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
        Account Type
      </label>
      <div className="flex flex-col gap-3">
        <button
          onClick={() =>
            updateFilter('isBusiness', filters.isBusiness === 'false' ? undefined : 'false')
          }
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            filters.isBusiness === 'false'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-gray-100'
          }`}
        >
          <span className="text-sm font-medium text-gray-700">Regular Users</span>
          {filters.isBusiness === 'false' && <CheckCircle size={16} className="text-orange-500" />}
        </button>

        <button
          onClick={() =>
            updateFilter('isBusiness', filters.isBusiness === 'true' ? undefined : 'true')
          }
          className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
            filters.isBusiness === 'true'
              ? 'bg-orange-50 border-orange-200'
              : 'bg-white border-gray-100'
          }`}
        >
          <span className="text-sm font-medium text-gray-700">Business Owners</span>
          {filters.isBusiness === 'true' && <CheckCircle size={16} className="text-orange-500" />}
        </button>
      </div>
    </div>
  );

  const renderProductFilters = () => (
    <div className="space-y-6">
      {/* Category Section */}
      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
          Categories
        </label>
        <div className="flex flex-wrap gap-2">
          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition-all border ${
                filters.category === cat
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-orange-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
          Price Range
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-gray-400 text-xs">₦</span>
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice || ''}
              className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <span className="absolute left-3 top-2 text-gray-400 text-xs">₦</span>
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice || ''}
              className="w-full border border-gray-100 bg-gray-50 rounded-xl pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => updateFilter('inStock', filters.inStock === 'true' ? undefined : 'true')}
        className={`flex items-center justify-between w-full p-3 rounded-xl border transition-all ${
          filters.inStock === 'true' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <Package
            size={16}
            className={filters.inStock === 'true' ? 'text-green-500' : 'text-gray-400'}
          />
          <span className="text-sm font-medium text-gray-700">In Stock Only</span>
        </div>
      </button>

      {renderRatingFilter()}
    </div>
  );

  return (
    <div className="animate-in fade-in slide-in-from-left-2 duration-300 h-full overflow-y-auto pr-2 custom-scrollbar">
      {isLoading ? (
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-100 animate-pulse rounded" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-16 bg-gray-50 animate-pulse rounded-full" />
            ))}
          </div>
        </div>
      ) : (
        <div className="pb-10">
          {' '}
          {/* Extra padding at bottom for better scrolling */}
          {activeType === 'business' && renderBusinessFilters()}
          {activeType === 'product' && renderProductFilters()}
          {activeType === 'post' && renderPostFilters()}
          {activeType === 'user' && renderUserFilters()}
          {activeType === 'all' && (
            <div className="text-center py-10 px-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                Switch tabs to unlock specific filters for Businesses, Products, or Users.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
