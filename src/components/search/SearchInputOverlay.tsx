// src/components/search/SearchInputOverlay.tsx
import { X, History, ArrowLeft, Search as SearchIcon } from 'lucide-react';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  history: any[];
  onDeleteHistory: (id: string) => void;
  onClearAll: () => void;
  onBack: () => void;
  onSearchSubmit: (q: string) => void;
}

export const SearchInputOverlay: React.FC<Props> = ({
  query,
  setQuery,
  history,
  onDeleteHistory,
  onClearAll,
  onBack,
  onSearchSubmit,
}) => {
  return (
    <div className="w-full h-full bg-white p-4 lg:rounded-xl">
      <div className="flex items-center space-x-2 mb-6">
        <button onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-grow relative">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for everything..."
            className="w-full py-3 pl-4 pr-10 border rounded-full focus:ring-orange-500"
          />
          <SearchIcon className="absolute right-4 top-3.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-700">Recent Searches</h3>
        {history.length > 0 && (
          <button onClick={onClearAll} className="text-sm text-orange-500 font-medium">
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-1">
        {history.map((item) => (
          <div
            key={item._id}
            className="flex items-center justify-between group hover:bg-gray-50 p-2 rounded-lg"
          >
            <button
              onClick={() => onSearchSubmit(item.query)}
              className="flex items-center space-x-3 flex-grow text-gray-600"
            >
              <History className="w-4 h-4 text-gray-400" />
              <span>{item.query}</span>
            </button>
            <button
              onClick={() => onDeleteHistory(item._id)}
              className="p-1 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {history.length === 0 && <p className="text-gray-400 text-sm italic">No recent searches</p>}
      </div>
    </div>
  );
};
