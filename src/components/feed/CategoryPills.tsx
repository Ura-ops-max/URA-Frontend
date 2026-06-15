import { useCategories } from '@/hooks/api/use-categories';
import { cn } from '@/lib/utils';

interface CategoryPillsProps {
  selected: string;
  onSelect: (category: string) => void;
}

export const CategoryPills = ({ selected, onSelect }: CategoryPillsProps) => {
  // Destructure 'categories' and rename it to 'CATEGORIES'
  const { categories: CATEGORIES, isLoading } = useCategories('product');

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-9 w-20 bg-gray-100 animate-pulse rounded-full shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
      {/* Logic: Add "All" manually if it's not in your DB categories */}
      <button
        onClick={() => onSelect('All')}
        className={cn(
          'whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all border',
          selected === 'All'
            ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
            : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200',
        )}
      >
        All
      </button>

      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onSelect(cat)}
          className={cn(
            'whitespace-nowrap px-6 py-2.5 rounded-full text-xs font-bold transition-all border',
            selected === cat
              ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-100'
              : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200',
          )}
        >
          {cat}
        </button>
      ))}
    </div>
  );
};
