import { useCategories } from "@/hooks/api/use-categories";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export default function CategoryRibbon({ activeCategory, onSelect }: {
  activeCategory: string;
  onSelect: (cat: string) => void
}) {
  const { categories, isLoading } = useCategories('product');

  if (isLoading) return (
    <div className="flex justify-center p-4">
      <Loader2 className="animate-spin text-orange-500" size={20} />
    </div>
  );

  return (
    <div className="w-full border-b bg-white/80 backdrop-blur-md sticky top-16 z-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* CUSTOM SCROLLBAR LOGIC:
            1. overflow-x-auto: enables horizontal scrolling
            2. scrollbar-thin: (for Firefox) makes it slim
            3. scrollbar-custom: (our custom class defined below)
        */}
        <div className="flex items-center gap-3 overflow-x-auto py-4 scrollbar-base scrollbar-main">
          <button
            onClick={() => onSelect("All")}
            className={cn(
              "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              activeCategory === "All" 
                ? "bg-orange-500 text-white shadow-md" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>

          {categories?.map((cat) => (
            <button
              key={cat}
              onClick={() => onSelect(cat)}
              className={cn(
                "px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                activeCategory === cat
                  ? "bg-orange-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}