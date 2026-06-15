// components/bookmarks/BookmarkBusinessCard.tsx
import { Link } from 'react-router-dom';
import { CheckCircle2, Star, Bookmark, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToggleBookmark } from '@/hooks/api/use-feed'; // Your existing hook
import { generateAvatarUrl } from '@/utils/avatar-generator';

export const BookmarkBusinessCard = ({ biz }: { biz: any }) => {
  // ✅ This works! The hook is at the top level of THIS component.
  // We pass the biz._id and 'Business' just like your other pages do.
  const { mutate: toggleBookmark } = useToggleBookmark(biz._id, 'Business');

  return (
    <div className="group bg-white p-5 rounded-[24px] border border-gray-100 transition-all hover:shadow-xl hover:border-orange-100 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="relative">
          <img
            src={biz.businessLogo || generateAvatarUrl(biz.businessName)}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-gray-50 shadow-sm"
            alt=""
          />
          {biz.isVerified && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <CheckCircle2 size={14} className="fill-blue-500 text-white" />
            </div>
          )}
        </div>

        <div className="space-y-0.5">
          <h3 className="font-black text-gray-900 text-base group-hover:text-orange-600 transition-colors">
            {biz.businessName}
          </h3>
          <div className="flex items-center gap-1 text-[10px] text-gray-400 font-bold uppercase">
            <Star size={12} className="fill-yellow-400 text-yellow-400 border-none" />
            <span>4.9 (120 reviews)</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleBookmark(); // ✅ No arguments needed here, hook already has them
          }}
          className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all"
        >
          <Bookmark size={20} fill="currentColor" />
        </button>

        <Link to={`/dashboard/profile/business/${biz._id}`}>
          <Button variant="ghost" className="rounded-xl h-11 w-11 p-0 text-gray-400">
            <ExternalLink size={18} />
          </Button>
        </Link>
      </div>
    </div>
  );
};
