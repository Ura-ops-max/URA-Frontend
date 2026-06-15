// src/components/shared/TagInput.tsx
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (val: string) => void;
  placeholder?: string;
}

export const TagInput = ({ tags, setTags, tagInput, setTagInput, placeholder }: TagInputProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(',', '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="space-y-2 w-full">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 py-1">
          {tags.map((tag) => (
            <Badge
              key={tag}
              className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none flex items-center gap-1 px-2 py-1 text-xs"
            >
              #{tag}
              <button
                type="button" // Critical: prevents form submission
                onClick={(e) => {
                  e.preventDefault();
                  removeTag(tag);
                }}
              >
                <X size={12} className="hover:text-red-500" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <input
        autoFocus
        value={tagInput}
        onChange={(e) => setTagInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || 'Type and press enter...'}
        className="text-xs w-full bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2.5 outline-none focus:border-orange-400 transition-all"
      />
    </div>
  );
};
