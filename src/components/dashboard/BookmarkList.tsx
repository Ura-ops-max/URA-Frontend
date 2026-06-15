import {
  Bookmark as BookmarkIcon,
  ArrowRight,
  Image as ImageIcon,
  Briefcase,
  Star,
  Loader2,
} from 'lucide-react';
import { generateAvatarUrl } from '@/utils/avatar-generator';
import { Link } from 'react-router-dom';

interface BookmarkListProps {
  bookmarks: any[];
  isLoading: boolean;
  isError: boolean;
}

const BookmarkList: React.FC<BookmarkListProps> = ({ bookmarks, isLoading, isError }) => {
  if (isLoading) {
    return (
      <div className="py-14 flex flex-col items-center justify-center opacity-40">
        <Loader2 className="h-6 w-6 animate-spin text-[#f97316] mb-2" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
          Loading saved items...
        </p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center">
        <p className="text-[11px] font-black uppercase tracking-widest text-rose-500 opacity-80">
          Failed to load bookmarks
        </p>
      </div>
    );
  }

  // Dashboard restriction: top 6
  const displayBookmarks = bookmarks.slice(0, 6);
  const hasMore = bookmarks.length > 6;

  return (
    <div className="flex flex-col max-h-[280px] w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 mb-2 shrink-0">
        <h3 className="font-bold text-[16px] tracking-tight text-slate-900">Saved Items</h3>
        <button className="text-[10px] font-black uppercase tracking-widest text-[#f97316] hover:opacity-70 transition-all">
          View All
        </button>
      </div>

      {/* Scrollable Content Area - matched with ActivityPanel scrollbar classes */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-1 scrollbar-base scrollbar-main">
        {bookmarks.length === 0 ? (
          <div className="py-14 flex flex-col items-center justify-center opacity-30">
            <BookmarkIcon strokeWidth={1.2} size={32} className="mb-2 text-slate-400" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-center">
              No bookmarks found
            </p>
          </div>
        ) : (
          displayBookmarks.map((bm) => <BookmarkItem key={bm._id} item={bm} />)
        )}
      </div>

      {/* View All Footer */}
      {hasMore && (
        <div className="pt-3 shrink-0">
          <Link
            to="/dashboard/bookmarks"
            className="w-full py-3.5 rounded-[20px] border border-dashed border-slate-200 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/60 hover:text-[#f97316] hover:border-[#f97316]/40 transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md"
          >
            Manage all bookmarks
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      )}
    </div>
  );
};

const BookmarkItem = ({ item }: { item: any }) => {
  const isBusiness = !!item.businessName;

  const visualImage = isBusiness
    ? item.businessLogo
    : item.media && item.media.length > 0
      ? item.media[0]
      : item.displayAvatar || generateAvatarUrl(`${item.displayName}`);

  const title = isBusiness ? item.businessName : item.caption || 'Untitled Post';

  const subText = isBusiness
    ? item.category || 'Verified Business'
    : `Shared by ${item.displayName || 'User'}`;

  return (
    <div className="group flex items-center gap-4 p-3 rounded-[22px] transition-all duration-300 hover:bg-white/70 active:scale-[0.98] cursor-pointer">
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-[14px] overflow-hidden border-2 border-white shadow-sm bg-slate-100 ring-1 ring-slate-200/50">
          {visualImage ? (
            <img
              src={visualImage}
              alt={title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
              {isBusiness ? <Briefcase size={18} /> : <ImageIcon size={18} />}
            </div>
          )}
        </div>

        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm border border-slate-50">
          {isBusiness ? (
            <Briefcase size={9} className="text-[#f97316]" />
          ) : item.type === 'PRODUCT' ? (
            <Star size={9} className="text-amber-500 fill-amber-500" />
          ) : (
            <ImageIcon size={9} className="text-blue-500" />
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[13.5px] font-bold text-slate-900 truncate tracking-tight group-hover:text-[#f97316] transition-colors duration-300">
          {title}
        </h4>
        <p className="text-[11px] text-slate-400 truncate font-semibold tracking-tight mt-0.5 uppercase">
          {subText}
        </p>
      </div>
    </div>
  );
};

export default BookmarkList;
